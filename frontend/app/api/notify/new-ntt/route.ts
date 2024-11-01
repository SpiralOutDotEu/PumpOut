import { NextRequest, NextResponse } from 'next/server';
import { addNewNttFileService } from '../../../services/addNewNttFileService';
import { database } from '@/app/lib/db';
import { WormholeConnectConfig } from '@/app/types/nttData';
import { verifyApiKey } from '@/app/utils/verifyApiKey';

export async function POST(req: NextRequest) {
    // Validate the API key from the environment
    const apiKey = req.headers.get("x-api-key");

    if (!apiKey || !verifyApiKey(apiKey)) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        // Extract the JSON data from the request body
        const { projectData, network, tokenAddress } = await req.json();

        // Validate required fields
        if (!projectData || !network || !tokenAddress) {
            return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
        }

        console.log("projectData", projectData)

        // Pass data to the service
        const wormholeConnectConfig: WormholeConnectConfig = await addNewNttFileService({ projectData, network, tokenAddress }) as unknown as WormholeConnectConfig;;
        console.log("wormholeConnectConfig: ", wormholeConnectConfig);

        // add ntt data to database
        await database.updateNttDeployment(network, tokenAddress, projectData);
        // add wormholeConnectConfig to database
        await database.updateWormholeConnectConfig(network, tokenAddress, wormholeConnectConfig);

        return NextResponse.json({ message: 'Data received and processed successfully' });
    } catch (error) {
        console.error('Error processing notification:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
