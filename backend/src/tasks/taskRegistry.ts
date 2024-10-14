import checkEventsTask from "./checkEventsTask";
import createProjectTask from "./createProjectTask";
import generateSolanaKeyTask from "./generateSolanaKeyTask";

interface TaskFunction {
  (params: any): Promise<any>;
}

const taskRegistry: { [key: string]: TaskFunction } = {
  "check-events": checkEventsTask,
  "create-project": createProjectTask,
  "generate-solana-key": generateSolanaKeyTask,
  // Add other tasks here
};

export default taskRegistry;
