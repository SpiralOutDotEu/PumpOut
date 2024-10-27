import { NextRequest, NextResponse } from "next/server";
import { database } from "../../../lib/db";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const network = searchParams.get("network");
    const tokenAddress = searchParams.get("tokenAddress");

    if (!network || !tokenAddress) {
        return NextResponse.json(
            { error: "Both network and token address are required" },
            { status: 400 }
        );
    }

    try {
        const token = await database.getTokenByAddress(network, tokenAddress);

        if (!token) {
            return NextResponse.json(
                { error: "Token not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(token, { status: 200 });
    } catch (error) {
        console.error("Error fetching token:", error);
        return NextResponse.json(
            { error: "Failed to fetch token" },
            { status: 500 }
        );
    }
}
