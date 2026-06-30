// scripts/deploy.ts
import { ethers, network, run } from "hardhat";

/**
 * RoyaltyDistributor sözleşmesini dağıtır.
 *   npm run deploy:sepolia     (Sepolia testnet)
 *   npm run deploy:local       (yerel hardhat node)
 */
async function main() {
  const PLATFORM_FEE_BPS = 250; // %2.5

  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("──────────────────────────────────────────────");
  console.log("Ağ        :", network.name);
  console.log("Dağıtıcı  :", deployer.address);
  console.log("Bakiye    :", ethers.formatEther(balance), "ETH");
  console.log("Platform% :", PLATFORM_FEE_BPS / 100, "%");
  console.log("──────────────────────────────────────────────");

  const factory = await ethers.getContractFactory("RoyaltyDistributor");
  const contract = await factory.deploy(PLATFORM_FEE_BPS, deployer.address);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("\n✅ RoyaltyDistributor dağıtıldı:", address);
  console.log("\n.env.local içine ekleyin:");
  console.log(`NEXT_PUBLIC_ROYALTY_CONTRACT=${address}\n`);

  // Etherscan doğrulaması (yalnızca Sepolia + API anahtarı varsa)
  if (network.name === "sepolia" && process.env.ETHERSCAN_API_KEY) {
    console.log("5 blok onayı bekleniyor (doğrulama için)…");
    await contract.deploymentTransaction()?.wait(5);
    try {
      await run("verify:verify", {
        address,
        constructorArguments: [PLATFORM_FEE_BPS, deployer.address],
      });
      console.log("🔎 Etherscan doğrulaması tamamlandı.");
    } catch (err) {
      console.warn("Doğrulama atlandı:", (err as Error).message);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
