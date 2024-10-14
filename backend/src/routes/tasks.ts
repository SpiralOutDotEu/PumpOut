import { Router } from "express";
import taskController from "../controllers/taskController";

const router = Router();

router.post("/start/:taskName", taskController.startTask);
router.get("/:id/status", taskController.getTaskStatus);

export default router;
