#!/usr/bin/env pwsh
<#
.SYNOPSIS
    ZMARTTRADING AUTOMATED STARTUP SCRIPT
    Prevents all common startup issues and ensures clean operation
    
.DESCRIPTION
    This script automates the complete startup process for ZmartTrading:
    1. Kills all existing processes
    2. Resets database if needed
    3. Starts backend and frontend in correct order
    4. Opens browser automatically
    5. Provides status monitoring
    
.EXAMPLE
    .\start_zmarttrading.ps1
    .\start_zmarttrading.ps1 -Reset
    .\start_zmarttrading.ps1 -Reset -OpenBrowser
#>

param(
    [switch]$Reset,
    [switch]$OpenBrowser,
    [switch]$Force
)

# Configuration
$PROJECT_ROOT = "C:\Users\dansi\Desktop\ZmartTrading"
$BACKEND_DIR = "$PROJECT_ROOT\backend"
$BACKEND_PORT = 5000
$FRONTEND_START_PORT = 5173
$SUPERADMIN_EMAIL = "seme@kryptostack.com"
$SUPERADMIN_PASSWORD = "Seme0504"
$BACKUP_DIR = "$PROJECT_ROOT\logs\backups"
$DB_FILE = "$PROJECT_ROOT\backend\instance\zmarttrading.db"
$LOGS_DIR = "$PROJECT_ROOT\logs"

function Write-Status {
    param([string]$Message, [string]$Type = "INFO")
    $timestamp = Get-Date -Format "HH:mm:ss"
    $color = switch ($Type) {
        "SUCCESS" { "Green" }
        "ERROR" { "Red" }
        "WARNING" { "Yellow" }
        default { "Cyan" }
    }
    Write-Host "[$timestamp] $Message" -ForegroundColor $color
}

function Test-Port {
    param([int]$Port)
    try {
        $connection = Test-NetConnection -ComputerName "localhost" -Port $Port -WarningAction SilentlyContinue
        return $connection.TcpTestSucceeded
    }
    catch {
        return $false
    }
}

function Kill-Processes {
    Write-Status "🔪 Killing all Node.js and Python processes..." "WARNING"
    
    # Kill Node.js processes (Vite)
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Write-Status "Found $($nodeProcesses.Count) Node.js processes, killing them..."
        Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
    
    # Kill Python processes (Flask)
    $pythonProcesses = Get-Process -Name "python" -ErrorAction SilentlyContinue
    if ($pythonProcesses) {
        Write-Status "Found $($pythonProcesses.Count) Python processes, killing them..."
        Stop-Process -Name "python" -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
    
    Write-Status "✅ All processes killed successfully" "SUCCESS"
}

function Backup-Database {
    if (!(Test-Path $BACKUP_DIR)) {
        New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null
    }
    if (Test-Path $DB_FILE) {
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $backupFile = "$BACKUP_DIR\zmarttrading_$timestamp.db"
        Copy-Item $DB_FILE $backupFile
        Write-Status "🗄️  Database backed up to $backupFile" "SUCCESS"
    } else {
        Write-Status "ℹ️  No database file to backup" "INFO"
    }
}

function Archive-Logs {
    if (!(Test-Path $LOGS_DIR)) {
        Write-Status "ℹ️  No logs directory to archive" "INFO"
        return
    }
    $logFiles = Get-ChildItem -Path $LOGS_DIR -File -ErrorAction SilentlyContinue
    if ($logFiles.Count -eq 0) {
        Write-Status "ℹ️  No log files to archive" "INFO"
        return
    }
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $archiveFile = "$BACKUP_DIR\logs_$timestamp.zip"
    Compress-Archive -Path $LOGS_DIR\* -DestinationPath $archiveFile -Force
    Write-Status "🗂️  Logs archived to $archiveFile" "SUCCESS"
}

function Reset-Database {
    Write-Status "🔄 Resetting database..." "WARNING"
    
    try {
        Set-Location $PROJECT_ROOT
        python RESET_EVERYTHING.py
        if ($LASTEXITCODE -eq 0) {
            Write-Status "✅ Database reset completed successfully" "SUCCESS"
        } else {
            Write-Status "❌ Database reset failed" "ERROR"
            return $false
        }
    }
    catch {
        Write-Status "❌ Database reset failed: $($_.Exception.Message)" "ERROR"
        return $false
    }
    
    return $true
}

function Start-Backend {
    Write-Status "🚀 Starting Flask backend..." "INFO"
    
    try {
        Set-Location $BACKEND_DIR
        
        # Start backend in background
        $backendJob = Start-Job -ScriptBlock {
            Set-Location $using:BACKEND_DIR
            python app.py
        }
        
        # Wait for backend to start
        $maxWait = 30
        $waited = 0
        while ($waited -lt $maxWait) {
            if (Test-Port -Port $BACKEND_PORT) {
                Write-Status "✅ Backend started successfully on port $BACKEND_PORT" "SUCCESS"
                return $backendJob
            }
            Start-Sleep -Seconds 1
            $waited++
        }
        
        Write-Status "❌ Backend failed to start within $maxWait seconds" "ERROR"
        Stop-Job $backendJob -ErrorAction SilentlyContinue
        return $null
    }
    catch {
        Write-Status "❌ Failed to start backend: $($_.Exception.Message)" "ERROR"
        return $null
    }
}

function Start-Frontend {
    Write-Status "🎨 Starting Vite frontend..." "INFO"
    
    try {
        Set-Location $PROJECT_ROOT
        
        # Find available port
        $port = $FRONTEND_START_PORT
        $maxPortCheck = 10
        
        for ($i = 0; $i -lt $maxPortCheck; $i++) {
            if (-not (Test-Port -Port $port)) {
                break
            }
            $port++
        }
        
        if ($port -ge ($FRONTEND_START_PORT + $maxPortCheck)) {
            Write-Status "❌ No available ports found for frontend" "ERROR"
            return $null
        }
        
        # Start frontend in background
        $frontendJob = Start-Job -ScriptBlock {
            Set-Location $using:PROJECT_ROOT
            $env:PORT = $using:port
            npm run dev
        }
        
        # Wait for frontend to start
        $maxWait = 30
        $waited = 0
        while ($waited -lt $maxWait) {
            if (Test-Port -Port $port) {
                Write-Status "✅ Frontend started successfully on port $port" "SUCCESS"
                return @{ Job = $frontendJob; Port = $port }
            }
            Start-Sleep -Seconds 1
            $waited++
        }
        
        Write-Status "❌ Frontend failed to start within $maxWait seconds" "ERROR"
        Stop-Job $frontendJob -ErrorAction SilentlyContinue
        return $null
    }
    catch {
        Write-Status "❌ Failed to start frontend: $($_.Exception.Message)" "ERROR"
        return $null
    }
}

function Test-System {
    Write-Status "🔍 Testing system connectivity..." "INFO"
    
    # Test backend
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:$BACKEND_PORT/api/session" -Method GET -TimeoutSec 5
        Write-Status "✅ Backend API responding correctly" "SUCCESS"
    }
    catch {
        Write-Status "❌ Backend API not responding: $($_.Exception.Message)" "ERROR"
        return $false
    }
    
    return $true
}

