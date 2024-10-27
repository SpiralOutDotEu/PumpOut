interface NttData {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    projectData: any;
    network: string;
    tokenAddress: string;
}

export async function addNewNttFileService(data: NttData): Promise<void> {
    const { projectData, network, tokenAddress } = data;

    // For now, just log the received projectData and additional info
    console.log('New NTT data received:');
    console.log('Project Data:', JSON.stringify(projectData, null, 2));
    console.log(`Network: ${network}`);
    console.log(`Token Address: ${tokenAddress}`);

    // TODO: Future implementation to update a config file or database with the new NTT data
}
