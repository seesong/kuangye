const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const cron = require('node-cron');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 提供静态文件服务
app.use(express.static(path.join(__dirname)));

// 设置日志记录函数
function logMessage(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  fs.appendFileSync('server_log.txt', logEntry);
  console.log(message);
}

// 创建API端点显示最后更新时间
app.get('/api/status', (req, res) => {
  try {
    const campsiteData = JSON.parse(fs.readFileSync('campsites.json', 'utf8'));
    const lastUpdated = fs.statSync('campsites.json').mtime;
    res.json({
      status: 'ok',
      lastUpdated: lastUpdated,
      campsiteCount: campsiteData.length || 0
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// 手动触发数据更新的API端点
app.post('/api/update', (req, res) => {
  logMessage('手动触发数据更新...');
  
  exec('node scrape_campsites.js && node fetch_real_data.js', (error, stdout, stderr) => {
    if (error) {
      logMessage(`执行出错: ${error}`);
      return res.status(500).json({ status: 'error', message: error.message });
    }
    
    logMessage(`数据更新完成: ${stdout}`);
    if (stderr) logMessage(`警告: ${stderr}`);
    
    res.json({ status: 'success', message: '数据更新完成' });
  });
});

// 设置每天凌晨1点运行爬虫（服务器时间，请注意时区差异）
cron.schedule('0 1 * * *', () => {
  logMessage('开始执行计划的数据更新任务...');
  
  exec('node scrape_campsites.js && node fetch_real_data.js', (error, stdout, stderr) => {
    if (error) {
      logMessage(`执行出错: ${error}`);
      return;
    }
    
    logMessage(`计划任务执行完成: ${stdout}`);
    if (stderr) logMessage(`警告: ${stderr}`);
  });
});

// 首页重定向
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  logMessage(`服务器启动成功! 运行在 http://localhost:${PORT}`);
});
