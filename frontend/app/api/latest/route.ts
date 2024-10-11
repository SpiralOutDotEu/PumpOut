import { NextResponse } from "next/server";

const messages = [
  "Token A created",
  "Token B bought",
  "Token C sold",
  "Token D hit target",
  "Token D pool made",
  "Token D LP burned",
  "Token G Bought",
  "Token H halfway",
  "Token B sold",
  "Token B bought",
  "Token K sold",
  "Token L sold",
  "Token M whale bought",
  "Token N sold",
  "Token O bought",
  "Token P created",
  "Token P bought",
  "Token P bought",
  "Token A hit target",
  "Token B sold",
];

export async function GET() {
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  return NextResponse.json({ id: Date.now(), name: randomMessage });
}
