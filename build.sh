#!/bin/bash

# 打印当前目录结构，用于调试
echo "当前工作目录: $(pwd)"
echo "目录内容:"
ls -la

# 检查package.json是否存在
if [ -f "package.json" ]; then
    echo "package.json 已找到，开始安装依赖..."
    npm install
else
    echo "错误: package.json 未找到！"
    echo "在以下位置搜索 package.json:"
    find / -name "package.json" -type f 2>/dev/null | head -n 10
    exit 1
fi

# 成功安装后打印信息
echo "构建过程完成!"
