# Piksel ve Umut — Master Codebase

Otonom Eğitim Ekosistemi'nin tam sürümü: **ferah/açık tasarım** + **Wagmi cüzdan**
+ **yerel Ollama içerik üretimi** + **IPFS pinleme** + **telif akıllı sözleşmesi**.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 ·
wagmi 2 / viem / RainbowKit 2 · TanStack Query.

## Dosya yapısı
```
.
├─ app/
│  ├─ globals.css            # Tailwind v4 @theme — tüm marka renkleri
│  ├─ layout.tsx             # Fontlar + Providers + Navbar/Footer
│  ├─ providers.tsx          # Wagmi → Query → RainbowKit → Library
│  ├─ page.tsx               # Ferah landing (marka / ürün / telif)
│  ├─ panel/
│  │  └─ page.tsx            # Çalışma alanı (3 sekme)
│  └─ api/
│     ├─ ollama/route.ts     # Yerel Ollama'ya sunucu köprüsü
│     └─ ipfs/route.ts       # Yerel IPFS (Kubo) pinleme köprüsü
├─ components/
│  ├─ PixelMark.tsx          # Marka sembolü
│  ├─ Navbar.tsx             # + cüzdan düğmesi
│  ├─ Footer.tsx
│  ├─ WalletButton.tsx       # RainbowKit ConnectButton
│  ├─ LibraryProvider.tsx    # Paylaşımlı içerik durumu (localStorage)
│  ├─ ContentFactory.tsx     # Multimodal: ses + belge + kademe → üret/pin/zincir
│  ├─ AccessButton.tsx       # accessContent ile erişim satın alma
│  ├─ ServiceWorkerRegister.tsx  # PWA service worker kaydı
│  ├─ DigitalLibrary.tsx     # Pinlenmiş içerik kataloğu
│  └─ RoyaltyPanel.tsx       # Sözleşmeden telif oku + çek
├─ lib/
│  ├─ types.ts
│  ├─ wagmi.ts               # Cüzdan + Alchemy RPC transport
│  ├─ contract.ts            # Telif sözleşmesi ABI + adres
│  ├─ extract.ts             # PDF/DOCX/TXT istemci metin çıkarımı
│  ├─ ollama.ts              # İstemci → /api/ollama
│  └─ ipfs.ts                # Ağ geçidi + /api/ipfs
├─ types/speech.d.ts         # Web Speech API tipleri
├─ package.json · tsconfig.json · next.config.ts
├─ postcss.config.mjs · eslint.config.mjs · tailwind.config.ts
├─ .env.example · .gitignore
```

## Veri akışı (bileşenler nasıl konuşur)
```
ContentFactory ──generateLesson()──▶ /api/ollama ──▶ yerel Ollama
       │
       └──pinLesson()──▶ /api/ipfs ──▶ yerel Kubo düğümü ──▶ CID
       │
       ▼
LibraryProvider (localStorage)  ◀── DigitalLibrary okur
       ▲
RoyaltyPanel ──useReadContract()──▶ Telif sözleşmesi (wagmi/viem)
             ──useWriteContract(withdraw)──▶ cüzdan imzası
```

## Kurulum
```bash
# 1) Bu klasörün içeriğini proje köküne kopyalayın
# 2) Ortam değişkenleri
cp .env.example .env.local      # değerleri doldurun (aşağıya bakın)
# 3) Bağımlılıklar
npm install
# 4) Geliştirme
npm run dev                     # http://localhost:3000
```

## Çalışma Alanı (SaaS · Gemini/Claude standardı)
`/panel` profesyonel, dark/light uyumlu bir platform:
```
app/panel/page.tsx              # ThemeProvider + Sidebar + ChatWindow
components/ThemeProvider.tsx    # Dark/Light (localStorage + <html>.dark)
components/Sidebar.tsx          # Otonom Kontrol Merkezi (geçmiş/proje/telif)
components/ChatWindow.tsx       # Profesyonel chat akışı + düşünme animasyonu
components/MessageBubble.tsx    # Kullanıcı/asistan ayrımı + kod bloğu ayrıştırma
components/CodeBlock.tsx        # Kopyalama düğmeli kod bloğu
components/Composer.tsx         # Seçiciler + ses + dosya + ücret + "Zincire kaydet"
components/CurriculumManager.tsx# Bağımlı dropdown + useCurriculum() hook
components/VoiceInput.tsx       # Web Speech API (tr-TR)
lib/curriculum.config.ts        # HİYERARŞİK müfredat (Kademe → seviye + ders)
```
**Dark/Light:** ThemeProvider `<html>.dark` sınıfını yönetir; globals.css'teki
`@custom-variant dark` ile tüm `dark:` sınıfları çalışır. Tercih localStorage'da.
**Hiyerarşik müfredat:** Veri artık KODDA değil, merkezi yönetilebilir kaynakta:
**`data/curriculum.json`**. `lib/curriculum.config.ts` onu okur+doğrular;
`CurriculumManager` ve Ollama route bu tek kaynaktan beslenir. Yeni kademe/ders
için yalnızca JSON'u düzenleyin — hiçbir kodda statik liste yoktur.
**Kod bloğu:** Asistan yanıtındaki ```fence``` otomatik kopyalanabilir koda dönüşer.

