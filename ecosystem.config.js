module.exports = {
  apps: [
    {
      name: "be-hiring-platform",
      script: "dist/index.js",
      instances: 1,
      exec_mode: "fork",
      env_production: {
        NODE_ENV: "production",
      },
      watch: false,
      max_memory_restart: "300M",
      error_file: "logs/err.log",
      out_file: "logs/out.log",
      log_file: "logs/combined.log",
      time: true,
    },
  ],
};
