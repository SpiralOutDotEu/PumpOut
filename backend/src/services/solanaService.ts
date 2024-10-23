import { spawn } from 'child_process';
import "dotenv/config";

interface SolanaEventData {
    chainId: string;
    projectPath: string;
    projectFile: string;
    network: string;
    contractAddress: string;
    tokenAddress: string;
    name: string;
    symbol: string;
    minter: string;
}

async function runCliCommand(command: string, args: string[], workingDirectory: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const process = spawn(command, args, { cwd: workingDirectory, shell: true });

        let stdoutData = '';
        let stderrData = '';

        process.stdout.on('data', (data) => {
            stdoutData += data.toString();
        });

        process.stderr.on('data', (data) => {
            stderrData += data.toString();
        });

        process.on('close', (code) => {
            if (code === 0) {
                resolve(stdoutData.trim());
            } else {
                reject(new Error(`Command failed with exit code ${code}: ${stderrData.trim()}`));
            }
        });
    });
}

export async function processSolanaEvent(eventData: SolanaEventData): Promise<any> {
    const { projectPath, projectFile, chainId } = eventData;

    // Step 1: Get environment variables for Solana
    const solanaPayer = process.env['SOLANA_PAYER'];
    const derivedPDA = process.env['DERIVED_PDA'];
    const nttProgramKeypair = process.env['NTT_PROGRAM_KEYPAIR'];

    if (!solanaPayer || !derivedPDA || !nttProgramKeypair) {
        throw new Error('Missing required Solana environment variables');
    }

    try {
        // Step 2: Run "spl-token create-token" and extract token address from output
        console.log('Creating Solana token...');
        const createTokenOutput = await runCliCommand('spl-token', ['create-token'], projectPath);
        const tokenAddressMatch = createTokenOutput.match(/Address:\s+([A-Za-z0-9]+)/);
        const tokenAddress = tokenAddressMatch ? tokenAddressMatch[1] : null;

        if (!tokenAddress) {
            throw new Error('Failed to extract token address from spl-token output');
        }

        console.log(`Token created: ${tokenAddress}`);

        // Step 3: Set the mint authority using "spl-token authorize"
        console.log(`Setting mint authority for token: ${tokenAddress}`);
        await runCliCommand('spl-token', ['authorize', tokenAddress, 'mint', derivedPDA], projectPath);

        // Step 4: Run the NTT CLI "ntt add-chain" command
        console.log(`Adding chain to NTT: Solana`);
        await runCliCommand(
            'ntt',
            [
                'add-chain', 'Solana',
                '--latest',
                '--mode', 'burning',
                '--token', tokenAddress,
                '--payer', solanaPayer,
                '--program-key', nttProgramKeypair,
                '--path', projectFile
            ],
            projectPath
        );

        // Step 5: Return standardized result
        return {
            success: true,
            message: 'Solana event processed successfully',
            data: {
                tokenAddress,
                chainId,
                projectPath,
                projectFile
            }
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during Solana event processing';
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
}
