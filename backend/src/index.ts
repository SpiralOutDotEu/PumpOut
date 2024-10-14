import "dotenv/config";
import express from "express";
import taskRoutes from "./routes/tasks";
import { setupBullBoard } from "./routes/bullBoard";
import "./workers/taskProcessor";
import { processAllQueues } from "./workers/taskProcessor";

const app = express();
const PORT = process.env.PORT || 3000;

// Setup Bull-Board
setupBullBoard(app);

// Process all task queues
processAllQueues();

app.use(express.json());
app.use("/tasks", taskRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
