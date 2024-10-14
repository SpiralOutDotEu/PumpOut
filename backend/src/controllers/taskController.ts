import { Request, Response } from "express";
import { getTaskQueue } from "../queues/taskQueue";
import database from "../database";
import taskRegistry from "../tasks/taskRegistry";

class TaskController {
  async startTask(req: Request, res: Response): Promise<void> {
    const taskName = req.params.taskName;
    const params = req.body;

    if (!taskRegistry[taskName]) {
      res.status(400).json({ error: "Unknown task name" });
      return;
    }

    try {
      // Insert a new call into the database
      const callId = await database.insertCall(taskName, params, "queued");

      // Get the queue for the task name and add a job to it
      const taskQueue = getTaskQueue(taskName);
      await taskQueue.add({ params, callId });

      res.json({ callId });
    } catch (error) {
      console.error("Error starting task:", error);
      res.status(500).json({ error: "Failed to start task" });
    }
  }

  async getTaskStatus(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);

    try {
      const call = await database.getCallById(id);

      if (call) {
        res.json({
          id: call.id,
          taskName: call.task_type,
          params: JSON.parse(call.params),
          status: call.status,
          result: call.result ? JSON.parse(call.result) : null,
          createdAt: call.created_at,
          updatedAt: call.updated_at,
        });
      } else {
        res.status(404).json({ error: "Task not found" });
      }
    } catch (error) {
      console.error("Error fetching task status:", error);
      res.status(500).json({ error: "Failed to fetch task status" });
    }
  }
}

export default new TaskController();
