#!/bin/bash
# 当网络连接恢复后，运行此脚本推送GitHub Actions修复

echo "尝试推送修复的GitHub Actions配置..."

# 配置使用HTTP 1.1
git config --global http.version HTTP/1.1

# 尝试推送
git push origin main

# 检查结果
if [ $? -eq 0 ]; then
  echo "推送成功! 请等待几分钟让GitHub Pages部署完成"
  echo "您的网站应该会在此地址可用: https://seesong.github.io/kuangye/"
else
  echo "推送失败，请检查网络连接后再尝试"
fi
