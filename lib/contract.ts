// lib/contract.ts
import type { Abi } from "viem";

/**
 * Telif Dağıtım akıllı sözleşmesi (RoyaltyDistributor.sol).
 * Sözleşmeyi `npm run deploy:sepolia` ile dağıtın, çıktıdaki adresi
 * .env.local içine NEXT_PUBLIC_ROYALTY_CONTRACT olarak ekleyin.
 */
export const ROYALTY_CONTRACT_ADDRESS = (process.env
  .NEXT_PUBLIC_ROYALTY_CONTRACT ??
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

/** RoyaltyDistributor ABI'si — sözleşmedeki imzalarla birebir. */
export const royaltyAbi = [
  {
    type: "function",
    name: "registerContent",
    stateMutability: "nonpayable",
    inputs: [
      { name: "cid", type: "string" },
      { name: "accessPrice", type: "uint256" },
    ],
    outputs: [{ name: "contentId", type: "uint256" }],
  },
  {
    type: "function",
    name: "setAccessPrice",
    stateMutability: "nonpayable",
    inputs: [
      { name: "contentId", type: "uint256" },
      { name: "newPrice", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "setActive",
    stateMutability: "nonpayable",
    inputs: [
      { name: "contentId", type: "uint256" },
      { name: "active", type: "bool" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "accessContent",
    stateMutability: "payable",
    inputs: [{ name: "contentId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "withdrawableRoyalty",
    stateMutability: "view",
    inputs: [{ name: "creator", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "totalEarned",
    stateMutability: "view",
    inputs: [{ name: "creator", type: "address" }],
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
    name: "hasAccess",
    stateMutability: "view",
    inputs: [
      { name: "contentId", type: "uint256" },
      { name: "reader", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "contents",
    stateMutability: "view",
    inputs: [{ name: "contentId", type: "uint256" }],
    outputs: [
      { name: "creator", type: "address" },
      { name: "accessPrice", type: "uint256" },
      { name: "active", type: "bool" },
      { name: "cid", type: "string" },
    ],
  },
  {
    type: "function",
    name: "platformFeeBps",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint96" }],
  },
  {
    type: "event",
    name: "ContentRegistered",
    inputs: [
      { name: "contentId", type: "uint256", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "accessPrice", type: "uint256", indexed: false },
      { name: "cid", type: "string", indexed: false },
    ],
  },
  {
    type: "event",
    name: "AccessPurchased",
    inputs: [
      { name: "contentId", type: "uint256", indexed: true },
      { name: "reader", type: "address", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "RoyaltyWithdrawn",
    inputs: [
      { name: "creator", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
] as const satisfies Abi;

/** Sözleşme tanımlı mı? (sıfır adres = demo modu) */
export const isContractConfigured =
  ROYALTY_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000";
