#!/usr/bin/env pwsh
<#
.SYNOPSIS
    ZMARTTRADING AUTOMATED SHUTDOWN SCRIPT
.DESCRIPTION
    This script forcefully stops all ZmartTrading processes.
.EXAMPLE
    .\\stop_zmarttrading.ps1
#>
function Write-Status {
    param([string]$Message, [string]$Type = "INFO")
    $timestamp = Get-Date -Format "HH:mm:ss"
    $color = switch ($Type) {
        "SUCCESS" { "Green" }
        "ERROR"   { "Red" }
        "WARNING" { "Yellow" }
        default   { "Cyan" }
    }
    Write-Host "[$timestamp] $Message" -ForegroundColor $color
}
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "    ZMARTTRADING AUTOMATED SHUTDOWN" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Status " Killing Node.js processes (vite)..." "WARNING"
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    taskkill /F /IM node.exe /T | Out-Null
    Write-Status " All Node.js processes terminated." "SUCCESS"
} else {
    Write-Status "? No Node.js processes were found running."
}
Write-Status " Killing Python processes (flask)..." "WARNING"
$pythonProcesses = Get-Process -Name "python" -ErrorAction SilentlyContinue
if ($pythonProcesses) {
    taskkill /F /IM python.exe /T | Out-Null
    Write-Status " All Python processes terminated." "SUCCESS"
} else {
    Write-Status "? No Python processes were found running."
}
Write-Status " Cleaning up background jobs..." "WARNING"
$jobs = Get-Job -ErrorAction SilentlyContinue
if ($jobs) {
    Stop-Job -Job $jobs -ErrorAction SilentlyContinue
    Remove-Job -Job $jobs -ErrorAction SilentlyContinue
    Write-Status " All background jobs stopped and removed." "SUCCESS"
} else {
    Write-Status "? No background jobs found."
}
Write-Status " Verifying processes are stopped..."
Start-Sleep -Seconds 1
$nodeProcessesAfter = Get-Process -Name "node" -ErrorAction SilentlyContinue
$pythonProcessesAfter = Get-Process -Name "python" -ErrorAction SilentlyContinue
if (-not $nodeProcessesAfter -and -not $pythonProcessesAfter) {
    Write-Status " Shutdown successful! All processes are stopped." "SUCCESS"
} else {
    if ($nodeProcessesAfter) { Write-Status " Node.js processes are still running!" "ERROR" }
    if ($pythonProcessesAfter) { Write-Status " Python processes are still running!" "ERROR" }
}
Write-Host ""
Write-Status " System is ready for a clean start with '.\\start_zmarttrading.ps1'" "INFO"
