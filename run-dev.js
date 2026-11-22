const { spawn } = require('child_process');

function run(commandStr, cwd, prefix, color) {
  const child = spawn(commandStr, { cwd, stdio: ['inherit', 'pipe', 'pipe'], shell: true });
  
  child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach((line, i) => {
      if (line || i < lines.length - 1) {
        process.stdout.write(`\x1b[${color}m[${prefix}]\x1b[0m ${line}\n`);
      }
    });
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach((line, i) => {
      if (line || i < lines.length - 1) {
        process.stderr.write(`\x1b[${color}m[${prefix}]\x1b[0m ${line}\n`);
      }
    });
  });

  child.on('close', (code) => {
    if (code !== null && code !== 0) {
      console.log(`\x1b[${color}m[${prefix}]\x1b[0m exited with code ${code}`);
    }
  });

  return child;
}

console.log('\x1b[32m🚀 Starting VitalCare Server & Client...\x1b[0m\n');

const server = run('npm run dev', './server', 'SERVER', '36');
const client = run('npm run dev', './client', 'CLIENT', '35');

function cleanup() {
  console.log('\n\x1b[33m🛑 Stopping all VitalCare services...\x1b[0m');
  server.kill('SIGTERM');
  client.kill('SIGTERM');
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
