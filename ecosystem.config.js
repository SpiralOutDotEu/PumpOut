module.exports = {
  apps: [
    {
      name: "frontend",
      script: "npm",
      args: "run start",
      cwd: "./frontend",
    },
    {
      name: "backend",
      script: "npm",
      args: "run start",
      cwd: "./backend",
    },
  ],
};