## Frontend İzolasyonu (Workspace Root — Hardhat çakışması)
Kökte Hardhat (`package.json` + lockfile) olduğu için Next.js workspace root'unu
yanlış çıkarsayıp "inferred workspace root" uyarısı verebilir. `next.config.ts`
bunu mimari olarak çözer: **`turbopack.root`** ve **`outputFileTracingRoot`**,
kökü bu frontend klasörüne (`path.resolve(__dirname)`) sabitler. Kökteki
blockchain dosyaları ve `package.json` tamamen yok sayılır. Manuel dizin
değişikliği veya dosya silme GEREKMEZ; açılışta uyarı çıkmaz.

## ⚠ DRIFT / BUILD-SYNC ONARIMI (eski arayüz görünüyorsa)
Müfredatın TEK kaynağı `lib/curriculum.config.ts`'tir. Statik 6-derslik dizi
başka HİÇBİR dosyada yoktur. "Eski/statik arayüz" görüyorsanız sebebi kod değil,
**sizin reponuzdaki artık dosyalar veya `.next` önbelleğidir.** Kesin çözüm:

1. **Artık (eski) dosyaları silin** — varsa şunlar drift yaratır:
   ```
   components/ContentFactory.tsx   components/ChatInterface.tsx
   components/LevelSelector.tsx     lib/curriculum.ts
   ```
   (Bu pakette bunlar zaten yok — reponuzda kalmışsa silin.)
2. **Önbelleği temizleyip taze başlatın:**
   ```bash
   npm run dev:fresh     # .next silinir + next dev
   # veya:  npm run clean && npm run dev
   ```
3. **Tarayıcı tarafı:** Hard refresh (Cmd/Ctrl+Shift+R) veya gizli sekme.

### Bu paket neden "self-healing"?
- `next.config.ts` → geliştirmede her başlatmada **taze build kimliği** +
  `Cache-Control: no-store`. Eski derleme/asset yapışamaz.
- `lib/curriculum.config.ts` → `validateCurriculum()` config bozuksa **build/dev
  anında hata** verir; sessizce eski haline düşemez.
- `components/CurriculumManager.tsx` → modül yüklenirken `validateCurriculum()`
  çağırır; yalnızca config'ten (`getBranch`, `STAGE_KEYS`) okur, `useState`/
  `useEffect` içinde statik veri yoktur.
- `components/BuildStamp.tsx` → sidebar'da **canlı** kademe sayısı + sürümü
  gösterir. Dosyaya dokunduğunuz an buradaki değer değişir; değişmiyorsa
  hot-reload değil cache/eski-dosya sorunudur (adım 1–2).

> Doğrulama: `lib/curriculum.config.ts`'te bir kademeye ders ekleyin → kaydedin →
> sidebar'daki BuildStamp ve composer dropdown'u anında güncellenmeli.

## 🩺 Otonom Self-Heal (zombi veri otomatik temizleme)
Sabit (hardcoded) müfredat dizisi nereye sızarsa sızsın, **tek komut** onarır:
```
npm run heal          # tara + data/curriculum.json'a bağla (dosyaları overwrite eder)
npm run heal:check    # sadece denetle — bulursa exit 1 (CI için)
```
`scripts/heal-curriculum.mjs` (sıfır bağımlılık) tüm `app/ components/ lib/ src/`
altını tarar; `const SUBJECTS/GRADES/STAGES = [...]` gibi gömülü listeleri tespit
edip `ALL_SUBJECTS / ALL_LEVELS / ALL_STAGES` merkezi sabitleriyle değiştirir ve
gerekli import'u ekler. `predev` kancası sayesinde **`npm run dev` her açılışta
otomatik koşar** — zombi veri fiziksel olarak hayatta kalamaz.

## 🛡 Anti-hardcode guardrail (ESLint)
`eslint.config.mjs` içindeki kural, `data/` dışına müfredat dizisi yazılırsa
`npm run lint` / `next build`'i **hata** ile durdurur. Drift'i sistem reddeder.

## .env.local — zorunlu anahtarlar
| Değişken | Nereden | Not |
|---|---|---|
| `NEXT_PUBLIC_ALCHEMY_API_KEY` | dashboard.alchemy.com → App → API Key | **RPC hatasını çözer** — public rpc.sepolia.org yerine adanmış uç nokta. Tarayıcıya açıktır. |
| `ALCHEMY_API_KEY` | aynı anahtar | Hardhat/deploy sunucu tarafı için |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | cloud.walletconnect.com | Cüzdan bağlama |
| `NEXT_PUBLIC_ROYALTY_CONTRACT` | `npm run deploy:sepolia` çıktısı | Boşsa panel demo modunda |
| `PRIVATE_KEY` | deploy cüzdanı | **Asla commit'lemeyin** |

