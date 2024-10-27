// src/services/notificationService.ts

import axios from 'axios';
import "dotenv/config";
import fs from 'fs/promises';

export interface NotifyParams {
    projectFilePath: string;
    network: string;
    tokenAddress: string;
}

export async function notifyFrontend(params: NotifyParams): Promise<void> {
    const { projectFilePath, network, tokenAddress } = params;
    const frontendApiUrl = process.env.FRONTEND_API_URL;
    const frontendApiKey = process.env.FRONTEND_API_KEY;

    if (!frontendApiUrl || !frontendApiKey) {
        throw new Error("Missing FRONTEND_API_URL or FRONTEND_API_KEY in environment variables");
    }

    try {
        console.log(`Reading JSON data from file at: ${projectFilePath}`);
        const fileContents = await fs.readFile(projectFilePath, 'utf-8');
        const projectData = JSON.parse(fileContents);

        console.log(`Notifying frontend about completed event processing for project.`);

        await axios.post(
            frontendApiUrl,
            { projectData, network, tokenAddress },
            { headers: { 'x-api-key': `${frontendApiKey}` } }
        );

        console.log("Frontend notified successfully.");
    } catch (error) {
        console.error("Error notifying frontend:", error);
        throw new Error(`Failed to notify frontend: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
