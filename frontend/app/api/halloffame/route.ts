import { NextResponse } from "next/server";

const messages = [
  "Token $PUMP hit target",
  "Token $OUT hit target",
  "Token $DEGE hit target",
  "Token $PEPS hit target",
  "Token $TOPE hit target",
];

export async function GET() {
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  return NextResponse.json({ id: Date.now(), name: randomMessage });
}
