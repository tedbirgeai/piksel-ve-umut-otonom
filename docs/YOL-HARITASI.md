# Piksel ve Umut — Anahtar Teslim Yol Haritası & Sistem Denetimi

Bu belge, sistemin **mevcut durumunu**, **bu pakette tamamlananları** ve
**dış bağımlılık gerektirdiği için kod ile teslim edilemeyen** kalemleri
şeffaf biçimde listeler. Amaç: "neyin hazır, neyin bekleyen" olduğunu net görmek.

---

## ✅ Bu pakette TAMAMLANAN

### 1. Kazanım/ünite bazlı müfredat (rakipsizliğin temeli)
- `data/curriculum-kazanim.json` — **versiyonlu** (MEB-2024), kademe → ders →
  sınıf → **ünite → konu** ağacı. Çekirdek dersler (Matematik, Türkçe, Fen,
  Fizik, Edebiyat, Hayat Bilgisi) temsili sınıflarda gerçek MEB üniteleriyle dolu.
- `lib/curriculum.config.ts` — `getUnits()`, `getTopics()`, `hasKazanim()`,
  `CURRICULUM_MEB_VERSION`, `CURRICULUM_SOURCE`.
- `components/Composer.tsx` — seçilen ders/sınıf için kazanım varsa **"MEB
  Kazanım — Ünite/Konu"** seçici otomatik çıkar; konu seçilince istem otomatik
  hazırlanır.

### Müfredat güncellenince ne olur? (sorunuzun net cevabı)
- **Ders ekle/çıkar** → `data/curriculum.json` düzenle. Arayüz + YZ otomatik yansıtır.
- **Ünite/kazanım güncelle** → `data/curriculum-kazanim.json` düzenle, `version`'ı
  yükselt (örn. `MEB-2025`). Tüm sistem tek noktadan optimize olur. **Kod değişmez.**
- Bu yapı sayesinde MEB'in yıllık müfredat revizyonlarını **dakikalar içinde**
  yansıtabilirsiniz.

### Daha önce tamamlananlar
Rol mimarisi (öğrenci/öğretmen/okul), cüzdansız öğrenci görünümü + sesli dinleme,
Sertifika NFT (ERC-721 + ERC-2981), bağış havuzu, itibar/rozet sistemi,
merkeziyetsiz katalog, PWA/çevrimdışı, ErrorBoundary, tam navigasyon.

---

## ⏳ Kod ile teslim EDİLEMEYEN (dış bağımlılık/uzmanlık gerektirir)

Bunları dürüstçe belirtiyorum — bir yazılım paketi bunları tek başına çözemez:

### 1. Zincir İndeksleyici (ölçek için ZORUNLU)
- **Sorun:** Öğrenci kataloğu şu an zinciri tek tek okuyor; binlerce derste yavaşlar.
- **Çözüm:** The Graph subgraph veya bir event-index servisi.
- **Neden şimdi değil:** Barındırma + altyapı hesabı (sizin adınıza) gerekir.

### 2. Akıllı Sözleşme Güvenlik Denetimi (mainnet için ZORUNLU)
- Para tutan sözleşme, gerçek paraya çıkmadan **bağımsız audit** almalı
  (OpenZeppelin, Certik vb.). Testler geçiyor ama audit ≠ test.

### 3. Fiat (TL) Köprüsü + MEB Mali Uyumu
- Devlet okulu bağlamında ETH ile telif **mevzuata takılır.** TL bazlı,
  faturalı bir ödeme köprüsü (iyzico/Craftgate + muhasebe) gerekir.
- Bu **hukuk + mali müşavir + ödeme kuruluşu** işidir.

### 4. Hukuki Uyum (Anayasa/KVKK/MEB)
- `docs/KVKK-AYDINLATMA.md` taslağı eklendi ama **avukat onayı şart.**
- Çocuk verisi + blokzincir kalıcılığı hassas bir kesişim (belgede açıklandı).

### 5. Güçlü YZ Modeli + İnsan Denetimi
- Yerel `llama3` pedagojik kalitede zayıf. "Rakipsiz kalite" iddiası için
  daha güçlü bir model (bulut) + öğretmen onay hattı gerekir.

### 6. İçerik Onay/Moderasyon Hattı
- Okul "onaylı içerik" görmeli. Sözleşmede `setActive` var; üstüne bir
  editöryel onay akışı (uzman imzası) kurulmalı.

---

## Öncelik Sırası (önerilen)
1. **YZ kalitesi + içerik onayı** (ürünün kalbi) →
2. **Fiat köprüsü + hukuki uyum** (okula girmenin ön şartı) →
3. **İndexer** (ölçek) →
4. **Audit** (mainnet öncesi).
