#!/usr/bin/env node
/* eslint-disable no-console */
// scripts/heal-curriculum.mjs
//
// ============================================================================
//  OTONOM SELF-HEALING CODEMOD — "zombi" müfredat verisini otomatik temizler
// ============================================================================
//
//  KÖK NEDEN: Geçmişte ders/kademe listeleri bileşenlerin içine elle yazıldığı
//  için her hatada kullanıcı dosya arayıp silmek zorunda kalıyordu. Bu betik o
//  döngüyü KALDIRIR: tek doğruluk kaynağı data/curriculum.json'dur; bu betik
//  proje genelini tarar, sabit (hardcoded) müfredat dizisi bulduğu HER .ts/.tsx
//  dosyasını otomatik olarak merkezi kaynağa bağlar ve dosyayı ÜZERİNE YAZAR.
//
//  KULLANIM (proje kökünde):
//     node scripts/heal-curriculum.mjs           # tara, otomatik onar (overwrite)
//     node scripts/heal-curriculum.mjs --check    # sadece denetle (CI; bulursa exit 1)
//
//  Bağımlılık YOK. Sadece Node.js gerekir.
// ----------------------------------------------------------------------------

import {
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  existsSync,
} from "node:fs";
import { join, extname } from "node:path";

const CHECK_ONLY = process.argv.includes("--check");
const ROOT = process.cwd();

// ---- 1) Merkezi kaynağı bul ----------------------------------------------
function findDataFile(start) {
  const direct = join(start, "data", "curriculum.json");
  if (existsSync(direct)) return direct;
  // alt klasörlerde ara (monorepo / frontend alt dizini)
  const stack = [start];
  while (stack.length) {
    const dir = stack.pop();
    let entries = [];
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      if (e.isDirectory()) {
        if (/node_modules|\.next|\.git/.test(e.name)) continue;
        const p = join(dir, e.name);
        if (e.name === "data" && existsSync(join(p, "curriculum.json")))
          return join(p, "curriculum.json");
        stack.push(p);
      }
    }
  }
  return null;
}

const DATA_FILE = findDataFile(ROOT);
if (!DATA_FILE) {
  console.error(
    "⛔ data/curriculum.json bulunamadı. Betiği proje kökünde çalıştırın.",
  );
  process.exit(2);
}

const data = JSON.parse(readFileSync(DATA_FILE, "utf8"));
const uniq = (a) => Array.from(new Set(a));
const ALL_SUBJECTS = uniq(data.stages.flatMap((s) => s.subjects));
const ALL_LEVELS = uniq(data.stages.flatMap((s) => s.levels));
const ALL_STAGES = data.stages.map((s) => s.key);

// Sabit dizi imzasını yakalamak için kullanılan "müfredat parmak izi" terimleri
const FINGERPRINT = uniq([
  ...ALL_SUBJECTS,
  ...ALL_LEVELS,
  ...ALL_STAGES,
  "Matematik",
  "Fen Bilimleri",
  "Türkçe",
  "Sosyal Bilgiler",
]);

// ---- 2) Taranacak dosyaları topla ----------------------------------------
const SCAN_DIRS = ["app", "components", "lib", "src", "pages"].filter((d) =>
  existsSync(join(ROOT, d)),
);

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (/node_modules|\.next|\.git|^data$/.test(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if ([".ts", ".tsx"].includes(extname(e.name))) out.push(p);
  }
  return out;
}

const files = SCAN_DIRS.flatMap((d) => walk(join(ROOT, d)));

// ---- 3) Sabit müfredat dizilerini tespit + onar ---------------------------
// `const NAME = [ "...", "..." ];`  biçimindeki bildirimleri yakalar.
const CONST_ARRAY =
  /const\s+([A-Za-z_$][\w$]*)\s*(?::\s*[^=]+?)?=\s*\[([^\]]*?)\]\s*;?/g;

