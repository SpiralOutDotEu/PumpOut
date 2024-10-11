// app/api/latest/route.ts
import { NextResponse } from "next/server";
import { Token } from "../../types/token";

const tokens: Token[] = [
  { id: 1, name: "Token A" },
  { id: 2, name: "Token B" },
  // ...additional tokens
];

// const tokens: Token[] = [
//     { id: 1, name: "Token A", color: "#FFCCAA" },
//     { id: 2, name: "Token B", color: "#AACCFF" },
//     // ...additional tokens
//   ];

export async function GET() {
  return NextResponse.json(tokens);
}
