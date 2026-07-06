import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    bad_eq = r"\.eq\('store_type', useAppStore\.getState\(\)\.storeType\)"
    
    # Match `.from('X')` optionally followed by whitespace/newlines, then `bad_eq`, then whitespace/newlines, then `.insert`
    pattern = r"(\.from\('[^']+'\))\s*" + bad_eq + r"\s*(\.insert\()"
    
    content = re.sub(pattern, r"\1\2", content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

fix_file(r'd:\Website\Tracker\src\lib\db.ts')
fix_file(r'd:\Website\Tracker\src\lib\ledgerDb.ts')
print("Fixed multiline inserts.")
