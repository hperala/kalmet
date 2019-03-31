import { AnalyzerFacade } from './analysis/facade';
import readline from 'readline';
//const readline = require('readline');

const startTime = new Date();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let input = [];
rl.on('line', (line) => {
  //console.log(`Received: ${line}`);
  input.push(line);
});
//rl.close();

rl.on('close', () => {
const facade = new AnalyzerFacade();
//const rawTextLines = input.split('\n');

for (const rawTextLine of input) {
  const { line, result } = facade.analyze(rawTextLine);
  //console.log(`${result.getLineErrorLevel()} ${line.toStringByFeet('-', '/')}`);
}

const endTime = new Date();
var elapsed = (endTime.getTime() - startTime.getTime()) / 1000;

console.log(`Käsiteltiin ${input.length} riviä ${elapsed} sekunnissa.`);
//console.log(`Updated ${updated} lines out of ${rawTextLines.length}`);
});
