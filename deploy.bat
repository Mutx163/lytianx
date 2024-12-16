@echo off
chcp 65001 > nul

echo ============================================
echo              GitHub Pages 部署
echo ============================================

if not exist .git (
    echo [1] 初始化仓库...
    git init
    git remote add origin https://github.com/Mutx163/mutx163.github.io.git
    git config --global credential.helper store
)

echo [2] 配置 Git...
git config --local core.autocrlf false
git config --local i18n.logoutputencoding utf-8
git config --local i18n.commitencoding utf-8
git config --local gui.encoding utf-8

echo [3] 添加文件...
git add -A

echo [4] 准备提交...
echo 请输入提交说明，例如：首次提交
set /p message=^> 
git commit -m "%message%"

echo [5] 切换分支...
git branch -M main

echo [6] 推送到 GitHub...
git push -f origin main

echo ============================================
echo              部署完成！
echo ============================================