import { NextRequest, NextResponse } from "next/server";
import { database } from "../../../lib/db";

export async function POST(req: NextRequest) {
    try {
        const { network, tokenAddress, name, symbol, logo } = await req.json();

        if (!network || !tokenAddress || !name || !symbol) {
            return NextResponse.json(
                { error: "Missing required token information" },
                { status: 400 }
            );
        }

        await database.addToken({ network, tokenAddress, name, symbol, logo });

        return NextResponse.json(
            { message: "Token created successfully" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating token:", error);
        return NextResponse.json(
            { error: "Failed to create token" },
            { status: 500 }
        );
    }
}
