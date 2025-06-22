#!/usr/bin/env pwsh
<#
.SYNOPSIS
    ZMARTTRADING VERSION SAVER
    
.DESCRIPTION
    Automatically saves a new version by updating the Roadmap and committing to Git
    
.PARAMETER Version
    The version number (e.g., V3, V4, V5)
    
.EXAMPLE
    .\save_version.ps1 V3
    
.EXAMPLE
    .\save_version.ps1 -Version V4
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$Version
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    ZMARTTRADING VERSION SAVER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Validate version format
if ($Version -notmatch '^V\d+$') {
    Write-Host "❌ Error: Version must be in format V3, V4, V5, etc." -ForegroundColor Red
    Write-Host "Example: .\save_version.ps1 V3" -ForegroundColor Yellow
    exit 1
}

Write-Host "🚀 Saving Version $Version..." -ForegroundColor Green
Write-Host ""

try {
    # Run the Python script
    python update_roadmap.py $Version
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Version $Version saved successfully!" -ForegroundColor Green
        Write-Host "📊 Roadmap updated with new milestone" -ForegroundColor Green
        Write-Host "🏷️  Git tag v$Version created and pushed" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Failed to save Version $Version" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error occurred: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 