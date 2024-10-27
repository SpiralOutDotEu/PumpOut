import { NextRequest, NextResponse } from "next/server";
import { database } from "../../../lib/db";
import { verifyApiKey } from "../../../utils/verifyApiKey";

export async function PATCH(req: NextRequest) {
    const apiKey = req.headers.get("x-api-key");

    if (!apiKey || !verifyApiKey(apiKey)) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const { network, tokenAddress, nttDeployment } = await req.json();

        if (!network || !tokenAddress || !nttDeployment) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        await database.updateNttDeployment(network, tokenAddress, nttDeployment);

        return NextResponse.json(
            { message: "nttDeployment updated successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating nttDeployment:", error);
        return NextResponse.json(
            { error: "Failed to update nttDeployment" },
            { status: 500 }
        );
    }
}
