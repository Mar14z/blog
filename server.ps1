Write-Host "🚀 启动博客后端服务..." -ForegroundColor Green
Write-Host ""

$envPath = Join-Path $PSScriptRoot ".env"
if (Test-Path $envPath) {
    Write-Host "📄 已加载环境配置文件" -ForegroundColor Cyan
}

$nodeModulesPath = Join-Path $PSScriptRoot "node_modules"
if (-not (Test-Path $nodeModulesPath)) {
    Write-Host "📦 正在安装依赖..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "🌟 启动服务器中..." -ForegroundColor Green
Write-Host ""

node server/app.js
