const { ethers } = require("ethers");

const RPC_URL = "https://eth.drpc.org"; 
const provider = new ethers.JsonRpcProvider(RPC_URL);

const ERC20_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)"
];

const TOKENS = [
    { symbol: "USDT", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7" },
    { symbol: "USDC", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eb48" },
    { symbol: "PEPE", address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933" },
    { symbol: "SHIB", address: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE" }
];

let lastBalances = {};

async function monitorWallet(address) {
    try {
        if (!ethers.isAddress(address)) {
            console.log("Error: Please provide a valid 0x wallet address.");
            return;
        }

        console.log("\n==============================================");
        console.log(`🚀 AYO RADAR: STARTING LIVE MONITOR`);
        console.log(`🎯 TARGET: ${address}`);
        console.log("==============================================\n");

        setInterval(async () => {
            try {
                // 1. Monitor Native ETH
                const ethBalRaw = await provider.getBalance(address);
                const ethBal = ethers.formatEther(ethBalRaw);

                if (lastBalances["ETH"] !== undefined && lastBalances["ETH"] !== ethBal) {
                    console.log(`[${new Date().toLocaleTimeString()}] ⚠️ ALERT: ETH MOVEMENT!`);
                    console.log(`New Balance: ${ethBal} ETH\n`);
                }
                lastBalances["ETH"] = ethBal;

                // 2. Monitor ERC-20 Tokens
                for (const token of TOKENS) {
                    const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
                    const balRaw = await contract.balanceOf(address);
                    const decimals = await contract.decimals();
                    const bal = Number(balRaw) / Math.pow(10, Number(decimals));

                    if (lastBalances[token.symbol] !== undefined && lastBalances[token.symbol] !== bal) {
                        console.log(`[${new Date().toLocaleTimeString()}] ⚠️ ALERT: ${token.symbol} MOVEMENT!`);
                        console.log(`New Balance: ${bal.toFixed(2)} ${token.symbol}\n`);
                    }
                    lastBalances[token.symbol] = bal;
                }

                console.log(`[${new Date().toLocaleTimeString()}] Status: Scanning for changes...`);

            } catch (err) {
                console.log("[SYSTEM] Connection lag... retrying in next cycle.");
            }
        }, 20000); 

    } catch (error) {
        console.log("Fatal Error: Could not connect to the network.");
    }
}

const targetWallet = process.argv[2];
monitorWallet(targetWallet);