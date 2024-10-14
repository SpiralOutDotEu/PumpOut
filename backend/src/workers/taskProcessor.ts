// src/workers/taskProcessor.ts

import { getTaskQueue } from "../queues/taskQueue";
import taskRegistry from "../tasks/taskRegistry";
import database from "../database";

interface TaskData {
  params: any;
  callId: number;
}

// Function to process a specific task queue
function processQueue(taskName: string) {
  const taskQueue = getTaskQueue(taskName);

  taskQueue.process(async (job) => {
    const { params, callId } = job.data as TaskData;

    if (!taskRegistry[taskName]) {
      throw new Error(`Unknown task name: ${taskName}`);
    }

    try {
      // Update status to 'in-progress'
      await database.updateCall(callId, "in-progress", null);

      // Execute the task
      const result = await taskRegistry[taskName](params);

      // Update status to 'completed' with result
      await database.updateCall(callId, "completed", result);

      return result;
    } catch (error) {
      // Update status to 'failed' with error
      const errorMessage =
        error instanceof Error
          ? error.message
          : "unknown error on taskQueue.process";
      await database.updateCall(callId, "failed", { error: errorMessage });
      throw error;
    }
  });
}

// Export function to process queues
export function processAllQueues() {
  Object.keys(taskRegistry).forEach((taskName) => {
    processQueue(taskName);
  });
}
