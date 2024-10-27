import "dotenv/config";
import express from "express";
import taskRoutes from "./routes/tasks";
import { setupBullBoard } from "./routes/bullBoard";
import "./polyfills"

const app = express();
const PORT = process.env.PORT || 3000;

// Setup Bull-Board
setupBullBoard(app);

app.use(express.json());
app.use("/tasks", taskRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
