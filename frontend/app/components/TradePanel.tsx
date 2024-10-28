"use client";

import React, { useState } from "react";
import { ethers } from "ethers";
import PumpOutTokenABI from "../../../contracts/out/PumpOutToken.sol/PumpOutToken.json";
import BridgeModal from "./BridgeModal";

interface TradePanelProps {
  network: string;
  tokenAddress: string;
}

const TradePanel: React.FC<TradePanelProps> = ({ network, tokenAddress }) => {
  const [tab, setTab] = useState("buy"); // "buy" or "sell"
  const [ethAmount, setEthAmount] = useState(0);
  const [tokenAmount, setTokenAmount] = useState(0);
  const [estimatedTokens, setEstimatedTokens] = useState(0);
  const [estimatedEth, setEstimatedEth] = useState(0);
  const [slippage, setSlippage] = useState(1); // 1% slippage default
  const [isBridgeModalOpen, setIsBridgeModalOpen] = useState(false);

  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = new ethers.Contract(
    tokenAddress,
    PumpOutTokenABI.abi,
    provider
  );

  const handleTabChange = (newTab: string) => {
    setTab(newTab);
    setEthAmount(0);
    setTokenAmount(0);
    setEstimatedTokens(0);
    setEstimatedEth(0);
  };

  const handleInputChange = async (value: number) => {
    if (tab === "buy") {
      setEthAmount(value);
      const estimated = await contract.estimateBuy(
        ethers.parseEther(value.toString())
      );
      setEstimatedTokens(Number(ethers.formatUnits(estimated, 18))); // assuming tokens have 18 decimals
    } else {
      setTokenAmount(value);
      const estimated = await contract.estimateSell(
        ethers.parseUnits(value.toString(), 18)
      );
      setEstimatedEth(Number(ethers.formatEther(estimated)));
    }
  };

  const executeTrade = async () => {
    const signer = await provider.getSigner();
    const contractWithSigner = contract.connect(signer);
    const slippageAdjusted = slippage / 100;

    if (tab === "buy") {
      const minTokens = Math.floor(estimatedTokens * (1 - slippageAdjusted));
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await contractWithSigner.buy(minTokens, {
        value: ethers.parseEther(ethAmount.toFixed(18)),
      });
    } else {
      const minETH = ethers.parseEther(
        (estimatedEth * (1 - slippageAdjusted)).toFixed(18)
      );
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await contractWithSigner.sell(
        ethers.parseUnits(tokenAmount.toString(), 18),
        minETH
      );
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-md text-white border-2 border-gray-600 shadow-lg min-w-[360px] mb-4">
      {/* Tabs */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => handleTabChange("buy")}
          className={`px-4 py-2 rounded transition-colors duration-150 ${
            tab === "buy"
              ? "bg-green-500 text-white"
              : "bg-gray-700 text-green-300"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => handleTabChange("sell")}
          className={`px-4 py-2 rounded transition-colors duration-150 ${
            tab === "sell"
              ? "bg-red-500 text-white"
              : "bg-gray-700 text-red-300"
          }`}
        >
          Sell
        </button>
        <button
          onClick={() => setIsBridgeModalOpen(true)}
          className="px-4 py-2 rounded bg-blue-700 text-blue-300 hover:bg-blue-500 hover:text-white"
        >
          Bridge
        </button>
      </div>

      {/* Input for ETH or Token Amount */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-400">
          {tab === "buy" ? "ETH Amount" : "Token Amount"}
        </label>
        <input
          type="number"
          value={tab === "buy" ? ethAmount : tokenAmount}
          onChange={(e) => handleInputChange(Number(e.target.value))}
          className="mt-1 block w-full border border-gray-500 rounded-md shadow-sm p-2 bg-gray-700 text-white"
          placeholder={
            tab === "buy" ? "Enter ETH amount" : "Enter token amount"
          }
        />
      </div>

      {/* Estimated Result */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-400">
          Estimated {tab === "buy" ? "Tokens" : "ETH"} (after {slippage}%
          slippage)
        </label>
        <p className="mt-1 text-lg">
          {tab === "buy" ? estimatedTokens : estimatedEth}
        </p>
      </div>

      {/* Slippage Control */}
      <div className="flex items-center mb-4">
        <label className="text-sm font-medium text-gray-400 mr-2">
          Set max slippage (%)
        </label>
        <input
          type="number"
          value={slippage}
          onChange={(e) => setSlippage(Number(e.target.value))}
          className="w-20 border border-gray-500 rounded-md p-1 bg-gray-700 text-white"
        />
      </div>

      {/* Action Button */}
      <button
        onClick={executeTrade}
        className="w-full bg-green-500 text-white py-2 rounded-md font-bold"
      >
        Place Trade
      </button>

      {/* Bridge Modal */}
      <BridgeModal
        isOpen={isBridgeModalOpen}
        onClose={() => setIsBridgeModalOpen(false)}
        chainId={network}
        tokenAddress={tokenAddress}
      />
    </div>
  );
};

export default TradePanel;
