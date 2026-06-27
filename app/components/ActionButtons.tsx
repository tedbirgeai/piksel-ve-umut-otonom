'use client';
import { useSendTransaction, useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import { parseEther, isAddress } from 'viem';
import { speak } from './AudioNarrator';

interface ActionButtonsProps {
  bolumNo: number;
  onSuccess: () => void;
}

export default function ActionButtons({ bolumNo, onSuccess }: ActionButtonsProps) {
  const { isConnected } = useAccount();
  const { sendTransactionAsync, isPending, isSuccess } = useSendTransaction();
  const [hataDetayi, setHataDetayi] = useState<string | null>(null);
  const [muhurlemeBitti, setMuhurlemeBitti] = useState(false);

  const contractAddress = '0x4df6eb2e68a1b5c6e83897b3576c7598a11f1cf3';

  // Bölüm numarası değiştiğinde mühürleme durumunu sıfırla ki eski başarılar yeni bölümü tetiklemesin
  useEffect(() => {
    setMuhurlemeBitti(false);
  }, [bolumNo]);

  useEffect(() => {
    if (isSuccess) {
      setHataDetayi(null);
      setMuhurlemeBitti(true);
      speak(`Harika! ${bolumNo}. bölüm başarıyla tamamlandı. Hikayeyi okuyup sindirdiğinizde sonraki bölüme geçebilirsiniz.`);
      // 🚨 OTOMATİK GEÇİŞ SİLİNDİ! FREN ÇAKILDI.
    }
  }, [isSuccess, bolumNo]);

  const handleCompleteEpisode = async () => {
    setHataDetayi(null);
    if (!isAddress(contractAddress)) {
      setHataDetayi("Sözleşme adresi formatı geçersiz.");
      return;
    }

    try {
      await sendTransactionAsync({
        to: contractAddress as `0x${string}`,
        value: parseEther('0.0001'),
      });
    } catch (error: any) {
      console.error("Mühürleme Hatası:", error);
      const msg = error?.message || "";
      if (msg.includes("User rejected") || error?.code === 4001) {
        setHataDetayi("İşlem cüzdan üzerinden reddedildi.");
      } else {
        setHataDetayi(error?.shortMessage || msg.substring(0, 80) + "...");
      }
    }
  };

  if (!isConnected) return <p style={{ fontWeight: 'bold', color: '#666', textAlign: 'center' }}>Başlamak için lütfen cüzdanı bağlayın.</p>;

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      {/* Eğer mühürleme yapılmadıysa MÜHÜRLE butonu görünür */}
      {!muhurlemeBitti ? (
        <button 
          onClick={handleCompleteEpisode} 
          disabled={isPending} 
          style={{ 
            padding: '20px 40px', 
            background: isPending ? '#888' : '#FF4500', 
            color: 'white',
            borderRadius: '15px', 
            fontSize: '20px', 
            cursor: isPending ? 'not-allowed' : 'pointer', 
            border: 'none',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}
        >
          {isPending ? 'Telif Geliri Dağıtılıyor...' : `${bolumNo}. Bölümü Mühürle`}
        </button>
      ) : (
        /* Mühürleme bittiğinde kullanıcı sindire sindire okusun diye SONRAKİ BÖLÜMÜN anahtarını ona veriyoruz */
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
          <p style={{ color: '#2E8B57', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '15px' }}>
            ✓ {bolumNo}. Bölüm Blokzincirinde Mühürlendi!
          </p>
          <button 
            onClick={onSuccess} 
            style={{ 
              padding: '18px 50px', 
              background: '#2E8B57', 
              color: 'white',
              borderRadius: '15px', 
              fontSize: '20px', 
              cursor: 'pointer', 
              border: 'none',
              fontWeight: 'bold',
              boxShadow: '0 5px 15px rgba(46,139,87,0.3)'
            }}
          >
            Sonraki Bölüme Geç ➔
          </button>
        </div>
      )}
      
      {hataDetayi && (
        <div style={{ marginTop: '15px', padding: '12px 20px', background: '#FDF2F2', borderRadius: '12px', display: 'inline-block', border: '1px solid #F8D7DA' }}>
          <p style={{ color: '#B22222', fontWeight: 'bold', margin: '0 0 5px 0' }}>İşlem Hatası</p>
          <p style={{ color: '#555', fontSize: '0.85rem', fontFamily: 'monospace', margin: 0 }}>{hataDetayi}</p>
        </div>
      )}
    </div>
  );
}