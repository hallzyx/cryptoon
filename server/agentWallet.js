import { CdpClient } from "@coinbase/cdp-sdk";
import { parseUnits } from "viem";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AGENT_WALLET_DATA_PATH = path.join(__dirname, "agentWalletData.json");

let cdpClient = null;
let agentAccount = null;

/**
 * Initialize CDP Client and Agent Wallet
 * Uses CDP SDK v2 for wallet management
 */
export async function initializeAgentWallet() {
  try {
    console.log("🤖 Initializing Agent Wallet with CDP SDK v2...");
    
    // Initialize CDP Client with API credentials from environment
    cdpClient = new CdpClient({
      apiKeyId: process.env.CDP_API_KEY_ID,
      apiKeySecret: process.env.CDP_API_KEY_SECRET,
      walletSecret: process.env.CDP_WALLET_SECRET
    });
    
    // Check if we have saved wallet data
    if (fs.existsSync(AGENT_WALLET_DATA_PATH)) {
      const walletData = JSON.parse(fs.readFileSync(AGENT_WALLET_DATA_PATH, "utf-8"));
      
      // Restore existing account using saved address
      // CDP SDK v2 automatically manages the account via walletSecret
      agentAccount = {
        address: walletData.address,
        network: walletData.network || "base-sepolia"
      };
      
      console.log(`✅ Agent Wallet restored: ${agentAccount.address}`);
    } else {
      // Create new EVM account on Base Sepolia
      const newAccount = await cdpClient.evm.createAccount({
        network: "base-sepolia"
      });
      
      agentAccount = {
        address: newAccount.address,
        network: "base-sepolia"
      };
      
      // Save wallet data for future use
      fs.writeFileSync(
        AGENT_WALLET_DATA_PATH,
        JSON.stringify({
          address: agentAccount.address,
          network: agentAccount.network,
          createdAt: new Date().toISOString()
        }, null, 2)
      );
      
      console.log(`✅ New Agent Wallet created: ${agentAccount.address}`);
      console.log(`⚠️  Please fund this wallet with USDC to enable auto-purchases`);
    }
    
    return agentAccount;
    
  } catch (error) {
    console.error("❌ Failed to initialize Agent Wallet:", error);
    throw error;
  }
}

/**
 * Get agent wallet address
 */
export function getAgentWalletAddress() {
  if (!agentAccount) {
    throw new Error("Agent wallet not initialized. Call initializeAgentWallet() first.");
  }
  return agentAccount.address;
}

/**
 * Get agent wallet balance (USDC)
 */
export async function getAgentBalance() {
  try {
    if (!agentAccount) {
      throw new Error("Agent wallet not initialized");
    }
    
    // Use CDP Token Balances API directly (REST)
    const { generateJwt } = await import("@coinbase/cdp-sdk/auth");
    
    const jwt = await generateJwt({
      apiKeyId: process.env.CDP_API_KEY_ID,
      apiKeySecret: process.env.CDP_API_KEY_SECRET,
      requestMethod: "GET",
      requestHost: "api.cdp.coinbase.com",
      requestPath: `/platform/v2/evm/token-balances/${agentAccount.network}/${agentAccount.address}`,
      expiresIn: 120,
    });

    const response = await fetch(
      `https://api.cdp.coinbase.com/platform/v2/evm/token-balances/${agentAccount.network}/${agentAccount.address}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Token Balances API error:", errorText);
      return "0";
    }

    const data = await response.json();
    
    // Find USDC balance on Base Sepolia
    const usdcAddress = "0x036CbD53842c5426634e7929541eC2318f3dCF7e".toLowerCase();
    const usdcBalance = data.balances?.find(
      b => b.token.contractAddress.toLowerCase() === usdcAddress
    );
    
    if (usdcBalance) {
      // Convert to decimal format
      const amount = BigInt(usdcBalance.amount.amount);
      const decimals = usdcBalance.amount.decimals;
      const divisor = BigInt(10 ** decimals);
      const balance = Number(amount) / Number(divisor);
      return balance.toFixed(6);
    }
    
    return "0";
    
  } catch (error) {
    console.error("❌ Error fetching agent balance:", error);
    return "0";
  }
}

/**
 * Transfer USDC from agent wallet to receiver
 * @param {string} to - Receiver wallet address
 * @param {string} amount - Amount in USDC (e.g., "0.01")
 * @returns {Promise<string>} Transaction hash
 */
export async function transferUSDC(to, amount) {
  try {
    if (!cdpClient || !agentAccount) {
      throw new Error("Agent wallet not initialized");
    }
    
    console.log(`💸 Agent transferring ${amount} USDC to ${to}...`);
    
    // USDC contract address on Base Sepolia
    const USDC_CONTRACT = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
    
    // Convert amount to smallest unit (USDC has 6 decimals)
    const amountInSmallestUnit = parseUnits(amount, 6);
    
    // Encode ERC-20 transfer function call
    // function transfer(address to, uint256 amount) returns (bool)
    const { encodeFunctionData } = await import("viem");
    const data = encodeFunctionData({
      abi: [
        {
          name: 'transfer',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'to', type: 'address' },
            { name: 'amount', type: 'uint256' }
          ],
          outputs: [{ type: 'bool' }]
        }
      ],
      functionName: 'transfer',
      args: [to, amountInSmallestUnit]
    });
    
    // Send transaction using CDP SDK v2
    const transactionResult = await cdpClient.evm.sendTransaction({
      address: agentAccount.address,
      network: agentAccount.network,
      transaction: {
        to: USDC_CONTRACT,
        data: data,
        value: 0n // No ETH value for ERC-20 transfer
      }
    });
    
    const txHash = transactionResult.transactionHash;
    
    console.log(`✅ Transfer successful!`);
    console.log(`   Transaction: https://sepolia.basescan.org/tx/${txHash}`);
    
    return txHash;
    
  } catch (error) {
    console.error("❌ Error transferring USDC:", error);
    throw error;
  }
}

/**
 * Check if agent has sufficient balance for purchase
 * Check if agent has sufficient balance for a transfer
 * @param {string} amount - Amount in USDC
 * @returns {Promise<boolean>}
 */
export async function hasSufficientBalance(amount) {
  try {
    const balance = await getAgentBalance();
    const balanceNum = parseFloat(balance);
    const requiredAmount = parseFloat(amount);
    
    return balanceNum >= requiredAmount;
    
  } catch (error) {
    console.error("❌ Error checking balance:", error);
    return false;
  }
}
