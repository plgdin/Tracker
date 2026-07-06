import os
import re

def fix_imports(directory, depth_change):
    # depth_change is how many extra '../' to add
    extra_dots = '../' * depth_change
    
    for root, _, files in os.walk(directory):
        for file in files:
            if not file.endswith('.tsx') and not file.endswith('.ts'):
                continue
            
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Replace import { X } from '../something' with import { X } from '../../something'
            # We match from '..' or "../"
            
            # This regex matches from '..' or "../" where it's exactly two dots
            # wait, it could be '../../' already? Let's just blindly add depth_change levels 
            # to any import that starts with '../' or '../../'
            
            def replacer(match):
                prefix = match.group(1) # e.g. "from '"
                path = match.group(2) # e.g. "../components/X"
                return f"{prefix}{extra_dots}{path}"
            
            new_content = re.sub(r"(from\s+['\"])(../.+?['\"])", replacer, content)
            new_content = re.sub(r"(import\s+['\"])(../.+?['\"])", replacer, new_content)
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)

# Admin components moved from src/pages to src/components/admin
# So they are 1 level deeper. '../' becomes '../../'
fix_imports(r'd:\Website\Tracker\src\components\admin', 1)

# Client pages moved from src/pages to src/pages/online/client
# So they are 2 levels deeper. '../' becomes '../../../'
fix_imports(r'd:\Website\Tracker\src\pages\online\client', 2)

print("Imports fixed.")
