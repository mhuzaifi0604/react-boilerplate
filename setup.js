#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

// Get the actual destination directory (one level up from node_modules)
const nodeModulesDir = process.env.INIT_CWD || process.cwd();
const projectRootDir = path.resolve(nodeModulesDir);
const destinationDir = path.join(projectRootDir, "src", "Boilerplate");

// Define source directory (from your package)
const sourceDir = path.join(__dirname, "src", "Boilerplate");

const copyFolderSync = (from, to) => {
    if (!fs.existsSync(from)) {
        console.error(`Source directory does not exist: ${from}`);
        return;
    }

    if (!fs.existsSync(to)) {
        fs.mkdirSync(to, { recursive: true });
    }

    fs.readdirSync(from).forEach(element => {
        const fromPath = path.join(from, element);
        const toPath = path.join(to, element);

        if (fs.lstatSync(fromPath).isFile()) {
            fs.copyFileSync(fromPath, toPath);
            console.log(`Copied: ${element}`);
        } else {
            copyFolderSync(fromPath, toPath);
        }
    });
};

try {
    console.log('Starting boilerplate setup...');
    console.log(`Copying files to: ${destinationDir}`);
    copyFolderSync(sourceDir, destinationDir);
    console.log('Boilerplate setup completed successfully!');
} catch (error) {
    console.error('Error during setup:', error);
    process.exit(1);
}