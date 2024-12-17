@echo off
chcp 65001

echo 开始部署...
set /p commit_msg="提交信息: "

echo 部署后端...
cd /d %~dp0server
git add .
git commit -m "%commit_msg%"
git push origin main

echo 部署前端...
cd ..
git add .
git commit -m "%commit_msg%"
git push origin main
firebase deploy --only hosting