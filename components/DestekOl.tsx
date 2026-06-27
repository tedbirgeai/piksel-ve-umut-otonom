'use client';
import { useState } from 'react';
import { useSendTransaction } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACT_ADDRESS } from '../lib/constants';

export function DestekOl() {
  const [amount, setAmount] = useState('0.01');
  const { sendTransaction } = useSendTransaction();

  return (
    <div className="mt-10 p-6 border rounded-xl shadow-lg bg-white w-full max-w-sm">
      <h2 className="text-xl font-semibold mb-4">Projeye Destek Ol</h2>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="border p-2 w-full mb-4 rounded"
      />
      <button
        onClick={() => sendTransaction({ to: CONTRACT_ADDRESS as `0x${string}`, value: parseEther(amount) })}
        className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold w-full hover:bg-blue-700 transition"
      >
        Gönder (ETH)
      </button>
    </div>
  );
}