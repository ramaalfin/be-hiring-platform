module.exports = {
  apps: [
    {
      name: "be-hiring-platform",
      script: "./dist/index.js",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      env_production: {
        NODE_ENV: "production",
        PORT: 5001,
      },
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_file: "./logs/pm2-combined.log",
      time: true,
      restart_delay: 5000,
      max_restarts: 10,
      autorestart: true,
    },
  ],
};
