// lib/contract.ts
import type { Abi } from "viem";

/**
 * Piksel ve Umut "Üretim Sertifikası" sözleşmesi (PikselUmutCertificate.sol).
 * ERC-721 + ERC-2981 + erişim-bazlı telif dağıtımı.
 *
 * Dağıtım:  npm run deploy:sepolia
 * Sonra çıktıdaki adresi .env.local içine ekleyin:
 *   NEXT_PUBLIC_CERTIFICATE_CONTRACT=0x...
 * (Geriye dönük uyum: NEXT_PUBLIC_ROYALTY_CONTRACT da okunur.)
 */
const ZERO = "0x0000000000000000000000000000000000000000";

/** Geçerli bir EVM adresi mi? (0x + 40 hex). Değilse sıfır adrese normalize et. */
function normalizeAddress(v?: string): `0x${string}` {
  const s = (v ?? "").trim();
  return /^0x[a-fA-F0-9]{40}$/.test(s) ? (s as `0x${string}`) : (ZERO as `0x${string}`);
}

// .env'de "0", boş, ya da yarım adres yazılsa bile GEÇERSİZ sayılır → demo modu.
export const CERTIFICATE_CONTRACT_ADDRESS = normalizeAddress(
  process.env.NEXT_PUBLIC_CERTIFICATE_CONTRACT ??
    process.env.NEXT_PUBLIC_ROYALTY_CONTRACT,
);

/** Geriye dönük ad — eski importlar çalışsın diye. */
export const ROYALTY_CONTRACT_ADDRESS = CERTIFICATE_CONTRACT_ADDRESS;

/** PikselUmutCertificate ABI'si — sözleşmedeki imzalarla birebir. */
export const certificateAbi = [
  {
    type: "function",
    name: "mintCertificate",
    stateMutability: "nonpayable",
    inputs: [
      { name: "cid", type: "string" },
      { name: "accessPrice", type: "uint256" },
      { name: "stage", type: "string" },
      { name: "subject", type: "string" },
      { name: "title", type: "string" },
    ],
    outputs: [{ name: "tokenId", type: "uint256" }],
  },
  {
    type: "function",
    name: "accessContent",
    stateMutability: "payable",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "setAccessPrice",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "newPrice", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "setActive",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "active", type: "bool" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "withdrawableRoyalty",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "totalEarned",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "withdraw",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "donate",
    stateMutability: "payable",
    inputs: [{ name: "dedication", type: "string" }],
    outputs: [],
  },
  {
    type: "function",
    name: "sponsorCreator",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "donationPool",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "totalDonated",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "event",
    name: "Donated",
    inputs: [
      { name: "donor", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "dedication", type: "string", indexed: false },
    ],
  },
  {
    type: "event",
    name: "CreatorSponsored",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "ownerOf",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "tokenURI",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
  },
  {
    type: "function",
    name: "certificates",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      { name: "creator", type: "address" },
      { name: "accessPrice", type: "uint256" },
      { name: "active", type: "bool" },
      { name: "cid", type: "string" },
      { name: "stage", type: "string" },
      { name: "subject", type: "string" },
      { name: "title", type: "string" },
      { name: "mintedAt", type: "uint64" },
    ],
  },
  {
    type: "function",
    name: "hasAccess",
    stateMutability: "view",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "reader", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "event",
    name: "CertificateMinted",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "accessPrice", type: "uint256", indexed: false },
      { name: "cid", type: "string", indexed: false },
      { name: "stage", type: "string", indexed: false },
      { name: "subject", type: "string", indexed: false },
    ],
  },
  {
    type: "event",
    name: "AccessPurchased",
    inputs: [
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "reader", type: "address", indexed: true },
      { name: "beneficiary", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "RoyaltyWithdrawn",
    inputs: [
      { name: "account", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "function",
    name: "donatedBy",
    stateMutability: "view",
    inputs: [{ name: "donor", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "lessonSponsorship",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const satisfies Abi;

/** Geriye dönük ad. */
export const royaltyAbi = certificateAbi;

/** Sözleşme tanımlı mı? (geçersiz/sıfır adres = demo modu) */
export const isContractConfigured = CERTIFICATE_CONTRACT_ADDRESS !== ZERO;
