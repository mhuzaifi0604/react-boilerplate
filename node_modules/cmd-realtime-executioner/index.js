const { spawn, exec } = require('child_process');
const { EventEmitter } = require('events');

class CommandExecutor extends EventEmitter {
    constructor() {
        super();
        this.activeProcesses = new Map();
    }

    /**
     * Execute a command and handle its output
     * @param {string} command - Command to execute
     * @param {string[]} args - Command arguments
     * @param {Object} options - Execution options
     * @param {function} onData - Optional real-time data callback
     * @returns {Promise<Object|string>} Command result or process controller
     */
    async realtimeExecution(command, args = [], options = {}, onData = null) {
        try {
            const defaultOptions = {
                encoding: 'utf8',
                shell: true,
                maxBuffer: 1024 * 1024 * 100,
                timeout: 0 // 0 means no timeout
            };

            const processOptions = { ...defaultOptions, ...options };
            const process = spawn(command, args, processOptions);
            const processId = Math.random().toString(36).substring(7);
            
            // Store process reference
            this.activeProcesses.set(processId, process);

            // Setup stream handlers
            let output = '';
            const dataPromise = new Promise(async (resolve, reject) => {
                try {
                    // Handle stdout using async iteration
                    for await (const chunk of process.stdout) {
                        const data = chunk.toString();
                        output += data;
                        
                        if (onData) {
                            try {
                                await onData(data, 'stdout');
                            } catch (callbackError) {
                                this.emit('error', `Callback error: ${callbackError.message}`);
                            }
                        }
                    }

                    // Handle stderr using async iteration
                    for await (const chunk of process.stderr) {
                        const errorData = chunk.toString();
                        if (onData) {
                            try {
                                await onData(errorData, 'stderr');
                            } catch (callbackError) {
                                this.emit('error', `Callback error: ${callbackError.message}`);
                            }
                        } else {
                            this.emit('error', errorData);
                        }
                    }

                    // Wait for process to complete
                    const exitCode = await new Promise((resolveExit) => {
                        process.on('exit', resolveExit);
                    });

                    // Clean up process reference
                    this.activeProcesses.delete(processId);

                    if (exitCode !== 0 && !onData) {
                        throw new Error(`Process exited with code ${exitCode}`);
                    }

                    // For real-time commands, return process controller
                    if (onData) {
                        resolve({
                            processId,
                            stop: () => this.stopProcess(processId),
                            isRunning: () => this.isProcessRunning(processId),
                            exitCode
                        });
                    } else {
                        resolve(output);
                    }
                } catch (error) {
                    reject(error);
                }
            });

            // Handle timeout if specified
            if (processOptions.timeout > 0) {
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => {
                        this.stopProcess(processId);
                        reject(new Error(`Command timed out after ${processOptions.timeout}ms`));
                    }, processOptions.timeout);
                });

