import { Request, Response } from "express";
import taskManager from "../tasks/taskManager";

class TaskController {
  async startTask(req: Request, res: Response): Promise<void> {
    const taskName = req.params.taskName;
    const params = req.body;

    try {
      // Start the task using the TaskManager
      const callId = await taskManager.startTask({ taskName, params });
      res.json({ callId });
    } catch (error) {
      console.error("Error starting task:", error);
      const errorMessage = error instanceof Error ? error.message : "Error starting task: " + taskName + " and params: " + params
      res.status(500).json({ error: errorMessage });
    }
  }

  async getTaskStatus(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id, 10);

    try {
      const status = await taskManager.getTaskStatus(id);
      res.json(status);
    } catch (error) {
      console.error("Error fetching task status:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown Error fetching task status"
      res.status(500).json({ error: errorMessage });
    }
  }
}

export default new TaskController();
