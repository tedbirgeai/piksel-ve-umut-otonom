# Dünya Standartları — Derin Analiz & Sıfır-Hata Çerçevesi

> Amaç: "Piksel ve Umut"u, çocuk + eğitim + para + blokzincir kesişiminde
> **dünya standartlarına** oturtmak. "Sıfır hata" bir kereye mahsus bir iddia
> değil, **sistematik kalite kapıları** ile ulaşılan bir süreçtir. Bu belge
> hangi standardı, neden, nasıl karşıladığımızı dürüstçe listeler.

---

## 1. Erişilebilirlik — WCAG 2.2 AA (yasal + ahlaki zorunluluk)
**Neden:** "3 yaştan profesöre kadar herkes anlayabilmeli" demek, teknik olarak
**erişilebilirlik** demektir. AB (EN 301 549), ABD (ADA/Section 508) ve birçok
ülke eğitimde WCAG uyumunu **yasal** kılar.
- **Hedef:** kontrast ≥ 4.5:1, klavyeyle tam gezinme, ekran okuyucu etiketleri,
  görülebilir odak halkası, dokunma hedefi ≥ 44px, `prefers-reduced-motion`.
- **Durum:** Kısmen. Renk paleti güçlü kontrastlı; ama tüm ikon-butonlara
  `aria-label`, odak stilleri ve hareket-azaltma sistematik eklenmeli.

## 2. Çocuk Verisi & Gizlilik (en kritik yasal alan)
**Standartlar:** KVKK (TR) · GDPR + **GDPR-K** (AB, çocuk) · **COPPA** (ABD, 13 yaş altı)
· BM Çocuk Hakları Sözleşmesi **Genel Yorum 25** (dijital ortam) · UK **Age-Appropriate
Design Code** (Children's Code).
- **İlke:** Çocuktan **veri toplama.** Sistemimiz bunu tasarımla sağlıyor:
  öğrenci **cüzdansız, kayıtsız, çevrimdışı** çalışır; kişisel veri **zincire
  yazılmaz** (yalnızca cüzdan adresi + içerik CID'si). Bu, "veri minimizasyonu"
  ilkesinin en güçlü uygulamasıdır.
- **Eksik:** Veli açık rızası akışı + yaşa uygun gizlilik bildirimi (docs/KVKK).

## 3. İçerik Güvenliği & Yaş Uygunluğu (YZ riski — BU TESLİMDE)
**Neden:** YZ üretimi halüsinasyon, önyargı, yaşa uygunsuz içerik üretebilir.
Bir çocuk ürününde bu **tolere edilemez.**
- **Katman 1 — Üretimde önleme:** sistem istemi yaş-uygun dil + yasak konuları
  kısıtlar (şiddet, cinsellik, korku, siyaset, reklam vb.).
- **Katman 2 — Otomatik denetim:** `lib/safety.ts` her taslağı tarar; yasaklı
  terim, kademe-uyumsuzluğu, dil bozukluğu, eksik pedagojik yapı için **puan +
  uyarı** üretir.
- **Katman 3 — İnsan onayı:** öğretmen, otomatik uyarıları görerek yayınlar
  (human-in-the-loop). Üç katman = sıfır-hata kapısı.

## 4. Pedagojik Standart
**Neden:** İçerik MEB kazanımlarıyla hizalı olmalı; yoksa "eğitim" değil "metin".
- **Durum:** Kazanım ağacı (`curriculum-kazanim.json`, MEB-2024) + öneri motoru
  konuyu kademeye bağlıyor. Rubrik (giriş/gelişme/değerlendirme) denetimde ölçülüyor.

## 5. Akıllı Sözleşme Güvenliği
**Standart:** OpenZeppelin, ERC-721/2981, reentrancy-guard, pull-payment,
custom errors — hepsi uygulandı. **Eksik (mainnet öncesi ZORUNLU):** bağımsız
denetim (audit) + testnet'te uzun süreli deneme. Test parasında sorun yok;
gerçek parada audit'siz çıkılmaz.

## 6. Yazılım Doğruluğu
TypeScript tip güvenliği, ErrorBoundary, PWA/çevrimdışı mevcut. **Eksik:**
otomatik test kapsamı (yalnızca sözleşmede var), CI kapısı, Lighthouse hedefi.

---

## Sıfır-Hata Kapıları (özet)
| Alan | Kapı | Durum |
|---|---|---|
| Uygunsuz içerik | 3 katmanlı güvenlik (önle/tara/onayla) | ✅ bu teslim |
| Çocuk verisi | Veri toplamama + zincire PII yazmama | ✅ tasarımda |
| Erişilebilirlik | WCAG 2.2 AA | ⏳ kademeli sertleştirme |
| Sözleşme | Bağımsız audit | ⏳ mainnet öncesi |
| Regülasyon | Avukat + veli rıza akışı | ⏳ hukuk |

**Dürüst sonuç:** Teknik mimari dünya standardına oturuyor. Kalan üç kalem
(audit, hukuk, tam a11y) kod dışı uzmanlık/süreç gerektirir — bunları gizlemek
değil, planlamak doğru olandır.
