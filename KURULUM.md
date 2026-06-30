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
│  ├─ ContentFactory.tsx     # Ollama üret → IPFS pinle (boru hattı)
│  ├─ DigitalLibrary.tsx     # Pinlenmiş içerik kataloğu
│  └─ RoyaltyPanel.tsx       # Sözleşmeden telif oku + çek
├─ lib/
│  ├─ types.ts
│  ├─ wagmi.ts               # Cüzdan yapılandırması
│  ├─ contract.ts            # Telif sözleşmesi ABI + adres
│  ├─ ollama.ts              # İstemci → /api/ollama
│  └─ ipfs.ts                # Ağ geçidi + /api/ipfs
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
cp .env.example .env.local      # değerleri doldurun
# 3) Bağımlılıklar
npm install
# 4) Geliştirme
npm run dev                     # http://localhost:3000
```

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

