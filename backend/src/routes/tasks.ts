import { Router } from "express";
import taskController from "../controllers/taskController";
import ExportBullController from '../controllers/exportBullController';

const router = Router();

router.post("/start/:taskName", taskController.startTask);
router.get("/:id/status", taskController.getTaskStatus);
router.get('/export-jobs-log', ExportBullController.exportJobsLog)

export default router;
