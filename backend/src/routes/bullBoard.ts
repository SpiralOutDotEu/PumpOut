import { Express } from "express";
import { createBullBoard } from "@bull-board/api";
import { BullAdapter } from "@bull-board/api/bullAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { getTaskQueue } from "../queues/taskQueue";

export function setupBullBoard(app: Express): void {
  // Initialize Bull-Board with the task queue adapter
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath("/admin/queues");

  createBullBoard({
    queues: [
      new BullAdapter(getTaskQueue("check-events")),
      new BullAdapter(getTaskQueue("create-project")),
      new BullAdapter(getTaskQueue("generate-solana-key")),
      // Add other queues here
    ],
    serverAdapter,
  });

  // Add the Bull-Board route to the app
  app.use("/admin/queues", serverAdapter.getRouter());

  console.log("Bull-Board available at /admin/queues");
}
