#!/usr/bin/env node

const path = require("path");

// Run the setup script
try {
    require("./setup.js");
} catch (error) {
    console.error("Error running setup:", error);
    process.exit(1);
}