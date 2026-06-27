// İçerik yapısını tanımlayan arayüz (Interface) - Orijinal yapı korundu
export interface Bolum {
  baslik: string;
  icerik: string;
  medyaUrl: string; // Video veya Görsel yolu
  medyaTipi: 'video' | 'image';
}

// 1'den 14'e kadar Pedagojik ve Gerçek Okul Öncesi Senaryo Veritabanı
export const senaryoVeritabani: Record<number, Bolum> = {
  1: {
    baslik: "Tanışma ve İlk Küp",
    icerik: "Aydınlık kreş sınıfında parlayan mavi bir ışık küpü belirir. PİKSEL: 'Bip-bop! Selam dünya! Ben Piksel. Sizinle üretmeye geldim!' UMUT: 'Aaa! Mavi, parlayan bir robot! Bizimle dev bir kule yapar mısın?' PİKSEL: 'Blokları üst üste dizerken dengede tutmak en önemli görevimiz. Birlikte çalışırsak kulemiz asla yıkılmaz!'",
    medyaUrl: "/assets/bolum1.mp4",
    medyaTipi: 'video'
  },
  2: {
    baslik: "Şekiller Ülkesi",
    icerik: "PİKSEL: 'Bip-bop! Bugün gövdemi değiştiriyorum. Dört köşem ve dört kenarım var, ben hangi şeklim?' UMUT: 'Bu bir kare! Tıpkı bizim resim defterimiz gibi!' PİKSEL: 'Doğru! Şimdi üstümü daraltıyorum ve... Bip! Üçgen oldum! Şekiller dünyayı oluşturur!'",
    medyaUrl: "/assets/bolum2.mp4",
    medyaTipi: 'video'
  },
  3: {
    baslik: "Renklerin Senfonisi",
    icerik: "PİKSEL: 'Bip! Kırmızı ve sarı boyayı karıştırın. Sistemim yeni rengi algılamaya hazır!' UMUT: 'Aaa! Turuncu oldu Piksel! Tıpkı bir portakal rengi!' PİKSEL: 'Harika! Renkleri birleştirmek dijital bir sihir gibidir, sistemi neşeyle doldurur!'",
    medyaUrl: "/assets/bolum3.mp4",
    medyaTipi: 'video'
  },
  4: {
    baslik: "Paylaşmanın Gücü",
    icerik: "PİKSEL: 'Bip... Enerji düşüşü! Tek bir oyuncak için tartışmak yerine sırayla oynamayı deneyin.' UMUT: 'Doğru, önce sen sür treni, sonra sıra bende olsun. Bak Piksel, kavga bitince oyun daha eğlenceli oldu!'",
    medyaUrl: "/assets/bolum4.mp4",
    medyaTipi: 'video'
  },
  5: {
    baslik: "Nezaket Kelimeleri",
    icerik: "PİKSEL: 'Nezaket kelimeleri duyulduğunda ekranımda sihirli havai fişekler patlar!' UMUT: 'Bana oyuncağı uzatabilir miyim lütfen?... Teşekkür ederim! Bak Piksel, havai fişeklerin çok güzel!'",
    medyaUrl: "/assets/bolum5.mp4",
    medyaTipi: 'video'
  },
  6: {
    baslik: "Dönen Zaman Makinesi",
    icerik: "PİKSEL: 'Bip-bop! Umut çabuk gel! Evde bir solucan deliği açılmış, kıyafetleri yutuyor!' UMUT: 'İlahi Piksel, o çamaşır makinesi! Kıyafetleri mikroplardan arındırmak için suyla döndürüyor.' PİKSEL: 'Anlaşıldı! Burası bir Zırh Yenileme İstasyonu! Mikroplara karşı tam savunma!'",
    medyaUrl: "/assets/bolum6.mp4",
    medyaTipi: 'video'
  },
  7: {
    baslik: "Sabırlı Küçük Filiz",
    icerik: "PİKSEL: 'Bu bitki neden hemen büyümüyor? İşlemcim beklemekten sıkıldı, bop.' UMUT: 'Doğanın zamana ihtiyacı var Piksel. Onu her gün sulayıp sabırla büyümesini izleyeceğiz.' PİKSEL: 'Doğanın algoritması sabırla işliyor, veri kaydedildi.'",
    medyaUrl: "/assets/bolum7.mp4",
    medyaTipi: 'video'
  },
  8: {
    baslik: "Melodilerin Dili",
    icerik: "PİKSEL: 'Ses dalgaları piksellerimi dans ettiriyor! Davulun ritmi kalbimiz gibi atıyor!' UMUT: '*Güm güm!* Haydi hep beraber tempoya ayak uyduralım ve kendi şarkımızı yapalım!' PİKSEL: 'İşitsel frekanslar optimize edildi, harika ritim!'",
    medyaUrl: "/assets/bolum8.mp4",
    medyaTipi: 'video'
  },
  9: {
    baslik: "Hayal Gücü Bulutu",
    icerik: "PİKSEL: 'Gökyüzündeki beyaz veri blokları sürekli değişiyor, onları anlamlandıramıyorum.' UMUT: 'Çünkü onlar bulut! Bak şu bulut kocaman bir file benziyor. Hayal edince her şey değişir!' PİKSEL: 'Soyut düşünce motoru aktif edildi, bulut fil olarak algılandı.'",
    medyaUrl: "/assets/bolum9.mp4",
    medyaTipi: 'video'
  },
  10: {
    baslik: "Düzenli Oda Görevi",
    icerik: "PİKSEL: 'Dağınık alan uyarısı! Acil düzenleme protokolü: Oyuncaklar ait oldukları depolara!' UMUT: 'Arabalar mavi kutuya, kitaplar rafa! Kim daha hızlı toplayacak oyunu başladı!' PİKSEL: 'Kategorizasyon tamamlandı. Düzen, sisteme kararlılık getirir.'",
    medyaUrl: "/assets/bolum10.mp4",
    medyaTipi: 'video'
  },
  11: {
    baslik: "Hayvanlar Alemi",
    icerik: "PİKSEL: '*Miyav miyav!* Ses veritabanımda bu organik canlı kedi olarak eşleşti. Doğru mu?' UMUT: 'Evet, kediler süt içmeyi çok sever! Şimdiki ses benden: *Hav hav!* Bil bakalım bu kim?' PİKSEL: 'Bip! Bu bir köpek! Canlı algılama başarılı!'",
    medyaUrl: "/assets/bolum11.mp4",
    medyaTipi: 'video'
  },
  12: {
    baslik: "Kayıp Oyuncak Dedektifi",
    icerik: "PİKSEL: 'Bip-bop! Yeşil araba en son kitaplık yakınlarında görüldü. Tarama ışıkları aktif!' UMUT: 'Buldum! Kitaplığın arkasındaki kutunun içine düşmüş. İpuçlarını takip etmek işe yaradı!' PİKSEL: 'Mantıksal çıkarım tamamlandı. Problem çözüldü!'",
    medyaUrl: "/assets/bolum12.mp4",
    medyaTipi: 'video'
  },
  13: {
    baslik: "Sessiz Sinema Robotu",
    icerik: "PİKSEL: '[Ses kapalı. Gövdesini önce bir uçağa, sonra uzun hortumlu bir file dönüştürür.]' UMUT: 'Bakın, Piksel konuşmadan bize kendini anlatıyor! Evet, bu uzun hortumlu bir fil!' PİKSEL: '[Bip! İletişim sadece sesle olmaz, beden dili de bir koddur!]'",
    medyaUrl: "/assets/bolum13.mp4",
    medyaTipi: 'video'
  },
  14: {
    baslik: "Dijital Toprak, Organik Çiçek",
    icerik: "PİKSEL: 'Elma kabukları çöp değil, toprağın en yüksek enerji vitaminleridir, bip-bop!' UMUT: 'Onları kompost kutusuna atıyoruz ve bak! Bahçemizde yepyeni sarı bir çiçek filizlendi.' PİKSEL: 'Muhteşem bir geri dönüşüm algoritması. Doğa en büyük mühendistir!'",
    medyaUrl: "/assets/bolum14.mp4",
    medyaTipi: 'video'
  }
};

// 14 sonrası için otomatik içerik jeneratörü - Orijinal yapı korundu
export const generateDynamicScenario = (no: number): Bolum => ({
  baslik: `Bölüm ${no}: Piksel'in Yeni Keşfi`,
  icerik: `Bu bölüm, ${no}. adımı temsil ediyor. Blokzinciri evreni genişlemeye devam ediyor ve ${no * 153} yeni veri bloğu sisteme eklendi. Keşfetmeye devam et, yönetmenim!`,
  medyaUrl: "/assets/default.jpg",
  medyaTipi: 'image'
});

// Merkezi erişim fonksiyonu - Orijinal fonksiyon yapısı korundu
export const getBolumIcerik = (no: number): Bolum => senaryoVeritabani[no] || generateDynamicScenario(no);