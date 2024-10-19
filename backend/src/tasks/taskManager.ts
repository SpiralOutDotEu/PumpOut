import { getTaskQueue } from "../queues/taskQueue";
import database from "../database";
import taskRegistry from "../tasks/taskRegistry";

interface TaskParams {
    taskName: string;
    params: any;
}

class TaskManager {
    async startTask(taskParams: TaskParams): Promise<number> {
        const { taskName, params } = taskParams;

        if (!taskRegistry[taskName]) {
            throw new Error("Unknown task name");
        }

        try {
            // Insert a new call into the database
            const callId = await database.insertCall(taskName, params, "queued");

            // Get the queue for the task name and add a job to it
            const taskQueue = getTaskQueue(taskName);
            await taskQueue.add({ params, callId }, {
                timeout: 0,  // No timeout, let the task run as long as needed
                attempts: 2,  // Retry up to 2 times if the job fails
                removeOnComplete: false,  // Do not automatically remove completed jobs
                removeOnFail: false,  // Keep failed jobs for debugging
            });

            return callId;
        } catch (error) {
            console.error("Error starting task:", error);
            throw new Error("Failed to start task");
        }
    }

    async getTaskStatus(callId: number): Promise<any> {
        try {
            const call = await database.getCallById(callId);

            if (call) {
                return {
                    id: call.id,
                    taskName: call.task_type,
                    params: JSON.parse(call.params),
                    status: call.status,
                    result: call.result ? JSON.parse(call.result) : null,
                    createdAt: call.created_at,
                    updatedAt: call.updated_at,
                };
            } else {
                throw new Error("Task not found");
            }
        } catch (error) {
            console.error("Error fetching task status:", error);
            throw new Error("Failed to fetch task status");
        }
    }
}

export default new TaskManager();
