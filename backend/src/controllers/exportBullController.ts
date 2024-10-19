import { Request, Response } from 'express';
import exportProcessedJobs from '../services/exportBullProcessedJobs';

class ExportBullController {
    // Endpoint to export Bull job logs in JSON or CSV format
    async exportJobsLog(req: Request, res: Response): Promise<void> {
        try {
            // Get the export format from query params (default to 'json')
            const format: 'json' | 'csv' = req.query.format === 'csv' ? 'csv' : 'json';

            // Call the export function to generate the log in the desired format
            const logFilePath = await exportProcessedJobs(format);

            // Respond with a success message and log file path
            res.json({ message: `Jobs log exported successfully as ${format}`, logFilePath });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown Error on exporting jobs"
            console.error('Error exporting jobs log:', error);
            res.status(500).json({ error: errorMessage });
        }
    }
}

export default new ExportBullController();
