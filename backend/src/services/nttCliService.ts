import { spawn } from 'child_process';
import path from 'path';
import "dotenv/config";

const BASE_PATH = process.env.BASE_PATH || './projects';
const NETWORK_ENV = process.env.NETWORK_ENV || 'Testnet';  // 'Mainnet' or 'Testnet'
const SOLANA_PAYER = process.env.SOLANA_PAYER as string;

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
        reject(new Error(`Command failed with exit code ${code}: ${stderrData.trim()} \n and stdout ${stdoutData.trim()}`));
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
export async function createProject(networkId: string, tokenAddress: string): Promise<{ basePath: string, projectName: string }> {
  const projectName = `${networkId}-${tokenAddress}.json`;  // Project name with .json extension
  const projectPath = path.join(BASE_PATH, projectName);

  // Step 1: Run 'ntt init <NETWORK_ENV> --path <projectName>' in the base path
  try {
    console.log(`Initializing project: ${projectName} with environment: ${NETWORK_ENV}`);
    await spawnPromise('ntt', ['init', NETWORK_ENV, '--path', projectName], { cwd: BASE_PATH });

    console.log(`Project successfully initialized at ${projectPath}`);
    return { basePath: BASE_PATH, projectName };  // Return base path and project name separately

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : `Failed to create project for ${networkId}-${tokenAddress}`;
    console.error(errorMessage, error);
    throw new Error(`Failed to create project: ${errorMessage}`);
  }
}

/**
 * Add a chain to the project using the NTT CLI command 'ntt add-chain'
 */
export async function addChain(chainIdString: string, projectFile: string, projectPath: string, tokenAddress: string): Promise<void> {
  const command = 'ntt';
  const args = ['add-chain', chainIdString, '--latest', '--mode', 'burning', '--path', projectFile, '--token', tokenAddress, '--payer', SOLANA_PAYER];

  try {
    console.log(`Running NTT add-chain for ${chainIdString}`);
    await spawnPromise(command, args, { cwd: projectPath });
    console.log(`NTT add-chain successful for ${chainIdString}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : `Error running NTT add-chain for ${chainIdString}: Unkown`
    console.error(`Error running NTT add-chain for ${chainIdString}:`, error);
    throw new Error(`Failed to add chain ${chainIdString}: ${errorMessage}`);
  }
}

/**
 * Push the project to the network using the NTT CLI command 'ntt push'
 */
export async function pushProject(projectFile: string, basePath: string): Promise<void> {
  const command = 'ntt';
  const args = ['push', '--path', projectFile, '--payer', SOLANA_PAYER, '--yes'];

  try {
    console.log(`Running NTT push for project file: ${projectFile}`);
    await spawnPromise(command, args, { cwd: basePath });
    console.log(`NTT push successful for project file: ${projectFile}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : `Error running NTT push for ${projectFile}: Unknown`;
    console.error(`Error running NTT push for ${projectFile}:`, error);
    throw new Error(`Failed to push project ${projectFile}: ${errorMessage}`);
  }
}

/**
 * Generate Solana NTT Program Key Pair.
 * @param basePath The directory path to run the key pair generation command.
 * @returns An object containing the full path to the generated JSON file and the key address without the .json extension.
 * @throws An error if key pair generation fails.
 */
export async function generateSolanaKeyPair(basePath: string): Promise<{ keyPairPath: string, keyAddress: string }> {
  try {
    console.log(`Generating NTT Program Key Pair in path: ${basePath}`);
    const grindOutput = await spawnPromise('solana-keygen', ['grind', '--starts-with', 'ntt:1', '--ignore-case'], { cwd: basePath });

    // Extract the JSON filename from grind output
    const keyFileMatch = grindOutput.match(/Wrote keypair to (\S+\.json)/);
    if (!keyFileMatch) throw new Error("Failed to find generated keypair JSON file in the output.");

    const keyPairFile = keyFileMatch[1];
    const keyPairPath = path.join(basePath, keyPairFile);
    const keyAddress = path.parse(keyPairFile).name; // Key address without .json extension

    console.log(`Key Pair generated: ${keyAddress}, Path: ${keyPairPath}`);
    return { keyPairPath, keyAddress };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred during key pair generation.";
    console.error(errorMessage, error);
    throw new Error(`Failed to generate NTT Program Key Pair: ${errorMessage}`);
  }
}

/**
 * Derive Solana Token Authority for a given key address.
 * @param keyAddress The key address without the .json extension.
 * @returns The derived token authority.
 * @throws An error if token authority derivation fails.
 */
export async function deriveSolanaTokenAuthority(keyAddress: string): Promise<string> {
  try {
    console.log(`Deriving token authority using key address: ${keyAddress}`);
    const tokenAuthorityOutput = await spawnPromise('ntt', ['solana', 'token-authority', keyAddress], {});

    // Extract the token authority from the output
    const tokenAuthorityMatch = tokenAuthorityOutput.match(/[a-zA-Z0-9]{43,44}/);
    if (!tokenAuthorityMatch) throw new Error("Failed to find token authority in the output.");

    const tokenAuthority = tokenAuthorityMatch[0];
    console.log(`Derived Token Authority: ${tokenAuthority}`);
    return tokenAuthority;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred during token authority derivation.";
    console.error(errorMessage, error);
    throw new Error(`Failed to derive Token Authority: ${errorMessage}`);
  }
}

export default {
  createProject,
  addChain,
  pushProject,
  generateSolanaKeyPair,
  deriveSolanaTokenAuthority
};
