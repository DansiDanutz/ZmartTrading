@echo off
echo ========================================
echo    ZMARTTRADING VERSION SAVER
echo ========================================
echo.

if "%1"=="" (
    echo Usage: save_version.bat V3
    echo Example: save_version.bat V3
    echo.
    echo This will:
    echo 1. Update the Roadmap with a new milestone
    echo 2. Commit all changes to Git
    echo 3. Create and push a version tag
    echo.
    pause
    exit /b 1
)

echo 🚀 Saving Version %1...
echo.

python update_roadmap.py %1

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Version %1 saved successfully!
    echo 📊 Roadmap updated with new milestone
    echo 🏷️  Git tag v%1 created and pushed
) else (
    echo.
    echo ❌ Failed to save Version %1
)

echo.
pause 