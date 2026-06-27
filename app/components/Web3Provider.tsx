'use client';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

const config = getDefaultConfig({
  appName: 'PikselUmut',
  projectId: 'YOUR_PROJECT_ID', // Buraya WalletConnect projenin ID'sini yazmalısın
  chains: [sepolia],
  transports: {
    // Public RPC yerine Sepolia için daha stabil çalışan bir adres kullanıyoruz
    [sepolia.id]: http('https://sepolia.drpc.org'), 
  },
});

const client = new QueryClient();

export default function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}