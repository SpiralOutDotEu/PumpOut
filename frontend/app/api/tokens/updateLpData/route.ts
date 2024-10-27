import { NextRequest, NextResponse } from "next/server";
import { database } from "../../../lib/db";

export async function PATCH(req: NextRequest) {
    try {
        const { network, tokenAddress, lpData } = await req.json();

        if (!network || !tokenAddress || !lpData) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        await database.updateLpData(network, tokenAddress, lpData);

        return NextResponse.json(
            { message: "lpData updated successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating lpData:", error);
        return NextResponse.json(
            { error: "Failed to update lpData" },
            { status: 500 }
        );
    }
}