                return await Promise.race([dataPromise, timeoutPromise]);
            }

            return await dataPromise;

        } catch (error) {
            this.emit('error', `Execution error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Execute a one-time command
     * @param {string} command - Command string
     * @param {Object} options - Execution options
     * @returns {Promise<string>} Command output
     */
    async execute(command, options = {}) {
        try {
            const defaultOptions = {
                maxBuffer: 1024 * 1024 * 100,
                timeout: 0
            };

            const execOptions = { ...defaultOptions, ...options };

            return await new Promise((resolve, reject) => {
                exec(command, execOptions, (error, stdout, stderr) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    if (stderr) {
                        this.emit('warning', stderr);
                    }
                    resolve(stdout);
                });
            });
        } catch (error) {
            this.emit('error', `One-time execution error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Stop a running process
     * @param {string} processId - Process identifier
     * @returns {boolean} Success status
     */
    stopProcess(processId) {
        try {
            const process = this.activeProcesses.get(processId);
            if (process) {
                process.kill();
                this.activeProcesses.delete(processId);
                return true;
            }
            return false;
        } catch (error) {
            this.emit('error', `Stop process error: ${error.message}`);
            return false;
        }
    }

    /**
     * Check if a process is running
     * @param {string} processId - Process identifier
     * @returns {boolean} Running status
     */
    isProcessRunning(processId) {
        return this.activeProcesses.has(processId);
    }

    /**
     * Stop all running processes
     */
    async stopAll() {
        try {
            for (const [processId] of this.activeProcesses) {
                await this.stopProcess(processId);
            }
        } catch (error) {
            this.emit('error', `Stop all error: ${error.message}`);
        }
    }
}

/**
 * Display help information
 * @param {boolean} detailed - Show detailed help
 */
function showHelp(detailed = false) {
    const colors = {
        red: '\x1b[31m',
        green: '\x1b[32m',
        reset: '\x1b[0m'  // Reset color
    };

    const asciiArt = `${colors.red} .---. .-.   .-..----.    .----..-.  .-..----..---. .-. .-. .---. .-. .----. .-. .-..----..----. 
/  ___}|  \`.\`  || {}  \\   | {_   \\ \\/ / | {_ /  ___}| { } |{_   _}| |/  {}  \\|  \`| || {_  | {}  }
\\     }| |\\ /| ||     /   | {__  / /\\ \\ | {__\\     }| {_} |  | |  | |\\      /| |\\  || {__ | .-. \\
 \`---' \`-' \` \`-'\`----'    \`----'\`-'  \`-'\`----'\`---' \`-----'  \`-'  \`-' \`----' \`-' \`-'\`----'\`-' \`-'${colors.reset}`;
 console.log("\n")

    const basicHelp = `
${asciiArt}
Command Executor Help
====================
Usage: node script.js [options]

Options:
    --help, -h     Show this help message
    --detailed     Show detailed help with examples

Basic Usage:
    const executor = new CommandExecutor();
    
    // For one-time commands:
    const output = await executor.execute('command');
    
    // For real-time commands:
    const process = await executor.realtimeExecution('command', [], {}, (data) => console.log(data));
    `;

    const detailedHelp = `
${asciiArt}
Detailed Help
============
1. Installation:
   const {CommandExecutor} = require('./your-script-path');

2. Creating an instance:
   const executor = new CommandExecutor();

3. Executing commands:
   a) One-time commands:
      const output = await executor.execute('command');

   b) Real-time commands:
      const process = await executor.realtimeExecution('ping',
          ['google.com'],
          { timeout: 5000 },
          (data, type) => console.log(data)
      );

4. Options:
   - timeout: Set timeout in milliseconds
   - encoding: Set character encoding
   - shell: Enable/disable shell

5. Process Control:
   - Stop a process: process.stop()
   - Check if running: process.isRunning()
   - Stop all: executor.stopAll()

6. Error Handling:
   executor.on('error', (error) => console.error(error));
   executor.on('warning', (warning) => console.warn(warning));

Examples:
   // Execute a simple command
   const output = await executor.execute('dir');

   // Real-time command with timeout
   const process = await executor.realtimeExecution('ping',
       ['google.com'],
       { timeout: 5000 },
       (data) => console.log(data)
   );
   `;

    console.log(detailed ? detailedHelp : basicHelp);
}

// Handle CLI arguments
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.includes('--help') || args.includes('-h')) {
        showHelp(args.includes('--detailed'));
        process.exit(0);
    }
}

// Example usage
async function example() {
    const executor = new CommandExecutor();

    executor.on('error', (error) => console.error('Error:', error));
    executor.on('warning', (warning) => console.warn('Warning:', warning));

    try {
        // Example with real-time command
        const realTimeCmd = await executor.realtimeExecution('ping', 
            ['google.com', '-t'],
            { timeout: 10000 },
            async (data, type) => {
                if (type === 'stdout') {
                    console.log('Received:', data.trim());
                } else {
                    console.error('Error:', data.trim());
                }
            }
        );
        await executor.stopAll();

    } catch (error) {
        console.error('Example error:', error);
        await executor.stopAll();
    }
}

module.exports = { CommandExecutor, example, showHelp }