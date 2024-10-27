import "dotenv/config";
import { processAllQueues } from "./taskProcessor";

// Initialize and process all task queues
(async () => {
  console.log("Worker process starting...");
  await processAllQueues();
  console.log("All task queues are being processed by the worker.");
})();
