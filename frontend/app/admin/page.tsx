"use client";

import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "../context/WalletProvider";
import { NETWORKS } from "../constants";
import PumpOutTokenFactoryABI from "../../../contracts/out/PumpOutTokenFactory.sol/PumpOutTokenFactory.json";

const AdminPanel: React.FC = () => {
  const { account, provider } = useWallet();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [currentNetwork, setCurrentNetwork] =
    useState<string>("Unknown Network");
  const [contractBalance, setContractBalance] = useState("0");
  const [isOwner, setIsOwner] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [networkDetails, setNetworkDetails] = useState<any | null>(null);
  const [contractLink, setContractLink] = useState<string>("#");
  const [parameters, setParameters] = useState({
    availableSupply: "0",
    lpSupply: "0",
    kValue: "0",
    protocolFeePercentage: "0",
    protocolFeeCollector: "",
    operatorMinter: "",
    operatorOwner: "",
    minFee: "0",
  });

  // Function to get network name and contract address
  const fetchNetworkDetails = async () => {
    if (!provider) return;

    try {
      const network = await provider.getNetwork();
      const networkData = NETWORKS.find(
        (n) => n.chainId === Number(network.chainId)
      );

      if (networkData) {
        setContractAddress(networkData.factoryContractAddress);
        setCurrentNetwork(networkData.name);
        setNetworkDetails(networkData);
      } else {
        setContractAddress(null);
        setCurrentNetwork("Unsupported Network");
        setNetworkDetails(null);
      }
    } catch (err) {
      setNetworkDetails(null);
      console.error("Error fetching network details:", err);
      setError("Failed to load network details.");
    }
  };

  // Initialize contract instance
  useEffect(() => {
    if (!provider || !contractAddress) return;

    const instance = new ethers.Contract(
      contractAddress,
      PumpOutTokenFactoryABI.abi,
      provider
    );
    setContract(instance);
  }, [provider, contractAddress]);

  // Fetch contract and network data
  useEffect(() => {
    fetchNetworkDetails();

    if (!contract || !account) return;

    const fetchData = async () => {
      try {
        // Check if the user is the owner
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const owner = await contract.owner();
        setIsOwner(owner.toLowerCase() === account.toLowerCase());

        // Fetch contract balance
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const balance = await provider.getBalance(contractAddress!);
        setContractBalance(ethers.formatEther(balance));

        // Fetch contract parameters
        const availableSupply = await contract.availableSupply();
        const lpSupply = await contract.lpSupply();
        const kValue = await contract.kValue();
        const protocolFeePercentage = await contract.protocolFeePercentage();
        const protocolFeeCollector = await contract.protocolFeeCollector();
        const operatorMinter = await contract.operatorMinter();
        const operatorOwner = await contract.operatorOwner();
        const minFee = await contract.minFee();

        setParameters({
          availableSupply: availableSupply.toString(),
          lpSupply: lpSupply.toString(),
          kValue: kValue.toString(),
          protocolFeePercentage: protocolFeePercentage.toString(),
          protocolFeeCollector,
          operatorMinter,
          operatorOwner,
          minFee: ethers.formatEther(minFee),
        });
      } catch (err) {
        console.error("Error fetching contract data:", err);
        setError("Failed to load contract data.");
      }
    };

    fetchData();
  }, [contract, account, provider, contractAddress]);

  // Update contract link when network details change
  useEffect(() => {
    if (networkDetails) {
      setContractLink(
        `${networkDetails.explorerUrl}/address/${networkDetails.factoryContractAddress}`
      );
    } else {
      setContractLink("#");
    }
  }, [networkDetails]);

  // Withdraw earnings function
  const withdrawEarnings = async () => {
    if (!contract || !provider) return;

    try {
      // Get the signer from the provider
      const signer = await provider.getSigner();

      // Connect the contract with the signer
      const contractWithSigner = contract.connect(signer);

      // Call withdrawEarnings with the signer
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const tx = await contractWithSigner.withdrawEarnings();
      await tx.wait();

      alert("Earnings withdrawn successfully!");
      window.location.reload();
    } catch (err) {
      console.error("Error withdrawing earnings:", err);
      setError("Failed to withdraw earnings.");
    }
  };

  // Function to update contract parameters
  const updateContractParameter = async (
    parameter: string,
    value: string | number
  ) => {
    if (!contract || !provider) return;

    try {
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);

      // Check which parameter to update and call the appropriate function
      let tx;
      switch (parameter) {
        case "availableSupply":
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          tx = await contractWithSigner.setAvailableSupply(value);
          break;
        case "lpSupply":
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          tx = await contractWithSigner.setLpSupply(value);
          break;
        case "kValue":
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          tx = await contractWithSigner.setKValue(value);
          break;
        case "protocolFeePercentage":
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          tx = await contractWithSigner.setProtocolFeePercentage(value);
          break;
        case "protocolFeeCollector":
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          tx = await contractWithSigner.setProtocolFeeCollector(value);
          break;
        default:
          throw new Error("Invalid parameter specified");
      }

      // Wait for the transaction to be confirmed
      await tx.wait();
      alert(`${parameter} updated successfully!`);
      window.location.reload();
    } catch (err) {
      console.error(`Error updating ${parameter}:`, err);
      setError(`Failed to update ${parameter}.`);
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg text-white border border-gray-700 font-sans">
      <h1 className="text-4xl font-bold mb-4">Admin Panel</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="mb-6">
        <h2 className="text-xl font-semibold">Network Details</h2>
        <p className="text-lg">Current Network: {currentNetwork}</p>
        {contractAddress ? (
          <p className="text-xl">Contract Address: {contractAddress}</p>
        ) : (
          <p className="text-lg text-red-500">
            No contract available for this network
          </p>
        )}
        {/* Contract Link */}
        {networkDetails ? (
          <p className="mt-2">
            <a
              href={contractLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              View Contract on {networkDetails.name} Explorer
            </a>
          </p>
        ) : (
          <p className="mt-2 text-red-500">
            Unsupported network or unable to fetch network details
          </p>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold">Contract Balance</h2>
        <p className="text-lg">Balance: {contractBalance} ETH</p>
        {isOwner && (
          <button
            onClick={withdrawEarnings}
            className="mt-2 bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600"
          >
            Withdraw Earnings
          </button>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold">Contract Parameters</h2>
        {Object.entries(parameters).map(([key, value]) => (
          <div className="mb-2" key={key}>
            <label className="text-lg font-medium">{key}:</label>
            <input
              type="text"
              value={value}
              onChange={(e) =>
                setParameters((prev) => ({ ...prev, [key]: e.target.value }))
              }
              className="ml-2 p-1 text-black rounded"
              disabled={!isOwner}
            />
            {isOwner && (
              <button
                onClick={() => updateContractParameter(key, value)}
                className="ml-2 bg-green-500 text-white py-1 px-2 rounded-md hover:bg-green-600"
              >
                Update
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;
