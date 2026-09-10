module.exports = {
  apps: [
    {
      name: 'spbi-prod',
      script: 'server.js',
      cwd: '/var/www/spbi-prod',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 8080
      }
    },
    {
      name: 'spbi-dev',
      script: 'server.js',
      cwd: '/var/www/spbi-dev',
      instances: 1,
      autorestart: true,
      watch: true,
      ignore_watch: ['node_modules', '.git', 'Data', '*.log'],
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'development',
        PORT: 8081
      }
    }
  ]
};
