module.exports = {
  apps: [{
    name: 'poster-generator',
    cwd: './server',
    script: 'src/index.ts',
    interpreter: 'node',
    interpreter_args: '--import tsx',
    env: {
      NODE_ENV: 'production',
    },
  }],
};
