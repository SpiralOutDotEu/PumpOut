import Web3, { EventLog } from 'web3';
import path from 'path';
import fs from 'fs';
import database from '../database';
import taskManager from './taskManager';

// Path to the ABI file in the artifacts folder
const ABI_PATH = path.resolve(__dirname, '../artifacts/PumpOutTokenFactory.json');

// Load the ABI
const contractAbi = JSON.parse(fs.readFileSync(ABI_PATH, 'utf8'));

async function checkEventsTask(): Promise<any> {
  const networks = process.env.NETWORKS?.split(',') || [];
  const results: any[] = [];

  for (const network of networks) {
    const rpcUrl = process.env[`${network.toUpperCase()}_RPC_URL`];
    const contractAddress = process.env[`${network.toUpperCase()}_CONTRACT_ADDRESS`];

    if (!rpcUrl || !contractAddress) {
      console.warn(`Missing RPC URL or contract address for network: ${network}`);
      continue;
    }

    const web3 = new Web3(rpcUrl);
    const contract = new web3.eth.Contract(contractAbi.abi, contractAddress);

    // Get the last block processed for this network
    const lastBlock = await database.getLastBlock(network);
    const fromBlock = lastBlock ? lastBlock + 1 : 'earliest'; // Fetch from the next block or from the start

    // First update the last block processed for this network, so that we are sure that we are not gonna miss a block
    const latestBlock = await web3.eth.getBlockNumber();
    await database.updateLastBlock(network, Number(latestBlock));

    // Fetch `PumpOutTokenCreated` events
    const events = (await contract.getPastEvents('PumpOutTokenCreated', {
      fromBlock,
      toBlock: 'latest',
    })) as EventLog[]; // Cast the returned events to EventLog[]

    console.log("Events: ", events);

    for (const event of events) {
      const eventHash = event.transactionHash;

      // Catch undefined error
      if (eventHash == undefined) return

      // Check if the event has already been processed
      const isProcessed = await database.isEventProcessed(eventHash);

      if (!isProcessed) {
        // Mark the event as processed in the database
        await database.markEventAsProcessed(eventHash);

        // Prepare to process the event
        const eventData = {
          network,
          contractAddress,
          tokenAddress: event.returnValues.tokenAddress,
          name: event.returnValues.name,
          symbol: event.returnValues.symbol,
          minter: event.returnValues.minter,
          chainIds: event.returnValues.chainIds,
        };

        results.push(eventData);

        try {
          const callId = await taskManager.startTask({
            taskName: "process-events",
            params: eventData,
          });

          console.log(`Task started successfully with call ID: ${callId}`);
        } catch (error) {
          console.error("Error starting event processing task:", error);
        }

        // Insert the event into the events table
        await database.insertEvent({
          eventHash,
          network,
          contractAddress,
          tokenAddress: event.returnValues.tokenAddress as string,
          name: event.returnValues.name as string,
          symbol: event.returnValues.symbol as string,
          minter: event.returnValues.minter as string,
          chainIds: event.returnValues.chainIds as string,
        });

      }
    }

  }

  return results;
}

export default checkEventsTask;
