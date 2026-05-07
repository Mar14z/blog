@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo   静墨博客 - 智能博客系统
echo ========================================
echo.

echo [1/4] 检查 MongoDB...
sc query MongoDB | find "RUNNING" >nul
if %errorlevel% neq 0 (
    echo     [提示] MongoDB 未运行，正在启动...
    net start MongoDB >nul 2>&1
)
echo     [完成] MongoDB 已就绪
echo.

echo [2/4] 检查依赖...
if not exist "node_modules" (
    echo     正在安装依赖...
    npm install >nul 2>&1
)
echo     [完成] 依赖检查完成
echo.

echo [3/4] 启动博客服务器...
start cmd /k "title 博客服务器 && cd /d %~dp0 && node server/app.js"
timeout /t 1 /nobreak >nul
echo     [完成] 服务器已启动
echo.

echo [4/4] 启动 Obsidian 监控...
start cmd /k "title Obsidian监控 && cd /d %~dp0 && node scripts/watch-and-sync.js"
timeout /t 1 /nobreak >nul
echo     [完成] 监控已启动
echo.

echo ========================================
echo   所有服务已启动！
echo ========================================
echo.
echo 服务地址：
echo   - 博客首页：  http://localhost:3000
echo   - 管理后台： http://localhost:3000/admin
echo   - 默认账户： admin / admin123
echo.
echo Obsidian 知识库：
echo   - 路径：%~dp0obsidian-vault
echo   - 发布：移动到 01 - Blog 文件夹
echo   - 写作：在 02 - Notes 文件夹
echo.
echo 停止服务：在对应窗口按 Ctrl+C
echo.
pause
