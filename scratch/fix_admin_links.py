import os
import re

def fix_links(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            if not file.endswith('.tsx'):
                continue
            
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            original = content
            
            # Replace navigate('/admin/X') -> navigate(`/admin${window.location.pathname.includes('online') ? 'online' : 'offline'}/X`)
            content = re.sub(
                r"navigate\('/admin/([^']+)'\)",
                r"navigate(`/admin${window.location.pathname.includes('online') ? 'online' : 'offline'}/\1`)",
                content
            )

            # Replace navigate(`/admin/X`) -> navigate(`/admin${window.location.pathname.includes('online') ? 'online' : 'offline'}/X`)
            content = re.sub(
                r"navigate\(`/admin/([^`]+)`\)",
                r"navigate(`/admin${window.location.pathname.includes('online') ? 'online' : 'offline'}/\1`)",
                content
            )

            # Replace to="/admin" in Link components
            content = re.sub(
                r'to="/admin"',
                r"to={window.location.pathname.includes('online') ? '/adminonline' : '/adminoffline'}",
                content
            )

            if original != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Fixed {file}")

fix_links(r'd:\Website\Tracker\src\components\admin')
print("Admin links fixed.")
