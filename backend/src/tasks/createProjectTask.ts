import { spawn } from "child_process";

interface CreateProjectParams {
  basePath: string;
  projectId: string;
}

async function spawnPromise(command: string, args: string[], options: { cwd: string }): Promise<void> {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { ...options, shell: true }); // Enable shell option

    let stderrData = '';  // To capture stderr

    process.stderr.on("data", (data) => {
      stderrData += data.toString();  // Accumulate stderr data
    });

    process.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Process exited with code ${code}: ${stderrData.trim()}`));
      }
    });

    process.on("error", (err) => {
      reject(new Error(`Failed to start subprocess: ${err.message}`));
    });
  });
}

async function createProjectTask(params: CreateProjectParams): Promise<any> {
  const { basePath, projectId } = params;
  const cwd = basePath;

  // Create directory
  await spawnPromise("mkdir", ["-p", projectId], { cwd });

  // Run `ntt new <PROJECT_ID>`
  await spawnPromise("ntt", ["new", projectId], { cwd });

  return `Project ${projectId} created successfully!`;
}

export default createProjectTask;
