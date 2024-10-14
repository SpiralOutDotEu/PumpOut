import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

interface GenerateSolanaKeyParams {
  cwd: string;
}

async function generateSolanaKeyTask(
  params: GenerateSolanaKeyParams
): Promise<string> {
  const { cwd } = params;

  const command = "solana-keygen";
  const args = ["grind", "--starts-with", "ntt:1", "--ignore-case"];
  const fullCommand = `${command} ${args.join(" ")}`;

  const { stdout, stderr } = await execPromise(fullCommand, { cwd });

  if (stderr) {
    throw new Error(stderr);
  }

  const match = stdout.match(/Wrote keypair to (.*\.json)/);
  if (match && match[1]) {
    const key = match[1].replace(".json", "");
    return key;
  } else {
    throw new Error("Key not found in output");
  }
}

export default generateSolanaKeyTask;
