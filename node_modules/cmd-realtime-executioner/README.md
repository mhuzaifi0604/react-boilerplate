# CMD Realtime Executioner

A powerful Node.js command executor with real-time output streaming and process management capabilities. Perfect for running system commands, managing long-running processes, and handling real-time command outputs.

```ascii
 .---. .-.   .-..----.    .----..-.  .-..----..---. .-. .-. .---. .-. .----. .-. .-..----..----. 
/  ___}|  `.'  || {}  \   | {_   \ \/ / | {_ /  ___}| { } |{_   _}| |/  {}  \|  `| || {_  | {}  }
\     }| |\ /| ||     /   | {__  / /\ \ | {__\     }| {_} |  | |  | |\      /| |\  || {__ | .-. \
 `---' `-' ` `-'`----'    `----'`-'  `-'`----'`---' `-----'  `-'  `-' `----' `-' `-'`----'`-' `-'
```

## Features

- Real-time command output streaming
- Process management and control
- Built-in timeout handling
- Error and warning event emission
- Memory-efficient stream processing
- Support for one-time and long-running commands
- Built-in help system

## Installation

```bash
npm install cmd-realtime-executioner
```

## Basic Usage

### One-time Commands

```javascript
const { CommandExecutor } = require('cmd-realtime-executioner');

async function runCommand() {
    const executor = new CommandExecutor();
    try {
        const output = await executor.execute('dir');
        console.log(output);
    } catch (error) {
        console.error('Command failed:', error);
    }
}
```

### Real-time Output Commands

```javascript
const executor = new CommandExecutor();

const process = await executor.realtimeExecution(
    'ping',
    ['google.com'],
    { timeout: 5000 },
    (data, type) => {
        if (type === 'stdout') {
            console.log('Output:', data);
        }
    }
);
```

## Advanced Usage

### Process Control

```javascript
// Stop a specific process
await process.stop();

// Check if process is running
const isRunning = process.isRunning();

// Stop all processes
await executor.stopAll();
```

### Error Handling

```javascript
const executor = new CommandExecutor();

executor.on('error', (error) => console.error('Error:', error));
executor.on('warning', (warning) => console.warn('Warning:', warning));
```

## TShark Integration Example

The package includes examples for integrating with TShark for network packet capture:

```javascript
const { capturePackets, listInterfaces } = require('./tshark.js');

// List available interfaces
await listInterfaces();

// Start packet capture
await capturePackets();
```

### TShark Configuration

```javascript
const capture = await executor.realtimeExecution(
    '"C:\\Program Files\\Wireshark\\tshark"',
    [
        '-i', '5',              // Interface number
        '-T', 'fields',         // Output format
        '-E', 'header=y',       // Include headers
        '-e', 'frame.time',     // Timestamp
        '-e', 'ip.src',         // Source IP
        '-e', 'ip.dst',         // Destination IP
        '-e', 'ip.proto'        // Protocol
    ],
    { timeout: 0 },
    async (data, type) => {
        console.log('Packet:', data.trim());
    }
);
```

## API Reference

### CommandExecutor Class

#### Methods

- `execute(command, options)`: Execute a one-time command
- `realtimeExecution(command, args, options, onData)`: Execute a command with real-time output
- `stopProcess(processId)`: Stop a specific process
- `isProcessRunning(processId)`: Check process status
- `stopAll()`: Stop all running processes

#### Options

```javascript
const defaultOptions = {
    encoding: 'utf8',
    shell: true,
    maxBuffer: 1024 * 1024 * 100,
    timeout: 0 // 0 means no timeout
};
```

### Built-in Help

Access built-in help documentation:

```bash
node your-script.js --help        # Basic help
node your-script.js -h --detailed # Detailed help
```

## Example Projects

### Basic Command Execution
```javascript
const executor = new CommandExecutor();
const output = await executor.execute('dir');
```

### Real-time Network Monitoring
```javascript
const capture = await executor.realtimeExecution(
    'ping',
    ['google.com', '-t'],
    { timeout: 10000 },
    (data) => console.log(data)
);
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
ISC