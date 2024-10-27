import * as fs from 'fs';
import { updateLimits } from '../services/limitUpdaterService';

// ts-node src/scripts/runLimitUpdater.ts path/to/input.json path/to/output.json
function main() {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.error('Usage: ts-node runLimitUpdater.ts <input_file_path> <output_file_path>');
        process.exit(1);
    }

    const inputFilePath = args[0];
    const outputFilePath = args[1];

    // Read the input JSON file
    const inputJSON = fs.readFileSync(inputFilePath, 'utf8');
    const inputData = JSON.parse(inputJSON);

    // Update the limits using the service function
    const updatedData = updateLimits(inputData);

    // Write the output JSON file
    fs.writeFileSync(outputFilePath, JSON.stringify(updatedData, null, 2), 'utf8');
}

// Only execute if run as a standalone script
if (require.main === module) {
    main();
}
