import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    bad_eq = r"\.eq\('store_type', useAppStore\.getState\(\)\.storeType\)"
    
    # 1. Fix .update
    # Match `.from('X')` \s* `bad_eq` \s* `.update(`
    # We want `.from('X')` \s* `.update(` ... then append `.eq(...)` after it.
    # Wait, the `update(updates)` might have varying arguments.
    # It's easier to just match:
    # \.from\('([^']+)'\)\s*\.eq\('store_type', useAppStore\.getState\(\)\.storeType\)\s*\.update\(([^)]*)\)
    # And replace with:
    # .from('\1').update(\2).eq('store_type', useAppStore.getState().storeType)
    
    pattern_update = r"(\.from\('[^']+'\))\s*" + bad_eq + r"\s*(\.update\([^)]*\))"
    content = re.sub(pattern_update, r"\1\2" + ".eq('store_type', useAppStore.getState().storeType)", content)
    
    # 2. Fix .delete
    pattern_delete = r"(\.from\('[^']+'\))\s*" + bad_eq + r"\s*(\.delete\(\))"
    content = re.sub(pattern_delete, r"\1\2" + ".eq('store_type', useAppStore.getState().storeType)", content)

    # 3. Fix .select (multiline)
    # \.from\('([^']+)'\)\s*\.eq\('store_type', useAppStore\.getState\(\)\.storeType\)\s*\.select\(([^)]*)\)
    pattern_select = r"(\.from\('[^']+'\))\s*" + bad_eq + r"\s*(\.select\([^)]*\))"
    content = re.sub(pattern_select, r"\1\2" + ".eq('store_type', useAppStore.getState().storeType)", content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

fix_file(r'd:\Website\Tracker\src\lib\db.ts')
fix_file(r'd:\Website\Tracker\src\lib\ledgerDb.ts')
print("Fixed multiline chains.")
