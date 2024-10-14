import Web3 from "web3";

interface CheckEventsParams {
  contractAbi: any;
}

async function checkEventsTask(params: CheckEventsParams): Promise<any> {
  const networks = process.env.NETWORKS?.split(",") || [];
  const results = [];

  for (const network of networks) {
    const rpcUrl = process.env[`${network.toUpperCase()}_RPC_URL`];
    const contractAddress =
      process.env[`${network.toUpperCase()}_CONTRACT_ADDRESS`];

    if (!rpcUrl || !contractAddress) {
      console.warn(
        `Missing RPC URL or contract address for network: ${network}`
      );
      continue;
    }

    const web3 = new Web3(rpcUrl);
    const contract = new web3.eth.Contract(params.contractAbi, contractAddress);

    // Fetch events (simplified example)
    const events = await contract.getPastEvents("allEvents", {
      fromBlock: "latest",
    });

    // Process events
    for (const event of events) {
      // Implement your logic here
      results.push(event);
    }
  }

  return results;
}

export default checkEventsTask;
