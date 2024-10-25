// WalletProvider.tsx

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";

interface WalletContextProps {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  network: ethers.Network | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isMetaMaskError: boolean;
  setMetaMaskError: React.Dispatch<React.SetStateAction<boolean>>;
}

const WalletContext = createContext<WalletContextProps | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [network, setNetwork] = useState<ethers.Network | null>(null);
  const [isMetaMaskError, setMetaMaskError] = useState(false);

  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await web3Provider.getSigner();
        const address = await signer.getAddress();

        setProvider(web3Provider);
        setAccount(address);
        const networkData = await web3Provider.getNetwork();
        setNetwork(networkData);

        // Watch for account and network changes
        window.ethereum.on("accountsChanged", (accounts: string[]) => {
          setAccount(accounts[0] || null);
        });

        window.ethereum.on("chainChanged", async () => {
          const updatedNetwork = await web3Provider.getNetwork();
          setNetwork(updatedNetwork);
        });
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    } else {
      setMetaMaskError(true);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setNetwork(null);
  };

  useEffect(() => {
    if (window.ethereum && account) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        setAccount(accounts[0] || null);
      });

      window.ethereum.on("chainChanged", async () => {
        const networkData = await provider?.getNetwork();
        setNetwork(networkData || null);
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", () => {});
        window.ethereum.removeListener("chainChanged", () => {});
      }
    };
  }, [account, provider]);

  return (
    <WalletContext.Provider
      value={{
        account,
        provider,
        network,
        connectWallet,
        disconnectWallet,
        isMetaMaskError,
        setMetaMaskError,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
