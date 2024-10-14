import Bull from "bull";

const redisConfig = process.env.REDIS_URL || "redis://127.0.0.1:6379";

interface TaskQueue {
  [key: string]: Bull.Queue;
}

const taskQueues: TaskQueue = {};

// Function to get or create a queue for a specific task
export function getTaskQueue(taskName: string): Bull.Queue {
  if (!taskQueues[taskName]) {
    taskQueues[taskName] = new Bull(taskName, redisConfig);
  }
  return taskQueues[taskName];
}

export default taskQueues;
