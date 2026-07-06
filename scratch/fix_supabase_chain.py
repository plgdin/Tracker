import re
import os

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # The bad pattern is: .eq('store_type', useAppStore.getState().storeType) directly after .from('table')
    # It looks like:
    # .from('items').eq('store_type', useAppStore.getState().storeType).select('*')
    # or
    # .from('items').eq('store_type', useAppStore.getState().storeType).insert(...)
    # or
    # .from('items').eq('store_type', useAppStore.getState().storeType).delete().eq(...)

    bad_eq = r"\.eq\('store_type', useAppStore\.getState\(\)\.storeType\)"

    # 1. Fix selects
    # .from('table').eq(...).select(args) -> .from('table').select(args).eq(...)
    # Note: select args might have parentheses, so we match carefully.
    content = re.sub(
        r"(\.from\('[^']+'\))" + bad_eq + r"(\.select\([^)]*\))",
        r"\1\2" + ".eq('store_type', useAppStore.getState().storeType)",
        content
    )

    # 2. Fix updates
    # .from('table').eq(...).update(args) -> .from('table').update(args).eq(...)
    content = re.sub(
        r"(\.from\('[^']+'\))" + bad_eq + r"(\.update\([^)]*\))",
        r"\1\2" + ".eq('store_type', useAppStore.getState().storeType)",
        content
    )

    # 3. Fix deletes
    # .from('table').eq(...).delete() -> .from('table').delete().eq(...)
    content = re.sub(
        r"(\.from\('[^']+'\))" + bad_eq + r"(\.delete\(\))",
        r"\1\2" + ".eq('store_type', useAppStore.getState().storeType)",
        content
    )

    # 4. Fix inserts
    # .from('table').eq(...).insert(args) -> .from('table').insert(args)
    # Since insert payload already has store_type from our previous script.
    content = re.sub(
        r"(\.from\('[^']+'\))" + bad_eq + r"(\.insert\()",
        r"\1\2",
        content
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

fix_file(r'd:\Website\Tracker\src\lib\db.ts')
fix_file(r'd:\Website\Tracker\src\lib\ledgerDb.ts')
print("Fixed supabase chains.")
