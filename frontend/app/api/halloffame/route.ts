import { NextResponse } from "next/server";

const messages = [
  "Token A hit target",
  "Token B hit target",
  "Token C hit target",
  "Token D hit target",
  "Token E hit target",
];

export async function GET() {
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  return NextResponse.json({ id: Date.now(), name: randomMessage });
}
