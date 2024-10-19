import fs from 'fs';
import { parse as jsonToCsv } from 'json2csv';
import Bull from 'bull';
import "dotenv/config";

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Define your queues
const checkEventsQueue = new Bull('check-events', { redis: redisUrl });
const processEventsQueue = new Bull('process-events', { redis: redisUrl });

// TODO: Add more queues
const allQueues = [checkEventsQueue, processEventsQueue];

// Define the structure of the jobs data
interface JobData {
    id: string | number;
    data: any;
    result: any;
    failedReason: string | null;
    status: string;
    finishedOn: number | null;
    processedOn: number | null;
    timestamp: number;
}

// Export function to handle multiple queues and both JSON and CSV formats
async function exportProcessedJobs(format: 'json' | 'csv' = 'json'): Promise<string> {
    try {
        // Define the structure of allJobsData
        const allJobsData: {
            timestamp: Date;
            queues: { [key: string]: { completed: JobData[]; failed: JobData[] } };
        } = {
            timestamp: new Date(),
            queues: {},
        };

        // Generate a timestamp for the export file name
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        // Loop through each queue and collect jobs
        for (const queue of allQueues) {
            const queueName = queue.name;

            // Get completed and failed jobs
            const completedJobs = await queue.getCompleted();
            const failedJobs = await queue.getFailed();

            // Format jobs for the current queue
            allJobsData.queues[queueName] = {
                completed: completedJobs.map(job => formatJob(job)),
                failed: failedJobs.map(job => formatJob(job)),
            };
        }

        // Determine file format (json or csv)
        if (format === 'csv') {
            // Flatten jobs data for CSV export (you might want to customize this for CSV)
            const flatData: JobData[] = Object.values(allJobsData.queues)
                .flatMap((queueJobs) => [...queueJobs.completed, ...queueJobs.failed]);

            const csv = jsonToCsv(flatData, {
                fields: ['id', 'data', 'result', 'failedReason', 'status', 'finishedOn', 'processedOn', 'timestamp'],
            });
            const csvFilePath = `./bull_jobs_log_${timestamp}.csv`;
            fs.writeFileSync(csvFilePath, csv);
            return csvFilePath;  // Return the CSV file path
        } else {
            // JSON format
            const jsonFilePath = `./bull_jobs_log_${timestamp}.json`;
            fs.writeFileSync(jsonFilePath, JSON.stringify(allJobsData, null, 2));
            return jsonFilePath;  // Return the JSON file path
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown export error"
        throw new Error(`Error exporting processed jobs: ${errorMessage}`);
    }
}

// Utility function to format each job's data
function formatJob(job: Bull.Job): JobData {
    return {
        id: job.id,
        data: job.data,
        result: job.returnvalue,
        failedReason: job.failedReason as string,
        status: job.finishedOn ? 'completed' : 'failed',
        finishedOn: job.finishedOn as number,
        processedOn: job.processedOn as number,
        timestamp: job.timestamp,
    };
}

export default exportProcessedJobs;
