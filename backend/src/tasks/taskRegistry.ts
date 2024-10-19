import checkEventsTask from "./checkEventsTask";
import createProjectTask from "./createProjectTask";
import generateSolanaKeyTask from "./generateSolanaKeyTask";
import processEventTask from "./processEventTask";

interface TaskFunction {
  (params: any): Promise<any>;
}

const taskRegistry: { [key: string]: TaskFunction } = {
  "check-events": checkEventsTask,
  "create-project": createProjectTask,
  "generate-solana-key": generateSolanaKeyTask,
  "process-events": processEventTask
  // Add other tasks here
};

export default taskRegistry;
