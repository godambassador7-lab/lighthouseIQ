"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const output = path.join(root, "dist");
const files = ["index.html", "login.html", "app.js", "login.js", "styles.css", "Lightkeeper.png"];

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
for (const file of files) fs.copyFileSync(path.join(root, file), path.join(output, file));
for (const directory of ["assets", "data"]) fs.cpSync(path.join(root, directory), path.join(output, directory), { recursive: true });
console.log(`Prepared LightkeeperIQ Education static output in ${output}.`);
