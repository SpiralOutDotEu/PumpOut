import { notifyFrontend } from '../services/notificationService';
import { NotifyParams } from '../services/notificationService';

// The task function remains largely the same but calls the service
export default async function notifyFrontendTask(params: NotifyParams): Promise<void> {
    try {
        await notifyFrontend(params);
    } catch (error) {
        console.error("Error notifying frontend:", error);
        throw new Error(`Failed to notify frontend: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
