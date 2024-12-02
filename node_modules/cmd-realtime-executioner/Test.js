const { CommandExecutor, example, showHelp } = require('./index.js');
const { capturePackets, listInterfaces } = require('./tshark.js');

async function tshark() {
    try {
        await listInterfaces();
        console.log('\nStarting packet capture...');
        await capturePackets();
    } catch (error) {
        console.error('Error:', error);
    }
}

async function runCommand() {
    const executor = new CommandExecutor();
    try {
        const output = await executor.execute('dir');
        console.log(output);
    } catch (error) {
        console.error('Command failed:', error);
    }
}

async function runExamples() {
    try {
        await example();
    } catch (error) {
        console.error("Error Running Command: ", error);
    }
}

// Main function to handle execution
async function main() {
    // Check for command line arguments
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
        showHelp(process.argv.includes('--detailed'));
        return;
    }

    // Run normal commands if no help requested
    await runCommand();
    console.log("Capturing Packets Via Tshark");
    await tshark();
}

// Execute the main function
main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
});