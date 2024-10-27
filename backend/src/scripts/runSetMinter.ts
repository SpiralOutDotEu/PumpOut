import { setMinterForEVMChains } from '../services/evmService';
import fs from 'fs';

async function runSetMinterProcess() {
  try {
    // Get the complete path to the project file from the command line arguments
    const projectFilePath = process.argv[2];

    if (!projectFilePath) {
      throw new Error("Usage: ts-node scripts/setMinterScript.ts <path/to/projectFile.json>");
    }

    // Check if the file exists
    if (!fs.existsSync(projectFilePath)) {
      throw new Error(`Project file does not exist at path: ${projectFilePath}`);
    }

    // Run the setMinterForEVMChains process
    console.log(`Setting minter for EVM chains in project file: ${projectFilePath}`);
    await setMinterForEVMChains(projectFilePath);
    console.log("Minter set successfully for all EVM chains in the project file.");

  } catch (error) {
    console.error("Error running setMinter process:", error);
    process.exit(1);
  }
}

// Execute the function
runSetMinterProcess();