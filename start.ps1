# 静墨博客 - 快速启动脚本
# 运行前请确保已安装 Node.js 和 MongoDB

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  静墨博客 - 启动脚本" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 检查Node.js
Write-Host "[1/4] 检查Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "  ✓ Node.js版本: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ 未找到Node.js，请先安装" -ForegroundColor Red
    Write-Host "  下载地址: https://nodejs.org/" -ForegroundColor Cyan
    exit 1
}

# 检查MongoDB
Write-Host ""
Write-Host "[2/4] 检查MongoDB..." -ForegroundColor Yellow
$mongoStatus = (Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue).Status
if ($mongoStatus -eq "Running") {
    Write-Host "  ✓ MongoDB服务正在运行" -ForegroundColor Green
} else {
    Write-Host "  ! MongoDB未运行，尝试启动..." -ForegroundColor Yellow
    Start-Service MongoDB -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    if ((Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue).Status -eq "Running") {
        Write-Host "  ✓ MongoDB已启动" -ForegroundColor Green
    } else {
        Write-Host "  ! 请手动启动MongoDB服务" -ForegroundColor Yellow
        Write-Host "  命令: net start MongoDB" -ForegroundColor Cyan
    }
}

# 安装依赖
Write-Host ""
Write-Host "[3/4] 安装依赖..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ✗ 依赖安装失败" -ForegroundColor Red
        exit 1
    }
}
Write-Host "  ✓ 依赖已就绪" -ForegroundColor Green

# 启动服务
Write-Host ""
Write-Host "[4/4] 启动服务器..." -ForegroundColor Yellow
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  服务启动中..." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  博客前端:  http://localhost:3000" -ForegroundColor White
Write-Host "  管理后台:  http://localhost:3000/admin" -ForegroundColor White
Write-Host "  API接口:   http://localhost:3000/api" -ForegroundColor White
Write-Host "  默认账户:  admin / admin123" -ForegroundColor White
Write-Host ""
Write-Host "  按 Ctrl+C 停止服务" -ForegroundColor Gray
Write-Host ""

# 启动Node服务
node server/app.js
