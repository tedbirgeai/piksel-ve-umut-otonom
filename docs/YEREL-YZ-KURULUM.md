# Yerel YZ Kurulumu — Qwen2.5 (bağımlılıksız, ücretsiz)

Bu kılavuz, "Piksel ve Umut" için yerel yapay zekâ motorunu **sıfırdan çalışır**
hale getirir. Dış servis, API anahtarı veya abonelik **yoktur** — her şey sizin
makinenizde çalışır. Model açık ağırlıklıdır (Qwen2.5, **Apache 2.0**): bir kez
indirirsiniz, sonsuza dek sizindir, kimse erişimi kesemez.

---

## 1. Donanımınıza göre model seçin

Model, **sizin bilgisayarınızın** gücüyle çalışır. Aşağıdan makinenize uyanı seçin:

| Bilgisayarınız | Önerilen model | Komut | Kalite |
|---|---|---|---|
| Hafif dizüstü / 8 GB RAM | `qwen2.5:3b` | `ollama pull qwen2.5:3b` | İyi |
| **Normal PC / 16 GB RAM** | **`qwen2.5:7b`** | `ollama pull qwen2.5:7b` | **Çok iyi (önerilen)** |
| Oyuncu PC / 12 GB+ VRAM | `qwen2.5:14b` | `ollama pull qwen2.5:14b` | Mükemmel |
| İş istasyonu / 24 GB+ VRAM | `qwen2.5:32b` | `ollama pull qwen2.5:32b` | En iyi |

**Bilmiyorsanız `qwen2.5:7b` ile başlayın.** Yavaş çalışırsa `qwen2.5:3b`'ye,
çok hızlıysa `qwen2.5:14b`'ye geçin — sadece `.env.local`'i değiştirmeniz yeter.

> **Not:** Model boyutu = indirme boyutu ≈ RAM/VRAM ihtiyacı.
> 3b ≈ 2 GB · 7b ≈ 4.7 GB · 14b ≈ 9 GB · 32b ≈ 20 GB disk.

---

## 2. Kurulum (tek seferlik, 3 adım)

### Adım 1 — Ollama'yı kurun
- **Windows / Mac:** https://ollama.com/download adresinden indir, kur.
- Kurulunca Ollama arka planda otomatik çalışır.

### Adım 2 — Modeli indirin
Terminal (Windows'ta CMD) açın ve yazın:
```
ollama pull qwen2.5:7b
```
İlk seferde birkaç dakika sürer (model iner). Bir kez indirilir, tekrar gerekmez.

### Adım 3 — Projeye tanıtın
`.env.local` dosyanızda şu satır olsun (yoksa ekleyin):
```
OLLAMA_HOST=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:7b
```

**Bitti.** `npm run dev` ile çalıştırın. Öğretmen panelinde sağ üstteki durum
rozeti **yeşil** ve `qwen2.5:7b` yazıyorsa her şey hazırdır.

---

## 3. Durum rozeti ne anlatır? (otomatik teşhis)
Öğretmen panelinin üst başlığında canlı bir gösterge var:

- 🟢 **qwen2.5:7b** → Motor açık, model yüklü, üretime hazır.
- 🟠 **Model yüklü değil** → Ollama çalışıyor ama model inmemiş.
  Çözüm: `ollama pull qwen2.5:7b`
- 🔴 **Motor kapalı** → Ollama çalışmıyor.
  Çözüm: Ollama uygulamasını başlatın (ya da terminalde `ollama serve`).

---

## 4. Sık sorulanlar

**İnternet gerekir mi?** Yalnızca ilk `ollama pull` sırasında. Sonra üretim
tamamen **çevrimdışı** çalışır — veri makinenizden çıkmaz (KVKK açısından ideal).

**Bağımlılık/ücret var mı?** Hayır. Apache 2.0 lisanslı, açık ağırlıklı. Ne
abonelik, ne API anahtarı, ne kullanım limiti.

**Çok kullanıcıya nasıl ölçeklenir?** Tek PC kişisel/pilot için yeterli.
Okul/kurum ölçeğinde: bir **GPU'lu sunucu** kurup `OLLAMA_HOST`'u o sunucunun
adresine yöneltirsiniz. Yine kira/abonelik yok — kendi donanımınız.

**Türkçe kalitesi?** Qwen2.5 açık modeller arasında Türkçe'de en iyilerden.
Daha da iyisi için `qwen2.5:14b` veya `32b` (güçlü donanım ister).
