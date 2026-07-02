# Piksel Stüdyo — Video Yol Haritası (3 Seviye)

> Piksel karakteri'nun başrolde olduğu öğretici-eğlenceli içerik stratejisi.
> Amaç: amatör "metin + nesne" seviyesinden, dünya standardı bir animasyon
> markasına geçiş — her seviye farklı yatırım, farklı zaman.

---

## Seviye 1 — Otomatik Canlı Anlatım (TAMAMLANDI ✅)
**Ne:** Her ders anında, Piksel karakteri'nun sesli-oyunlaştırılmış anlatımıyla sahnelere
dönüşür (sahne yönetmeni + nesne kütüphanesi + karaoke altyazı + fon müziği).
**Güç:** Sonsuz, ücretsiz, çevrimdışı, her ders için otomatik.
**Sınır:** "Açıklayıcı grafik" tavanı — çizgi film değil. Paylaşım uygulama içi
değildir (kaldırıldı); dağıtım Seviye 3'ün işidir.
**Durum:** Yayında. `LessonPlayer` + `sceneDirector` + `SceneObject` + `Piksel karakteriMascot`.

---

## Seviye 2 — Kuklalanmış (Rigged) Piksel karakteri (BAŞLADI 🔧)
**Ne:** Piksel karakteri bir "kukla" gibi poz verir: işaret eder (intro), düşünür (quiz),
kutlar (outro), konuşur (dudak senkronu). Duolingo'nun Duo'su ile aynı yaklaşım.
**Bu pakette:** Piksel karakteri'ya `pose` sistemi eklendi (SVG/CSS ile — bağımlılıksız).
**Üretim yükseltmesi (önerilen):** Profesyonel his için Piksel karakteri'yu **Rive** veya
**Lottie** ile yeniden rig'leyin:
- Bir kez: karakter iskeleti + ifade/jest kütüphanesi (mutlu, şaşkın, düşünen,
  alkış, dudak-senkron) bir tasarımcı tarafından hazırlanır.
- Kod: `@rive-app/react-canvas` veya `lottie-react` ile durum makinesi sürülür;
  sahne türü → Piksel karakteri ifadesi. Uygulama içi, çevrimdışı çalışır.
- Maliyet: tek seferlik rig + animasyon; sonra sonsuz kullanım (sıfır marjinal).
**Neden:** Sevilen bir maskot = tutundurma + marka. Duolingo bunu kanıtladı.

---

## Seviye 3 — Piksel karakteri Çizgi Film Dizisi (PRODÜKSİYON YOL HARİTASI)
**Ne:** Piksel karakteri'nun başrolde olduğu, 100–200 bölümlük öğretici-eğlenceli animasyon
dizisi. "Piksel karakteri'nun başrol olduğu Türkçe eğitim Netflix'i."
**Kritik gerçek:** Bu bir **içerik/prodüksiyon işidir, kod özelliği değil.**
Bölüm başına gerçek emek/bütçe ister. Ama bir kez üretilince **kütüphane varlığı**
olur (üret bir kez, sonsuz izlensin) — birikim hendeği.

### Prodüksiyon hattı (öneri)
1. **Senaryo kütüphanesi** — Müfredat kazanımlarına bağlı 100–200 bölüm fikri.
   Her bölüm: bir kazanım + Piksel karakteri'nun macerası + 3–5 dk süre. (Metin şablonu:
   açılış kancası → problem → keşif → çözüm → özet → şarkı.)
2. **Storyboard + ses** — profesyonel Türkçe seslendirme (Piksel karakteri'nun kalıcı sesi).
3. **Animasyon üretimi** — iki yol:
   - **Stüdyo/animatör** (en yüksek kalite, en yüksek maliyet), veya
   - **Üst düzey YZ video** (Sora / Kling / Runway) + insan kurgusu (hızlı,
     orta maliyet). Not: bu YZ araçları buluttur; yalnızca **üretim aşamasında**
     kullanılır — son ürün video dosyasıdır, uygulamada çevrimdışı oynar.
4. **Kurgu + müzik + marka** — jenerik, Piksel karakteri teması, tutarlı görsel dil.
5. **Dağıtım (izleme rekoru burada):**
   - **YouTube / TikTok / Instagram Reels** — organik erişim, marka bilinirliği.
   - **Uygulama içi PWA kütüphanesi** — çevrimdışı izleme (bağlantısız bölge kozu).
   - Bölümler dersle ilişkilendirilir: öğrenci konuyu izler → uygulamada pekiştirir.

### İş modeli bağlantısı
- Diziler ücretsiz + reklamsız (marka/misyon). Gelir: kurum lisansı + bağış +
  freemium (bkz. `docs/STRATEJI.md`). Dizi = pazarlama motoru + öğrenme içeriği.
- Sponsorlu bölümler (STK/kurum "bu bölüm X vakfı katkısıyla") — etik gelir.

### Öncelik
1. Seviye 2 rig (Duo-kalite maskot) — uygulamanın yüzü.
2. 5 bölümlük **pilot dizi** (YZ video + insan kurgu) — kavram kanıtı + YouTube testi.
3. Metrikler iyiyse tam sezon (20–40 bölüm) prodüksiyonu.

---

## Özet
- **Seviye 1:** ölçek (her ders görselli) — hazır.
- **Seviye 2:** marka (sevilen maskot) — kodda başladı, Rive ile profesyonelleşir.
- **Seviye 3:** erişim (izleme rekoru) — prodüksiyon + dağıtım iş kolu.
Üçü farklı yatırım; karıştırılırsa amatör kalır, ayrı yürütülürse dünya standardı olur.
