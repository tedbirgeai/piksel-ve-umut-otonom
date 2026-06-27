'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// "Piksel ve Umut" Senaryo Görsel Eşleşmesi
const SENARYO_GÖRSELLERİ: { [key: string]: { baslik: string; detay: string; url: string; renk: string } } = {
  "1": { baslik: "Tanışma ve İlk Küp", detay: "Geometrik şekilleri tanıma", url: "https://images.unsplash.com/photo-1606166325683-e6deb697d301?q=80&w=500", renk: "#FF6B35" },
  "2": { baslik: "Şekiller Ülkesi", detay: "Boyutsal ve geometrik algı", url: "https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=500", renk: "#38bdf8" },
  "3": { baslik: "Renklerin Senfonisi", detay: "Renk uyumu ve tonlamalar", url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=500", renk: "#22c55e" },
  "4": { baslik: "Nezaket Kelimeleri", detay: "'Lütfen', 'Teşekkür ederim' kullanımı", url: "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=500", renk: "#eab308" },
  "5": { baslik: "Sabırlı Küçük Filiz", detay: "Doğa bilinci ve sabır öğretisi", url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=500", renk: "#10b981" },
  "6": { baslik: "Melodilerin Dili", detay: "Temel ritim ve müzik algısı", url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=500", renk: "#a78bfa" },
  "7": { baslik: "Hayal Gücü Bulutu", detay: "Yaratıcı düşünce egzersizleri", url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=500", renk: "#06b6d4" },
  "8": { baslik: "Düzenli Oda Görevi", detay: "Sorumluluk ve organizasyon bilinci", url: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=500", renk: "#ec4899" },
  "9": { baslik: "Hayvanlar Alemi", detay: "Canlılara empati ve sevgi yaklaşımı", url: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?q=80&w=3b82f6", renk: "#3b82f6" },
  "10": { baslik: "Kayıp Oyuncak Dedektifi", detay: "Problem çözme ve analitik mantık", url: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?q=80&w=500", renk: "#8b5cf6" },
  "11": { baslik: "Sessiz Sinema Robotu", detay: "Beden dili ve ifade yeteneği", url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=500", renk: "#f97316" },
  "12": { baslik: "Dijital Toprak, Organik Çiçek", detay: "Teknoloji ve tarım sentezi", url: "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?q=80&w=600", renk: "#14b8a6" },
  "13": { baslik: "Yıldızlararası Kardeşlik", detay: "Evrensel barış ve takım çalışması", url: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=600", renk: "#6366f1" },
  "14": { baslik: "Geleceğin Tohumu", detay: "Sürdürülebilirlik ve ekolojik vizyon", url: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?q=80&w=600", renk: "#0284c7" }
};

export default function PikselVeUmutMasterPanel() {
  const [skor, setSkor] = useState<string>("0");
  const [userAddress, setUserAddress] = useState<string>("");
  const [contract, setContract] = useState<any>(null);
  const [bolumNo, setBolumNo] = useState<string>("1");
  const [txYukleniyor, setTxYukleniyor] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);

  const [yapimci, setYapimci] = useState<string>("Yükleniyor...");
  const [nftSahibi, setNftSahibi] = useState<string>("Yükleniyor...");

  const [senaryoKonusu, setSenaryoKonusu] = useState<string>("Piksel dünyada telif savaşları");
  const [üretilenSenaryo, setÜretilenSenaryo] = useState<string>("");
  const [aiYukleniyor, setAiYukleniyor] = useState<boolean>(false);
  const [aiDurumMesaji, setAiDurumMesaji] = useState<string>("");

  useEffect(() => {
    setIsClient(true);
    async function baglanWeb3() {
      try {
        if (typeof window !== 'undefined' && (window as any).ethereum) {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          const accounts = await provider.send("eth_requestAccounts", []);
          setUserAddress(accounts[0]);

          const contractAddress = "0xCAaad7A31b46AE5dE7FD93dbdE6165fBD12Af02B";
          const abi = [
            "function kullaniciSkoru(address user) view returns (uint256)",
            "function bolumTamamla(uint256 _bolumNo) external",
            "function bolumNftSahibi() view returns (address)",
            "function yapimciAdresi() view returns (address)"
          ];

          const signer = await provider.getSigner();
          const contractInstance = new ethers.Contract(contractAddress, abi, signer);
          setContract(contractInstance);

          const [guncelSkor, yapimciCüzdan, nftCüzdan] = await Promise.all([
            contractInstance.kullaniciSkoru(accounts[0]),
            contractInstance.yapimciAdresi(),
            contractInstance.bolumNftSahibi()
          ]);

          setSkor(guncelSkor.toString());
          setYapimci(yapimciCüzdan);
          setNftSahibi(nftCüzdan);
        } else {
          setSkor("Cüzdan Yok");
        }
      } catch (err) {
        console.error("Web3 Bağlantı Hatası:", err);
        setSkor("Hata");
      }
    }
    baglanWeb3();
  }, []);

  const senaryoUret = async () => {
    if (!senaryoKonusu.trim()) return alert("Lütfen bir senaryo konusu girin!");
    setAiYukleniyor(true);
    setÜretilenSenaryo("");
    setAiDurumMesaji("Ollama Sınır Bilişim Motoru Başlatılıyor...");

    const t1 = setTimeout(() => setAiDurumMesaji("Llama3 Çekirdeği Pedagojik Yapıyı Kuruyor..."), 1500);
    const t2 = setTimeout(() => setAiDurumMesaji("Metin İçeriği ve Telif Parametreleri İşleniyor..."), 4500);

    try {
      const response = await fetch('http://127.0.0.1:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3',
          prompt: `Sen dünya çapında milyonlarca öğrencinin faydalanacağı Milli Eğitim onaylı 'Piksel ve Umut' projesinin baş senaryo yazarısın. Konu: ${senaryoKonusu}. Bu konu hakkında pedagojik kurallara uygun, sürükleyici, kısa ve net bir dijital kütüphane hikayesi/bölümü kurgula.`,
          stream: false
        })
      });

      if (!response.ok) throw new Error("Ollama servisi yanıt vermedi.");
      const result = await response.json();
      setÜretilenSenaryo(result.response || "Senaryo üretilemedi.");
      setAiDurumMesaji("Başarılı.");
    } catch (error) {
      console.error("Ollama Bağlantı Hatası:", error);
      setÜretilenSenaryo("⚠️ OLLAMA BAĞLANTI HATASI!\n\nArka planda terminalde 'ollama run llama3' komutunun açık olduğunu doğrulayın.");
      setAiDurumMesaji("Bağlantı Hatası.");
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      setAiYukleniyor(false);
    }
  };

  const blockchainTelifBas = async () => {
    if (!contract) return alert("Akıllı sözleşme bağlantısı hazır değil!");
    setTxYukleniyor(true);
    try {
      const tx = await contract.bolumTamamla(BigInt(bolumNo));
      setSkor("Onay Bekleniyor...");
      await tx.wait();
      
      alert(`🎉 BAŞARILI! Bölüm ${bolumNo} blockchain'e işlendi. Telif dağıtımı yapımcı ve NFT sahibi arasında otomatik olarak paylaştırıldı!`);
      
      const yeniSkor = await contract.kullaniciSkoru(userAddress);
      setSkor(yeniSkor.toString());
    } catch (error: any) {
      console.error("Blockchain İşlem Hatası:", error);
      alert("Blockchain Hatası: " + (error.reason || error.message || "İşlem reddedildi."));
      if (contract && userAddress) {
        const eskiSkor = await contract.kullaniciSkoru(userAddress);
        setSkor(eskiSkor.toString());
      }
    } finally {
      setTxYukleniyor(false);
    }
  };

  const aktifGorsel = SENARYO_GÖRSELLERİ[bolumNo] || {
    baslik: `${bolumNo}. Özel Bölüm`,
    detay: "Özel Geliştirme Sahnesi",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=500",
    renk: "#cbd5e1"
  };

  if (!isClient) return <div style={{ color: '#38bdf8', padding: '40px', fontFamily: 'monospace', textAlign: 'center', fontSize: '20px' }}>⚡ SİSTEM CANLANDIRILIYOR...</div>;

  return (
    <div style={{ padding: '30px', backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc', fontFamily: 'monospace' }}>
      
      {/* ÜST MÜHÜRLÜ PANEL */}
      <div style={{ border: '1px solid #1e3a8a', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', padding: '25px', borderRadius: '16px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '26px' }}>🌍</span>
            <h1 style={{ color: '#38bdf8', fontSize: '24px', margin: 0, fontWeight: '900' }}>PİKSEL VE UMUT: 100 SENARYO MASTER PANEL</h1>
          </div>
          <p style={{ color: '#64748b', margin: '8px 0 0 0', fontSize: '13px', fontFamily: 'sans-serif' }}>
            Milli Eğitim Kütüphanesi & Dünya Çapında İlk Merkeziyetsiz Eğitim Ekosistemi
          </p>
          <div style={{ marginTop: '12px', fontSize: '12px', color: '#94a3b8', backgroundColor: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: '6px', display: 'inline-block', border: '1px solid #1e293b' }}>
            Aktif Cüzdan: <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{userAddress || "Bağlanıyor..."}</span>
          </div>
        </div>

        <div style={{ background: '#0f172a', border: '2px solid #eab308', padding: '15px 30px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
          <div style={{ fontSize: '11px', color: '#eab308', fontWeight: 'bold', letterSpacing: '1px' }}>EKOSİSTEM SKORUNUZ</div>
          <div style={{ fontSize: '46px', color: '#ffffff', fontWeight: '900', marginTop: '2px' }}>{skor}</div>
        </div>
      </div>

      {/* CANLI EKOSİSTEM ROLLERİ BİLGİ ŞERİDİ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
        <div style={{ backgroundColor: '#0f172a', border: '1px dashed #22c55e', padding: '15px', borderRadius: '10px', fontSize: '12px' }}>
          <span style={{ color: '#22c55e', fontWeight: 'bold' }}>👤 RESMİ YAPIMCI ADRESİ:</span> <code style={{ color: '#cbd5e1', display: 'block', marginTop: '5px', wordBreak: 'break-all', backgroundColor: 'rgba(0,0,0,0.2)', padding: '5px' }}>{yapimci}</code>
        </div>
        <div style={{ backgroundColor: '#0f172a', border: '1px dashed #38bdf8', padding: '15px', borderRadius: '10px', fontSize: '12px' }}>
          <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>👑 KÜTÜPHANE NFT SAHİBİ:</span> <code style={{ color: '#cbd5e1', display: 'block', marginTop: '5px', wordBreak: 'break-all', backgroundColor: 'rgba(0,0,0,0.2)', padding: '5px' }}>{nftSahibi}</code>
        </div>
      </div>

      {/* ÜÇ MOTORLU PANEL DÜZENİ: AI | GÖRSEL | BLOCKCHAIN */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '25px' }}>
        
        {/* SOL MOTOR: PİKSEL ASİSTANI */}
        <div style={{ backgroundColor: '#0f172a', padding: '25px', borderRadius: '16px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '520px' }}>
          <div>
            <h2 style={{ color: '#a78bfa', margin: '0 0 15px 0', fontSize: '18px', fontWeight: 'bold' }}>🤖 Piksel Asistanı</h2>
            
            {/* Sohbet Alanı */}
            <div style={{ height: '200px', backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '8px', padding: '10px', marginBottom: '15px', color: '#cbd5e1', fontSize: '12px', overflowY: 'auto' }}>
              <p>👋 Merhaba! Ben Piksel Asistanı. Size nasıl yardımcı olabilirim?</p>
              {üretilenSenaryo && <p style={{ color: '#38bdf8' }}>{üretilenSenaryo}</p>}
            </div>

            <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1', fontSize: '12px', fontWeight: 'bold' }}>FABRİKAYA KOMUT VER:</label>
            <div style={{ display: 'flex', gap: '5px' }}>
              <input 
                type="text" 
                value={senaryoKonusu} 
                onChange={(e) => setSenaryoKonusu(e.target.value)}
                placeholder="Senaryo vizyonunuzu girin..."
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#020617', color: '#ffffff', fontFamily: 'sans-serif' }}
              />
              <button onClick={senaryoUret} disabled={aiYukleniyor} style={{ padding: '10px 15px', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                ➤
              </button>
            </div>
          </div>

          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid #1e293b', borderRadius: '8px', textAlign: 'center', fontSize: '10px', color: '#64748b' }}>
            {aiYukleniyor ? "⚡ İşleniyor..." : "Piksel AI v1.0 - Bağımsız Modül"}
          </div>
        </div>

        {/* ORTA PANEL: DİNAMİK KARAKTER GÖRSEL KATMANI */}
        <div style={{ backgroundColor: '#0f172a', padding: '25px', borderRadius: '16px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '520px' }}>
          <div>
            <h2 style={{ color: '#4ade80', margin: '0 0 5px 0', fontSize: '18px', fontWeight: 'bold' }}>🎨 Dinamik Karakter Görseli</h2>
            <p style={{ color: '#64748b', fontSize: '11px', fontFamily: 'sans-serif', marginBottom: '15px' }}>Bölüm numarasına göre belgenizdeki resmi sahneler canlı senkronize edilir.</p>
          </div>

          <div style={{ width: '100%', position: 'relative', borderRadius: '12px', overflow: 'hidden', border: `2px solid ${aktifGorsel.renk}`, backgroundColor: '#020617', height: '280px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={aktifGorsel.url} 
              alt={aktifGorsel.baslik} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)', padding: '15px' }}>
              <span style={{ position: 'absolute', top: '-220px', right: '10px', backgroundColor: 'rgba(0,0,0,0.7)', border: `1px solid ${aktifGorsel.renk}`, padding: '2px 8px', borderRadius: '4px', fontSize: '10px', color: '#fff' }}>
                BÖLÜM {bolumNo}
              </span>
              <h4 style={{ margin: 0, fontSize: '15px', color: '#ffffff', fontWeight: 'bold' }}>{aktifGorsel.baslik}</h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#38bdf8', fontFamily: 'sans-serif', fontStyle: 'italic' }}>{aktifGorsel.detay}</p>
            </div>
          </div>

          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid #1e293b', borderRadius: '8px', textAlign: 'center', fontSize: '10px', color: '#64748b' }}>
            Dijital İçerik Veritabanı: <span style={{ color: '#eab308' }}>PİKSEL-UMUT-GÖRSEL-MODÜLÜ</span>
          </div>
        </div>

        {/* SAĞ PANEL: BLOCKCHAIN TELİF DAĞITIMI */}
        <div style={{ backgroundColor: '#0f172a', padding: '25px', borderRadius: '16px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '520px' }}>
          <div>
            <h2 style={{ color: '#38bdf8', margin: '0 0 15px 0', fontSize: '18px', fontWeight: 'bold' }}>⛓️ API Telif Kilit Motoru</h2>
            <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1', fontSize: '12px', fontWeight: 'bold' }}>ONAYLANAN BÖLÜM NUMARASI (ID):</label>
            <input 
              type="number" 
              min="1"
              max="14"
              value={bolumNo} 
              onChange={(e) => setBolumNo(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#020617', color: '#ffffff', marginBottom: '15px' }}
            />
            <p style={{ color: '#64748b', fontSize: '11px', fontFamily: 'sans-serif', marginTop: '-10px', marginBottom: '15px' }}>Görselleri ve bölümleri test etmek için 1-14 arası değiştirin.</p>
            <button onClick={blockchainTelifBas} disabled={txYukleniyor} style={{ width: '100%', padding: '14px', backgroundColor: '#0284c7', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              {txYukleniyor ? "🔒 Blokzincire Mühürleniyor..." : "🔒 Bölümü Onayla & Telifi Ağa Dağıt"}
            </button>
            
            {/* EKLENEN MODÜL: EĞİTİM KATKI RAPORU */}
            <div style={{ marginTop: '25px', padding: '20px', backgroundColor: '#070a13', border: '1px solid #1e293b', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ color: '#ffffff', fontSize: '14px', fontWeight: 'bold', margin: 0 }}>🌟 Eğitim Katkı Raporu</h3>
                <span style={{ backgroundColor: '#1e293b', color: '#94a3b8', fontSize: '10px', padding: '2px 8px', borderRadius: '4px' }}>Ekosistem Puanı</span>
              </div>
              <div style={{ textAlign: 'center', padding: '10px' }}>
                <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 5px 0' }}>Biriken Gelişim Puanınız:</p>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#38bdf8' }}>0.00 <span style={{ fontSize: '14px', color: '#64748b' }}>PİKSEL</span></div>
              </div>
              <button style={{ marginTop: '15px', width: '100%', padding: '10px', backgroundColor: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                Puanları Kullanıma Aç
              </button>
            </div>
          </div>

          <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#070a13', borderLeft: '4px solid #38bdf8', borderRadius: '0 10px 10px 0', fontSize: '12px', color: '#94a3b8', fontFamily: 'sans-serif', lineHeight: '1.5' }}>
            <strong style={{ color: '#38bdf8', fontFamily: 'monospace', display: 'block', marginBottom: '4px' }}>Telif Dağıtım Dağılımı:</strong> 
            İşlem onaylandığında yukarıda listelenen Yapımcı ve NFT Sahibi adreslerine telif payları akıllı sözleşme tarafından otomatik olarak aktarılır.
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}