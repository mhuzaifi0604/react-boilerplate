const { CommandExecutor } = require('./index.js');

async function listInterfaces() {
    const executor = new CommandExecutor();
    try {
        const output = await executor.execute('"C:\\Program Files\\Wireshark\\tshark" -D');
        console.log('Available Interfaces:');
        console.log(output);
    } catch (error) {
        console.error('Failed to list interfaces:', error);
    }
}

async function capturePackets() {
    const executor = new CommandExecutor();
    
    // Setup event listeners
    executor.on('error', (error) => console.error('TShark Error:', error));
    executor.on('warning', (warning) => console.warn('TShark Warning:', warning));
    
    try {
        // First list interfaces
        await listInterfaces();
        
        console.log('\nStarting packet capture...');
        const capture = await executor.realtimeExecution(
            '"C:\\Program Files\\Wireshark\\tshark"',
            [
                '-i', '5',                  // Interface number (change as needed)
                '-T', 'fields',             // Output format
                '-E', 'header=y',           // Include headers
                '-e', 'frame.time',         // Timestamp
                '-e', 'ip.src',             // Source IP
                '-e', 'ip.dst',             // Destination IP
                '-e', 'ip.proto',           // Protocol
                '-l'                        // Line-buffered mode
            ],
            { 
                timeout: 0,                 // No timeout
                shell: true,
                encoding: 'utf8'
            },
            async (data, type) => {
                if (type === 'stdout') {
                    // Process and display packet data
                    const packetData = data.trim();
                    if (packetData) {
                        console.log('Packet:', packetData);
                    }
                } else if (type === 'stderr') {
                    // Handle errors
                    console.error('TShark stderr:', data.trim());
                }
            }
        );
        
        console.log('Capture started successfully. Will run for 30 seconds...');
        
        // Stop capture after 30 seconds
        setTimeout(async () => {
            try {
                await capture.stop();
                console.log('Capture stopped successfully');
            } catch (error) {
                console.error('Error stopping capture:', error);
            }
        }, 10000);
        
        return capture;
        
    } catch (error) {
        console.error('Failed to start capture:', error);
        throw error;
    }
}

async function main() {
    try {
        console.log('Starting TShark packet capture...');
        await capturePackets();
    } catch (error) {
        console.error('Main execution error:', error);
    }
}

// Export functions
module.exports = {
    capturePackets,
    listInterfaces,
    main
};