@echo off
chcp 65001
echo [部署] 正在部署到 GitHub Pages...

REM 检查是否已初始化 git 仓库
if not exist .git (
    echo [初始化] 正在初始化 Git 仓库...
    git init
    git remote add origin https://github.com/Mutx163/mutx163.github.io.git
)

REM 配置 Git
git config --local core.autocrlf false
git config --local i18n.logoutputencoding utf-8
git config --local i18n.commitencoding utf-8
git config --local gui.encoding utf-8

REM 添加所有文件
git add -A

REM 提交更改
set /p commit_message=[提交] 请输入提交信息: 
git commit -m "%commit_message%"

REM 创建并切换到主分支
git branch -M main

REM 推送到 GitHub
echo [推送] 正在推送到 GitHub...
git push -f origin main

echo [完成] 部署完成！
pause 