function classify(name, body) {
  const n = name.toLowerCase();
  if (/(stage|kademe)/.test(n)) return "ALL_STAGES";
  if (/(level|grade|sinif|sınıf|class)/.test(n)) return "ALL_LEVELS";
  if (/(subject|ders|lesson|course)/.test(n)) return "ALL_SUBJECTS";
  // isimden anlaşılmazsa içeriğe bak
  const levelHit = ALL_LEVELS.filter((l) => body.includes(l)).length;
  const stageHit = ALL_STAGES.filter((s) => body.includes(`"${s}"`)).length;
  if (stageHit >= 2) return "ALL_STAGES";
  if (levelHit >= 2) return "ALL_LEVELS";
  return "ALL_SUBJECTS";
}

function fingerprintCount(body) {
  return FINGERPRINT.filter((t) => body.includes(`"${t}"`) || body.includes(`'${t}'`))
    .length;
}

let healedFiles = 0;
let healedDecls = 0;
const report = [];

for (const file of files) {
  let src = readFileSync(file, "utf8");
  let changed = false;
  const used = new Set();

  src = src.replace(CONST_ARRAY, (full, name, body) => {
    // En az 2 müfredat terimi içeriyorsa bu bir gömülü müfredat listesidir.
    if (fingerprintCount(body) < 2) return full;
    const target = classify(name, body);
    used.add(target);
    healedDecls++;
    changed = true;
    report.push(
      `   • ${file.replace(ROOT + "/", "")} → const ${name} = ${target}`,
    );
    return `const ${name} = ${target}; // [self-healed] data/curriculum.json'dan türetildi`;
  });

  if (changed) {
    // Gerekli import'u garanti et.
    const importNames = Array.from(used).join(", ");
    const importRe = /import\s*\{([^}]*)\}\s*from\s*["']@\/lib\/curriculum\.config["'];?/;
    if (importRe.test(src)) {
      src = src.replace(importRe, (m, names) => {
        const set = new Set(
          names
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        );
        used.forEach((u) => set.add(u));
        return `import { ${Array.from(set).join(", ")} } from "@/lib/curriculum.config";`;
      });
    } else {
      // İlk import satırından sonra ekle (yoksa dosya başına).
      const line = `import { ${importNames} } from "@/lib/curriculum.config";`;
      const firstImport = src.match(/^.*import .*$/m);
      if (firstImport) {
        src = src.replace(firstImport[0], firstImport[0] + "\n" + line);
      } else {
        const useClient = src.match(/^["']use client["'];?\s*$/m);
        src = useClient
          ? src.replace(useClient[0], useClient[0] + "\n" + line)
          : line + "\n" + src;
      }
    }

    healedFiles++;
    if (!CHECK_ONLY) writeFileSync(file, src, "utf8");
  }
}

// ---- 4) Rapor -------------------------------------------------------------
console.log("\n🩺  Otonom Müfredat Self-Heal");
console.log("   Kaynak:", DATA_FILE.replace(ROOT + "/", ""));
console.log(
  `   Tarandı: ${files.length} dosya · Kademe ${ALL_STAGES.length} · Ders ${ALL_SUBJECTS.length} · Seviye ${ALL_LEVELS.length}`,
);

if (healedDecls === 0) {
  console.log("\n✅ Temiz — hiçbir dosyada sabit (hardcoded) müfredat dizisi yok.\n");
  process.exit(0);
}

console.log(`\n${CHECK_ONLY ? "⚠️  Tespit edildi" : "🔧 Onarıldı"}: ${healedDecls} bildirim / ${healedFiles} dosya`);
console.log(report.join("\n"));

if (CHECK_ONLY) {
  console.log(
    "\n⛔ Sabit müfredat verisi var. `node scripts/heal-curriculum.mjs` ile otomatik onarın.\n",
  );
  process.exit(1);
}
console.log(
  "\n✅ Tüm zombi diziler data/curriculum.json'a bağlandı (dosyalar üzerine yazıldı).\n",
);
process.exit(0);
