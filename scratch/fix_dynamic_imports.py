import os
import re

def fix_imports(directory, extra_dots):
    for root, _, files in os.walk(directory):
        for file in files:
            if not file.endswith('.tsx') and not file.endswith('.ts'):
                continue
            
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # fix dynamic imports: import('../something')
            def dynamic_replacer(match):
                prefix = match.group(1) # e.g. "import('"
                path = match.group(2) # e.g. "../lib/supabase"
                return f"{prefix}{extra_dots}{path}"
            
            new_content = re.sub(r"(import\(['\"])(../.+?['\"])\)", dynamic_replacer, content)
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)

fix_imports(r'd:\Website\Tracker\src\components\admin', '../')
print("Dynamic imports fixed.")
