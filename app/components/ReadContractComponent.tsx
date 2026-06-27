'use client';
import { useReadContract, useAccount } from 'wagmi';

// Sözleşme adresi ve ABI buraya gelecek
const CONTRACT_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' as `0x${string}`;
const ABI = [ { "inputs": [], "name": "name", "outputs": [{ "type": "string" }], "stateMutability": "view", "type": "function" } ];

export default function ReadContractComponent() {
  const { isConnected, chainId } = useAccount();

  const { data, isLoading, error } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'name',
    query: { enabled: isConnected }
  });

  if (!isConnected) return <div>Cüzdan bağlı değil.</div>;
  if (isLoading) return <div>Veri çekiliyor...</div>;
  if (error) return <div style={{color: 'red'}}>Hata: {error.message}</div>;

  return (
    <div>
      <h3>Sözleşme Bilgisi: {data ? String(data) : "Boş cevap döndü"}</h3>
      <p>Bağlı Ağ ID: {chainId}</p>
    </div>
  );
}