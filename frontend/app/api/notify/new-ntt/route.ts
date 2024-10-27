import { NextRequest, NextResponse } from 'next/server';
import { addNewNttFileService } from '../../../services/addNewNttFileService';

export async function POST(req: NextRequest) {
    // Validate the API key from the environment
    const apiKey = process.env.FRONTEND_API_KEY;
    const receivedApiKey = req.headers.get('authorization')?.replace('Bearer ', '');

    if (!apiKey || receivedApiKey !== apiKey) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Extract the JSON data from the request body
        const { projectData, network, tokenAddress } = await req.json();

        // Validate required fields
        if (!projectData || !network || !tokenAddress) {
            return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
        }

        // Pass data to the service
        await addNewNttFileService({ projectData, network, tokenAddress });

        return NextResponse.json({ message: 'Data received and processed successfully' });
    } catch (error) {
        console.error('Error processing notification:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
