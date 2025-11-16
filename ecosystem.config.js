module.exports = {
  apps: [{
    name: 'mychat',
    script: '/home/fphillips/MyChat/start.sh',
    cwd: '/home/fphillips/MyChat',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '/home/fphillips/MyChat/logs/error.log',
    out_file: '/home/fphillips/MyChat/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
