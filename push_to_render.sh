#!/bin/bash

# 设置日志文件
LOG_FILE="render_deploy_log.txt"

echo "$(date) - 开始推送到Render..." | tee -a $LOG_FILE

# 添加所有更改到Git
echo "添加所有文件到Git..." | tee -a $LOG_FILE
git add campsites.json real_campsites.json backup_*.json

# 提交更改
COMMIT_MESSAGE="自动更新露营地数据 $(date +"%Y-%m-%d %H:%M:%S")"
echo "提交更改: $COMMIT_MESSAGE" | tee -a $LOG_FILE
git commit -m "$COMMIT_MESSAGE"

# 推送到主分支
echo "推送到GitHub仓库..." | tee -a $LOG_FILE
if git push origin main; then
  echo "推送成功! Render应该会自动重新部署" | tee -a $LOG_FILE
  echo "您的网站应该在几分钟内更新" | tee -a $LOG_FILE
else
  echo "推送失败。请检查网络连接或GitHub凭据。" | tee -a $LOG_FILE
  echo "错误状态: $?" | tee -a $LOG_FILE
fi

echo "$(date) - 推送流程完成" | tee -a $LOG_FILE
