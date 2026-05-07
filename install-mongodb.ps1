# MongoDB Installation Script

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  MongoDB Community Edition Installer" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: Please run as Administrator" -ForegroundColor Red
    Write-Host "Right-click PowerShell, select 'Run as administrator'" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "[1/5] Checking MongoDB installation..." -ForegroundColor Yellow
$service = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue

if ($service) {
    Write-Host "MongoDB already installed: $($service.Status)" -ForegroundColor Green
    $continue = Read-Host "Continue with installation? (y/n)"
    if ($continue -ne 'y') {
        exit 0
    }
}

Write-Host ""
Write-Host "[2/5] Downloading MongoDB..." -ForegroundColor Yellow
$downloadUrl = "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.5-signed.msi"
$installerPath = "$env:TEMP\mongodb-installer.msi"

try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath -UseBasicParsing
    Write-Host "Download complete" -ForegroundColor Green
} catch {
    Write-Host "Download failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual installation:" -ForegroundColor Yellow
    Write-Host "1. Visit: https://www.mongodb.com/try/download/community" -ForegroundColor Cyan
    Write-Host "2. Select: Community Server, Windows, MSI" -ForegroundColor Cyan
    Write-Host "3. Download and run installer" -ForegroundColor Cyan
    pause
    exit 1
}

Write-Host ""
Write-Host "[3/5] Installing MongoDB..." -ForegroundColor Yellow
Write-Host "Please wait..."

$installArgs = "/i `"$installerPath`" /quiet /norestart ADDLOCAL=`"all`""

try {
    $process = Start-Process msiexec.exe -ArgumentList $installArgs -Wait -PassThru -NoNewWindow
    if ($process.ExitCode -eq 0 -or $process.ExitCode -eq 3010) {
        Write-Host "MongoDB installed successfully" -ForegroundColor Green
        if ($process.ExitCode -eq 3010) {
            Write-Host "(Computer restart required)" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "Installation failed: $_" -ForegroundColor Red
    Remove-Item $installerPath -Force -ErrorAction SilentlyContinue
    pause
    exit 1
}

Write-Host ""
Write-Host "[4/5] Configuring MongoDB..." -ForegroundColor Yellow

$dataPath = "C:\data\db"
$logPath = "C:\data\log"

if (-not (Test-Path $dataPath)) {
    New-Item -Path $dataPath -ItemType Directory -Force | Out-Null
    Write-Host "Created data directory: $dataPath" -ForegroundColor Green
}

if (-not (Test-Path $logPath)) {
    New-Item -Path $logPath -ItemType Directory -Force | Out-Null
    Write-Host "Created log directory: $logPath" -ForegroundColor Green
}

Write-Host ""
Write-Host "[5/5] Starting MongoDB service..." -ForegroundColor Yellow

try {
    $service = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
    if ($service) {
        if ($service.Status -ne "Running") {
            Start-Service -Name "MongoDB"
            Write-Host "MongoDB service started" -ForegroundColor Green
        } else {
            Write-Host "MongoDB service already running" -ForegroundColor Green
        }
    } else {
        Write-Host "Service not found, starting manually..." -ForegroundColor Yellow
        $mongoPath = "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
        if (Test-Path $mongoPath) {
            $logFile = "C:\data\log\mongod.log"
            Start-Process $mongoPath -ArgumentList "--dbpath C:\data\db --logpath $logFile --install" -Verb RunAs -Wait -WindowStyle Hidden
            Start-Process $mongoPath -ArgumentList "--dbpath C:\data\db --logpath $logFile" -Verb RunAs -WindowStyle Hidden
            Write-Host "MongoDB started" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "Service start issue, try manually: net start MongoDB" -ForegroundColor Yellow
}

Remove-Item $installerPath -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Installation Complete!" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. If restart needed, restart your computer" -ForegroundColor White
Write-Host "2. Go to blog: cd f:\TraeCode\blog" -ForegroundColor White
Write-Host "3. Start server: npm start" -ForegroundColor White
Write-Host ""
Write-Host "Blog: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Admin: http://localhost:3000/admin" -ForegroundColor Cyan
Write-Host "Login: admin / admin123" -ForegroundColor Cyan
Write-Host ""

pause
