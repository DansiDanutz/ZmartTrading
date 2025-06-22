# ZMARTTRADING VERSION AUTOMATION

This automation system automatically updates the Roadmap component and commits changes to Git whenever you save a new version.

## 🚀 Quick Start

### Method 1: PowerShell (Recommended)
```powershell
.\save_version.ps1 V3
```

### Method 2: Batch File
```cmd
save_version.bat V3
```

### Method 3: Python Direct
```bash
python update_roadmap.py V3
```

## 📋 What It Does

When you run the automation for a new version (e.g., V3), it will:

1. **📊 Update Roadmap Component**
   - Add a new milestone entry with current date
   - Generate description based on file changes
   - Insert the milestone at the top of the timeline

2. **🏷️ Git Operations**
   - Add all changes to staging
   - Commit with version message
   - Create version tag (v3, v4, etc.)
   - Push to remote repository

3. **📝 Smart Description Generation**
   - Analyzes changed files since last commit
   - Categorizes changes (Frontend, Backend, Docs, Config)
   - Creates meaningful milestone descriptions

## 📁 Files Created

- `update_roadmap.py` - Main Python automation script
- `save_version.bat` - Windows batch file wrapper
- `save_version.ps1` - PowerShell wrapper (recommended)
- `VERSION_AUTOMATION_README.md` - This documentation

## 🔧 How It Works

### 1. Version Validation
- Ensures version format is correct (V3, V4, V5, etc.)
- Prevents duplicate or invalid version numbers

### 2. Change Analysis
- Scans Git diff since last commit
- Categorizes files by type:
  - `src/` → Frontend improvements
  - `backend/` → Backend enhancements  
  - `.md/.txt` → Documentation updates
  - Others → Configuration changes

### 3. Roadmap Update
- Reads current `src/components/Roadmap.jsx`
- Finds the milestones array
- Inserts new milestone at the beginning
- Maintains proper formatting and structure

### 4. Git Operations
- Stages all changes
- Commits with descriptive message
- Creates and pushes version tag
- Pushes to main branch

## 📊 Example Output

```
========================================
    ZMARTTRADING VERSION SAVER
========================================

🚀 Saving Version V3...

📝 Generated description: Version V3 - Frontend improvements & Backend enhancements
✅ Successfully added Version V3 milestone to Roadmap
📋 Roadmap updated successfully
✅ Successfully committed and tagged Version V3
🎉 Version V3 successfully released!
📊 Roadmap updated with new milestone
🏷️  Git tag v3 created and pushed
```

## 🎯 Usage Examples

### Save Version 3
```powershell
.\save_version.ps1 V3
```

### Save Version 4
```powershell
.\save_version.ps1 V4
```

### Save Version 10
```powershell
.\save_version.ps1 V10
```

## ⚠️ Requirements

- Python 3.6+
- Git configured with remote repository
- PowerShell (for .ps1 script) or Command Prompt (for .bat script)

## 🔍 Generated Milestone Structure

Each new milestone will have this structure:

```javascript
{
    id: 3,
    date: "12/20/2025",
    title: "Version V3",
    description: "Version V3 - Frontend improvements & Backend enhancements",
    status: "completed",
    achievements: [
        "Enhanced system functionality",
        "Improved user experience", 
        "Bug fixes and optimizations"
    ]
}
```

## 🛠️ Troubleshooting

### Error: "Could not find milestones array"
- Ensure `src/components/Roadmap.jsx` exists
- Check that the milestones array is properly formatted

### Error: "Git operation failed"
- Ensure you have Git configured
- Check that you have write access to the repository
- Verify remote repository is set up

### Error: "Version must be in format V3, V4, V5"
- Use correct format: V3, V4, V5, etc.
- Don't use lowercase or different formats

## 📈 Benefits

1. **🔄 Automated Workflow** - No manual steps required
2. **📊 Consistent Documentation** - Roadmap always up-to-date
3. **🏷️ Proper Versioning** - Git tags for easy rollback
4. **📝 Smart Descriptions** - Context-aware milestone descriptions
5. **⚡ Quick Execution** - Single command for complete version save

## 🎉 Ready to Use!

Now whenever you want to save a new version, just run:

```powershell
.\save_version.ps1 V3
```

And everything will be automatically updated and committed! 🚀 