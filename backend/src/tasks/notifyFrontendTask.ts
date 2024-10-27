// Filename: src/tasks/notifyFrontendTask.ts

import axios from 'axios';
import "dotenv/config";

interface NotifyParams {
    projectFilePath: string;
    network: string;
    tokenAddress: string;
}

export default async function notifyFrontendTask(params: NotifyParams): Promise<void> {
    const { projectFilePath, network, tokenAddress } = params;
    const frontendApiUrl = process.env.FRONTEND_API_URL;
    const frontendApiKey = process.env.FRONTEND_API_KEY;

    if (!frontendApiUrl || !frontendApiKey) {
        throw new Error("Missing FRONTEND_API_URL or FRONTEND_API_KEY in environment variables");
    }

    try {
        console.log(`Notifying frontend about completed event processing for project at: ${projectFilePath}`);

        await axios.post(
            frontendApiUrl,
            {
                projectFilePath,
                network,
                tokenAddress,
            },
            {
                headers: {
                    'Authorization': `Bearer ${frontendApiKey}`
                }
            }
        );

        console.log("Frontend notified successfully.");
    } catch (error) {
        console.error("Error notifying frontend:", error);
        throw new Error(`Failed to notify frontend: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
