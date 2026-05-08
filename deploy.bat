@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

echo ==========================================
echo    静墨博客 - 部署脚本 (Windows)
echo ==========================================

:: 检查 Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未安装 Node.js
    echo 请先安装 Node.js: https://nodejs.org/
    pause
    exit /b 1
)

:: 检查 npm
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未安装 npm
    pause
    exit /b 1
)

:: 步骤 1: 安装依赖
echo.
echo [1/4] 安装依赖...
npm install
if %errorlevel% neq 0 (
    echo [错误] 依赖安装失败
    pause
    exit /b 1
)
echo [成功] 依赖安装完成

:: 步骤 2: 配置环境变量
echo.
echo [2/4] 配置环境变量...
if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env > nul
        echo [成功] 已创建 .env 文件，请编辑设置密码
    )
) else (
    echo [跳过] 环境变量文件已存在
)

:: 步骤 3: 创建上传目录
echo.
echo [3/4] 创建必要目录...
if not exist "uploads" mkdir uploads
echo [成功] 目录创建完成

:: 步骤 4: 启动服务
echo.
echo [4/4] 启动服务...
echo.
echo 启动方式:
echo   1. 直接运行 (npm start)
echo   2. 使用 PM2 (需先安装: npm install -g pm2)
echo   3. 使用 Docker (docker-compose up -d)
echo.

:: 检查是否安装了 PM2
where pm2 >nul 2>&1
if %errorlevel% equ 0 (
    echo 检测到 PM2，按任意键使用 PM2 启动...
    pause > nul
    pm2 start server/app.js --name "jingmo-blog"
    pm2 save
    echo.
    echo [成功] 服务已启动
) else (
    echo.
    echo [提示] 建议安装 PM2 进行进程管理:
    echo   npm install -g pm2
    echo.
    echo 或直接启动服务:
    echo   npm start
)

echo.
echo ==========================================
echo    部署完成!
echo ==========================================
echo 访问地址: http://localhost:3000
echo ==========================================

pause