> Alchemy anahtarı girildiği an wagmi/viem tüm Sepolia çağrılarını bu adanmış
> uç noktadan yapar; `rpc.sepolia.org` kaynaklı rate-limit/timeout hataları biter.

## Çalışma Masası — multimodal girdi
- **Sesli yazı:** Mikrofon düğmesi Web Speech API (`tr-TR`) ile konuşmanızı canlı
  olarak konu istemine yazar. (Chrome/Edge; izin ister.)
- **Belge işleme:** PDF/DOCX/TXT sürükle-bırak ya da tıkla-seç. Metin tamamen
  **tarayıcıda** çıkarılır (`pdfjs-dist`, `mammoth`) — dosya sunucuya gitmez.
- **Eğitim kademesi:** Kreş · İlkokul · Ortaokul · Lise · Üniversite · Akademik.
  YZ, `app/api/ollama/route.ts` içindeki `LEVEL_GUIDE` ile pedagojik dili,
  tonu ve derinliği seçilen kademeye göre otomatik ayarlar.

## Yerel servisler (opsiyonel ama tam işlev için gerekli)
```bash
# Yerel YZ
ollama serve
ollama pull llama3

# IPFS düğümü (Kubo)
ipfs daemon
```
> Bu servisler kapalıyken arayüz yine de açılır; üretim/pinleme adımları
> kullanıcıya net bir hata mesajı gösterir, telif paneli demo değeriyle çalışır.

## ÖNEMLİ — Tailwind v4
Renkler `app/globals.css` içindeki `@theme` bloğundan üretilir.
`tailwind.config.ts` v4 tarafından okunmaz (yalnızca içerik referansı);
isterseniz silebilirsiniz.

---

## Akıllı Sözleşme — RoyaltyDistributor (Solidity + Hardhat)

Erişim-bazlı, güvenli, çekilebilir telif sözleşmesi.

```
contracts/RoyaltyDistributor.sol   # Sözleşme
scripts/deploy.ts                  # Sepolia/yerel dağıtım
test/RoyaltyDistributor.test.ts    # Birim testleri
hardhat.config.ts                  # Ağlar + derleyici
```

### Mekanizma
1. **registerContent(cid, accessPrice)** — üretici içeriğini kaydeder.
2. **accessContent(contentId)** `payable` — okuyucu erişim ücretini öder;
   ücret (platform payı düşülerek) üreticinin **çekilebilir** bakiyesine yazılır.
3. **withdrawableRoyalty(creator)** — birikmiş telifi okur (frontend bunu kullanır).
4. **withdraw()** — üretici telifini çeker (pull-payment, reentrancy-safe).

### Güvenlik
- `ReentrancyGuard` + **Checks-Effects-Interactions** + pull-payment
- Custom error'lar, platform ücret tavanı (%10), `Ownable` yönetim

### Derleme & test
```bash
npm install
npm run compile
npm run test:contracts
```

### Sepolia'ya dağıtım
```bash
# .env.local içinde SEPOLIA_RPC_URL + PRIVATE_KEY dolu olmalı
npm run deploy:sepolia
# Çıktıdaki adresi .env.local içine ekleyin:
#   NEXT_PUBLIC_ROYALTY_CONTRACT=0x....
npm run dev   # frontend artık gerçek sözleşmeyi okur
```
> Yerel deneme için: bir terminalde `npm run chain`, diğerinde
> `npm run deploy:local`.

`lib/contract.ts` içindeki ABI sözleşmeyle birebir eşleşir; adres `.env.local`'den
gelir, tanımlı değilse panel demo değeriyle çalışır.

---

## PWA (çevrimdışı + yüklenebilir uygulama)

```
public/manifest.json              # Uygulama manifesti
public/service-worker.js          # Çevrimdışı önbellek stratejisi
public/icon-192.png · icon-512.png · icon-maskable-512.png · apple-touch-icon.png
components/ServiceWorkerRegister.tsx   # SW kaydı (yalnızca production)
```
- `app/layout.tsx` manifest + ikon meta verilerini bağlar ve `<ServiceWorkerRegister />`
  ile SW'yi kaydeder (geliştirmede devre dışı, HMR çakışmasını önlemek için).
- SW; gezinmede network-first (çevrimdışı `/` yedeği), statikte cache-first çalışır;
  `/api/*`, RPC, IPFS ve Ollama isteklerine dokunmaz.
- Test: `npm run build && npm run start` → tarayıcıda "Yükle" simgesi görünür,
  uçak modunda uygulama açılır.

## Erişim satın alma akışı
`components/AccessButton.tsx`, zincire kayıtlı her içerik için:
`hasAccess` okur → yoksa `accessContent(contentId)` `{value: accessPrice}` çağırır →
makbuzu bekler → "Erişiminiz var" durumuna geçer. Ücret zincirden (`contents`)
okunur. `DigitalLibrary` kartlarına gömülüdür.

