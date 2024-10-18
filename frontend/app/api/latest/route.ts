import { NextResponse } from "next/server";

// Function to generate random meme token symbols
function getRandomTokenSymbol() {
  const memeTokens = ['WOOF', 'MOON', 'HYPE', 'DOGE', 'APES', 'PEPE', 'LUNA', 'HODL', 'DEGEN', 'PUMP'];
  return memeTokens[Math.floor(Math.random() * memeTokens.length)];
}

// Function to generate random ETH amounts
function getRandomEthAmount() {
  return (Math.random() * (1 - 0.1) + 0.1).toFixed(2); // Generates a random ETH amount between 0.1 and 1
}

// Convert messages with sales and buys
const messages = [
  `${getRandomEthAmount()} $ETH of $${getRandomTokenSymbol()} sold`,
  `${getRandomEthAmount()} $ETH of $${getRandomTokenSymbol()} bought`,
  `${getRandomEthAmount()} $ETH of $${getRandomTokenSymbol()} sold`,
  `$${getRandomTokenSymbol()} hit target`,
  `$${getRandomTokenSymbol()} pool made`,
  `$${getRandomTokenSymbol()} LP burned`,
  `${getRandomEthAmount()} $ETH of $${getRandomTokenSymbol()} bought`,
  `$${getRandomTokenSymbol()} hit halfway`,
  `${getRandomEthAmount()} $ETH of $${getRandomTokenSymbol()} sold`,
  `${getRandomEthAmount()} $ETH of $${getRandomTokenSymbol()} bought`,
  `${getRandomEthAmount()} $ETH of $${getRandomTokenSymbol()} sold`,
  `${getRandomEthAmount()} $ETH of $${getRandomTokenSymbol()} sold`,
  `$${getRandomTokenSymbol()} whale bought`,
  `${getRandomEthAmount()} $ETH of $${getRandomTokenSymbol()} sold`,
  `${getRandomEthAmount()} $ETH of $${getRandomTokenSymbol()} bought`,
  `$${getRandomTokenSymbol()} created`,
  `${getRandomEthAmount()} $ETH of $${getRandomTokenSymbol()} bought`,
  `${getRandomEthAmount()} $ETH of $${getRandomTokenSymbol()} bought`,
  `$${getRandomTokenSymbol()} hit target!!`,
  `${getRandomEthAmount()} $ETH of $${getRandomTokenSymbol()} sold`,
];

export async function GET() {
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  return NextResponse.json({ id: Date.now(), name: randomMessage });
}
