#!/bin/bash
# 将更新的露营地数据推送到GitHub仓库

# 设置日志文件
LOG_FILE="github_push_log.txt"
DATE=$(date "+%Y-%m-%d %H:%M:%S")

echo "===== 开始推送数据到GitHub: $DATE =====" >> $LOG_FILE

# 切换到项目目录
cd "$(dirname "$0")"

# 添加更改的文件
echo "添加更改的文件..." >> $LOG_FILE
git add campsites.json >> $LOG_FILE 2>&1
git add real_campsites.json >> $LOG_FILE 2>&1
git add campsites_backup*.json >> $LOG_FILE 2>&1

# 提交更改
echo "提交更改..." >> $LOG_FILE
git commit -m "自动更新露营地数据 $(date '+%Y-%m-%d')" >> $LOG_FILE 2>&1

# 推送到GitHub
echo "推送到GitHub..." >> $LOG_FILE
git push origin main >> $LOG_FILE 2>&1

# 检查推送结果
if [ $? -eq 0 ]; then
    echo "推送成功!" >> $LOG_FILE
else
    echo "推送失败，请检查日志文件。" >> $LOG_FILE
fi

# 记录完成时间
DATE=$(date "+%Y-%m-%d %H:%M:%S")
echo "===== 推送完成: $DATE =====" >> $LOG_FILE
echo "" >> $LOG_FILE
