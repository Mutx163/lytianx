@echo off
chcp 65001 > nul

echo ============================================
echo          前后端代码自动部署脚本
echo ============================================

echo 请输入更新日志:
set /p commit_message=^> 

REM 部署前端代码到 GitHub Pages
echo.
echo [1] 部署前端代码到 GitHub Pages...
echo.

if not exist .git (
    echo [1.1] 初始化前端仓库...
    git init
    git remote add origin https://github.com/Mutx163/mutx163.github.io.git
    git config --global credential.helper store
)

echo [1.2] 配置 Git...
git config --local core.autocrlf false
git config --local i18n.logoutputencoding utf-8
git config --local i18n.commitencoding utf-8
git config --local gui.encoding utf-8

echo [1.3] 添加前端文件...
git add -A

echo [1.4] 提交前端代码...
git commit -m "%commit_message%"

echo [1.5] 切换分支...
git branch -M main

echo [1.6] 推送前端代码...
git push -f origin main

REM 部署后端代码到私有仓库
echo.
echo [2] 部署后端代码到私有仓库...
echo.

cd server

if not exist .git (
    echo [2.1] 初始化后端仓库...
    git init
    git remote add origin https://github.com/Mutx163/personal-website-server.git
)

echo [2.2] 添加后端文件...
git add -A

echo [2.3] 提交后端代码...
git commit -m "%commit_message%"

echo [2.4] 推送后端代码...
git push -f origin main

cd ..

echo.
echo ============================================
echo              部署完成！
echo ============================================ 