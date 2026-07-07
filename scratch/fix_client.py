import re
import os

def fix_file(filepath):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find supabase.from('...').select('*') and add .eq('store_type', 'online')
    # .select('*') -> .select('*').eq('store_type', 'online')
    
    # but only if it's not already there
    if ".select('*').eq('store_type', 'online')" not in content:
        content = content.replace(".select('*')", ".select('*').eq('store_type', 'online')")
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

fix_file(r'd:\Website\Tracker\src\pages\online\client\Home.tsx')
fix_file(r'd:\Website\Tracker\src\pages\online\client\Products.tsx')
print("Client endpoints fixed.")
