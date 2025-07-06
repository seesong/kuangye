#!/bin/bash
# 自动更新露营地数据脚本

# 设置日志文件
LOG_FILE="update_log.txt"
DATE=$(date "+%Y-%m-%d %H:%M:%S")

echo "===== 数据更新开始: $DATE =====" >> $LOG_FILE

# 切换到脚本所在目录
cd "$(dirname "$0")"

# 运行数据爬取脚本
echo "运行网络爬取脚本..." >> $LOG_FILE
node scrape_campsites.js >> $LOG_FILE 2>&1
echo "完成网络爬取脚本" >> $LOG_FILE

echo "运行数据整合脚本..." >> $LOG_FILE
node fetch_real_data.js >> $LOG_FILE 2>&1
echo "完成数据整合脚本" >> $LOG_FILE

# 输出完成信息
DATE=$(date "+%Y-%m-%d %H:%M:%S")
echo "===== 数据更新完成: $DATE =====" >> $LOG_FILE
echo "" >> $LOG_FILE
