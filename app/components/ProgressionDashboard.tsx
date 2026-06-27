'use client';
import { useReadContract, useAccount } from 'wagmi';
import { CONTRACT_ADDRESS } from '@/lib/constants';

// Derleme hatasını sıfırlamak için ABI'ı doğrudan sözleşme şeması olarak içeri gömüyoruz
const SAF_SÖZLEŞME_ABI = [
  {
    "inputs": [{ "type": "address", "name": "" }],
    "name": "kullaniciSkoru",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

export default function ProgressionDashboard() {
  const { address } = useAccount();

  // Kontratındaki kullanıcıSkoru fonksiyonunu doğrudan hedefliyoruz
  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: SAF_SÖZLEŞME_ABI as any,
    functionName: 'kullaniciSkoru', 
    args: address ? [address] : undefined,
  });

  const skor = data ? Number(data) : 0;

  return (
    <div className="bg-[#0A192F] border border-[#FF6B35] rounded-2xl p-6 text-center shadow-xl">
      <h3 className="text-xl text-[#E6EDF6]">Eğitsel Başarı Skoru</h3>
      <p className="text-4xl font-bold text-[#FF6B35] mt-2">
        {isLoading ? "Yükleniyor..." : `${skor} / 14`}
      </p>
      {error && <p className="text-red-500 text-xs mt-2">Hata: {error.message}</p>}
    </div>
  );
}