#!/bin/bash

# 确保脚本抛出遇到的错误
set -e

# 进入项目根目录
cd "$(dirname "$0")"

# 如果是首次部署，先初始化 git 仓库
if [ ! -d .git ]; then
    git init
    git remote add origin https://github.com/Mutx163/mutx163.github.io.git
fi

# 添加所有文件到暂存区
git add -A

# 提交更改
echo "请输入提交信息："
read commit_message
git commit -m "$commit_message"

# 推送到 GitHub
echo "正在推送到 GitHub..."
git push -u origin main

echo "部署完成！" 