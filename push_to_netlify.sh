#!/bin/bash
# 推送更新的数据到Netlify部署

# 设置日志文件
LOG_FILE="netlify_push_log.txt"
DATE=$(date "+%Y-%m-%d %H:%M:%S")

echo "===== 开始推送数据到Netlify: $DATE =====" >> $LOG_FILE

# 检查是否已安装Netlify CLI
if ! command -v netlify &> /dev/null; then
    echo "未找到Netlify CLI，尝试安装..." >> $LOG_FILE
    npm install -g netlify-cli >> $LOG_FILE 2>&1
fi

# 切换到项目目录
cd "$(dirname "$0")"

# 确保用户已认领Netlify站点，如果没有，提示用户访问认领链接
if ! netlify status &> /dev/null; then
    echo "Netlify站点尚未认领。请访问Netlify认领链接:" >> $LOG_FILE
    echo "https://app.netlify.com/claim?utm_source=windsurf" >> $LOG_FILE
    echo "认领后，再次运行此脚本。" >> $LOG_FILE
    echo "认领后，请运行 'netlify link' 以链接到您的站点。" >> $LOG_FILE
    exit 1
fi

# 部署更新
echo "部署更新的数据文件到Netlify..." >> $LOG_FILE
netlify deploy --prod --message "自动更新露营地数据 $(date '+%Y-%m-%d')" >> $LOG_FILE 2>&1

# 检查部署结果
if [ $? -eq 0 ]; then
    echo "部署成功!" >> $LOG_FILE
else
    echo "部署失败，请检查日志文件。" >> $LOG_FILE
fi

# 记录完成时间
DATE=$(date "+%Y-%m-%d %H:%M:%S")
echo "===== 推送完成: $DATE =====" >> $LOG_FILE
echo "" >> $LOG_FILE
