#!/usr/bin/env python3
"""
Automation script to update Roadmap component with new milestone entries
Usage: python update_roadmap.py V3
"""

import os
import sys
import re
from datetime import datetime
import subprocess

def get_current_date():
    """Get current date in the format used in the Roadmap"""
    return datetime.now().strftime("%Y-%m-%d")

def get_git_changes():
    """Get list of changes since last commit for the milestone description"""
    try:
        # Get the last commit hash
        last_commit = subprocess.run(
            ["git", "rev-parse", "HEAD"], 
            capture_output=True, text=True
        ).stdout.strip()
        
        # Get changes since last commit
        changes = subprocess.run(
            ["git", "diff", "--name-only", last_commit], 
            capture_output=True, text=True
        ).stdout.strip()
        
        if changes:
            files = [f.strip() for f in changes.split('\n') if f.strip()]
            return files
        else:
            return []
    except Exception as e:
        print(f"Warning: Could not get Git changes: {e}")
        return []

def generate_milestone_description(version, changes):
    """Generate a description for the milestone based on changes"""
    if not changes:
        return f"Version {version} - General improvements and bug fixes"
    
    # Categorize changes
    categories = {
        'frontend': [],
        'backend': [],
        'docs': [],
        'config': []
    }
    
    for file in changes:
        if file.startswith('src/'):
            categories['frontend'].append(file)
        elif file.startswith('backend/'):
            categories['backend'].append(file)
        elif file.endswith('.md') or file.endswith('.txt'):
            categories['docs'].append(file)
        else:
            categories['config'].append(file)
    
    # Build description
    description_parts = [f"Version {version} - "]
    
    if categories['frontend']:
        description_parts.append("Frontend improvements")
    if categories['backend']:
        description_parts.append("Backend enhancements")
    if categories['docs']:
        description_parts.append("Documentation updates")
    if categories['config']:
        description_parts.append("Configuration changes")
    
    return " & ".join(description_parts)

def update_roadmap_component(version, description):
    """Update the Roadmap component with new version card"""
    roadmap_file = "src/components/Roadmap.jsx"
    
    if not os.path.exists(roadmap_file):
        print(f"Error: {roadmap_file} not found!")
        return False
    
    # Read current content
    with open(roadmap_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the achievements array in roadmapData
    achievements_pattern = r'achievements: \[(.*?)\]'
    match = re.search(achievements_pattern, content, re.DOTALL)
    
    if not match:
        print("Error: Could not find achievements array in Roadmap component")
        return False
    
    current_achievements = match.group(1)
    
    # Create new version achievement entry
    new_achievement = f'            "✅ Version {version} - {description}"'
    
    # Insert new achievement at the beginning (after the opening bracket)
    updated_achievements = current_achievements.strip()
    if updated_achievements:
        updated_achievements = new_achievement + ",\n" + updated_achievements
    else:
        updated_achievements = new_achievement
    
    # Replace the achievements array
    new_content = re.sub(
        achievements_pattern,
        f'achievements: [{updated_achievements}]',
        content,
        flags=re.DOTALL
    )
    
    # Update the date
    current_date = get_current_date()
    date_pattern = r'date: \'[^\']*\''
    new_content = re.sub(
        date_pattern,
        f"date: '{current_date}'",
        new_content
    )
    
    # Write updated content
    with open(roadmap_file, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"✅ Successfully added Version {version} card to Roadmap")
    return True

def commit_to_git(version, description):
    """Commit changes to Git with version tag"""
    try:
        # Add all changes
        subprocess.run(["git", "add", "."], check=True)
        
        # Commit with version message
        commit_message = f"Version {version}: {description}"
        subprocess.run(["git", "commit", "-m", commit_message], check=True)
        
        # Create and push tag
        subprocess.run(["git", "tag", f"v{version}"], check=True)
        subprocess.run(["git", "push", "origin", "main"], check=True)
        subprocess.run(["git", "push", "origin", f"v{version}"], check=True)
        
        print(f"✅ Successfully committed and tagged Version {version}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Git operation failed: {e}")
        return False

def main():
    if len(sys.argv) != 2:
        print("Usage: python update_roadmap.py V3")
        print("Example: python update_roadmap.py V3")
        sys.exit(1)
    
    version = sys.argv[1].upper()
    
    # Validate version format
    if not re.match(r'^V\d+$', version):
        print("Error: Version must be in format V3, V4, V5, etc.")
        sys.exit(1)
    
    print("========================================")
    print("    ZMARTTRADING VERSION SAVER")
    print("========================================")
    print(f"🚀 Saving Version {version}...")
    
    # Get changes for description
    changes = get_git_changes()
    description = generate_milestone_description(version, changes)
    
    print(f"📝 Generated description: {description}")
    
    # Update Roadmap component
    if update_roadmap_component(version, description):
        print("📋 Roadmap updated successfully")
    else:
        print("❌ Failed to update Roadmap")
        sys.exit(1)
    
    # Commit to Git
    if commit_to_git(version, description):
        print(f"🎉 Version {version} successfully released!")
        print(f"📊 Roadmap updated with new version card")
        print(f"🏷️  Git tag v{version} created and pushed")
    else:
        print("❌ Failed to commit to Git")
        sys.exit(1)

if __name__ == "__main__":
    main() 