module.exports = {
  apps: [
    {
      name: "Eventy",
      script: "./dist/src/index.js",
      watch: true,
      instance_var: "INSTANCE_ID",
      increment_var: "PORT",
      exec_mode: "cluster",
      instances: -1,
      env: { PORT: 3000, NODE_ENV: "development" },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
