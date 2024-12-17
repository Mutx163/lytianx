@echo off
chcp 65001 > nul

echo ============================================
echo          前后端代码自动部署脚本
echo ============================================

:input_message
echo 请输入提交信息:
set /p commit_msg=^> 
if "%commit_msg%"=="" (
    echo 提交信息不能为空！
    goto input_message
)

REM 1. 部署后端代码到 LeanCloud
echo.
echo [1] 部署后端代码到 LeanCloud...

REM 进入 server 目录
cd /d %~dp0server

REM 检查是否是首次推送
git rev-parse --git-dir >nul 2>&1
if %errorlevel% neq 0 (
    echo 初始化后端 Git 仓库...
    git init
    git remote add origin https://github.com/Mutx163/personal-website-server.git
    
    REM 创建初始提交
    echo # Personal Website Server > README.md
    git add README.md
    git commit -m "Initial commit"
)

REM 添加所有更改
git add .

REM 提交更改
git commit -m "%commit_msg%"

REM 尝试推送到 GitHub
echo 正在推送后端代码到 GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo 尝试切换到 main 分支...
    git checkout -b main
    git push -u origin main
)

echo 后端代码已推送到 GitHub，LeanCloud 将自动部署更新

REM 返回主目录
cd ..

REM 2. 部署前端代码到 Firebase
echo.
echo [2] 部署前端代码到 Firebase...

REM 检查前端 Git 仓库
git rev-parse --git-dir >nul 2>&1
if %errorlevel% neq 0 (
    echo 初始化前端 Git 仓库...
    git init
    git remote add origin https://github.com/Mutx163/mutx163.github.io.git
    
    REM 创建初始提交
    echo # Personal Website > README.md
    git add README.md
    git commit -m "Initial commit"
)

REM 添加前端更改
git add .

REM 提交前端更改
git commit -m "%commit_msg%"

REM 推送前端代码
echo 正在推送前端代码到 GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo 尝试切换到 main 分支...
    git checkout -b main
    git push -u origin main
)

REM 部署到 Firebase
echo.
echo [3] 部署到 Firebase Hosting...
call firebase deploy --only hosting

echo.
echo ============================================
echo              部署完成！
echo ============================================
pause