// Playwright'ni topish: CI'da loyiha ichidan (npm i --no-save), sandbox'da global o'rnatilgandan.
const { execSync } = require('child_process');
let pw;
try { pw = require('playwright'); } catch (e) { pw = require(execSync('npm root -g').toString().trim() + '/playwright'); }
exports.launch = () => pw.chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