function Open-Browser {
    param([int]$Port)
    
    Write-Status "🌐 Opening browser..." "INFO"
    
    $url = "http://localhost:$Port"
    try {
        Start-Process $url
        Write-Status "✅ Browser opened to $url" "SUCCESS"
        Write-Status "📝 Login credentials:" "INFO"
        Write-Status "   Email: $SUPERADMIN_EMAIL" "INFO"
        Write-Status "   Password: $SUPERADMIN_PASSWORD" "INFO"
    }
    catch {
        Write-Status "❌ Failed to open browser: $($_.Exception.Message)" "ERROR"
    }
}

function Show-Status {
    param($BackendJob, $FrontendInfo)
    
    Write-Status "📊 System Status:" "INFO"
    Write-Status "   Backend: $(if (Test-Port -Port $BACKEND_PORT) { '✅ Running' } else { '❌ Stopped' })" "INFO"
    Write-Status "   Frontend: $(if ($FrontendInfo -and (Test-Port -Port $FrontendInfo.Port)) { "✅ Running on port $($FrontendInfo.Port)" } else { '❌ Stopped' })" "INFO"
    
    if ($BackendJob -and $FrontendInfo) {
        Write-Status "🎉 ZmartTrading is ready!" "SUCCESS"
        Write-Status "   Backend: http://localhost:$BACKEND_PORT" "INFO"
        Write-Status "   Frontend: http://localhost:$($FrontendInfo.Port)" "INFO"
    }
}

# Main execution
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "    ZMARTTRADING AUTOMATED STARTUP" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill existing processes
Kill-Processes

# Step 2: Backup DB and archive logs if requested
if ($Reset -or $Force) {
    Backup-Database
    Archive-Logs
    if (-not (Reset-Database)) {
        Write-Status "❌ Startup failed due to database reset error" "ERROR"
        exit 1
    }
}

# Step 3: Start backend
$backendJob = Start-Backend
if (-not $backendJob) {
    Write-Status "❌ Startup failed due to backend error" "ERROR"
    exit 1
}

# Step 4: Start frontend
$frontendInfo = Start-Frontend
if (-not $frontendInfo) {
    Write-Status "❌ Startup failed due to frontend error" "ERROR"
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    exit 1
}

# Step 5: Test system
Start-Sleep -Seconds 3
if (-not (Test-System)) {
    Write-Status "❌ System test failed" "ERROR"
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job $frontendInfo.Job -ErrorAction SilentlyContinue
    exit 1
}

# Step 6: Show status
Show-Status -BackendJob $backendJob -FrontendInfo $frontendInfo

# Step 7: Open browser if requested
if ($OpenBrowser) {
    Open-Browser -Port $frontendInfo.Port
}

Write-Host ""
Write-Status "🎯 Startup completed successfully!" "SUCCESS"
Write-Status "💡 Use 'Get-Job' to see running processes" "INFO"
Write-Status "💡 Use 'Stop-Job -Id <id>' to stop specific processes" "INFO"
Write-Status "💡 Use 'Remove-Job -Id <id>' to clean up stopped jobs" "INFO" 