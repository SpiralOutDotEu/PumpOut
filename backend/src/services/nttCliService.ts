import { spawn } from 'child_process';
import path from 'path';
import "dotenv/config";


const BASE_PATH = process.env.BASE_PATH || './projects';
const NETWORK_ENV = process.env.NETWORK_ENV || 'Testnet';  // 'Mainnet' or 'Testnet'

/**
 * Run a shell command and return the stdout or throw an error if it fails.
 */
async function spawnPromise(command: string, args: string[], options: { cwd?: string }): Promise<string> {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { ...options, shell: true });

    let stderrData = '';
    let stdoutData = '';  // To capture stdout data

    process.stdout.on('data', (data) => {
      stdoutData += data.toString();  // Accumulate stdout data
    });

    process.stderr.on('data', (data) => {
      stderrData += data.toString();  // Accumulate stderr data
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve(stdoutData.trim());  // Resolve with the stdout data
      } else {
        reject(new Error(`Command failed with exit code ${code}: ${stderrData.trim()}`));
      }
    });

    process.on('error', (err) => {
      reject(new Error(`Failed to start subprocess: ${err.message}`));
    });
  });
}

/**
 * Create a project with NTT CLI based on the networkId and tokenAddress.
 * The project will be initialized based on the environment (Mainnet or Testnet).
 */
export async function createProject(networkId: string, tokenAddress: string): Promise<string> {
  const projectName = `${networkId}-${tokenAddress}`;
  const projectPath = path.join(BASE_PATH, projectName);

  // Step 1: Run 'ntt new <networkId-tokenAddress>' in the base path
  try {
    console.log(`Creating project: ${projectName}`);
    await spawnPromise('ntt', ['new', projectName], { cwd: BASE_PATH });

    // Step 2: Change directory into the project and run 'ntt init <Mainnet|Testnet>'
    const initEnv = NETWORK_ENV === 'Mainnet' ? 'Mainnet' : 'Testnet';
    console.log(`Initializing project as ${initEnv} in ${projectPath}`);
    await spawnPromise('ntt', ['init', initEnv], { cwd: projectPath });

    console.log(`Project successfully created and initialized at ${projectPath}`);
    return projectPath;  // Return the full project path

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : `Failed to create project for ${networkId}-${tokenAddress}:`
    console.error(errorMessage, error);
    throw new Error(`Failed to create project: ${errorMessage}`);
  }
}

export default {
  createProject,
};
