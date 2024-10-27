
import { notifyFrontend } from '../services/notificationService';
import "dotenv/config";

// Example usage "npm run notify-frontend <projectFilePath> <network> <tokenAddress>""
const projectFilePath = process.argv[2];
const network = process.argv[3];
const tokenAddress = process.argv[4];

if (!projectFilePath || !network || !tokenAddress) {
    console.error("Usage: ts-node notifyFrontend.ts <projectFilePath> <network> <tokenAddress>");
    process.exit(1);
}

notifyFrontend({ projectFilePath, network, tokenAddress })
    .then(() => console.log("Notification sent successfully."))
    .catch(error => console.error("Failed to send notification:", error));
