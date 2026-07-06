import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Add import
    if 'useAppStore' not in content:
        content = content.replace("import { useAuthStore }", "import { useAuthStore } from '../store/authStore';\nimport { useAppStore } from '../store/appStore';")
        content = content.replace("import { dbSupabase, getUseSupabase, withTimeout } from './db';", "import { dbSupabase, getUseSupabase, withTimeout } from './db';\nimport { useAppStore } from '../store/appStore';")

    # Replace local storage keys dynamically
    # Example: 'tracker_items' -> `tracker_items_${useAppStore.getState().storeType}`
    keys = [
        'tracker_items', 'tracker_categories', 'tracker_shopping_list', 'tracker_audit_logs', 'tracker_settings',
        'ledger_purchases', 'ledger_sales', 'ledger_customers', 'ledger_payments', 'ledger_inventory', 'ledger_brand_names'
    ]
    for key in keys:
        content = re.sub(rf"'{key}'", f"`{key}_${{useAppStore.getState().storeType}}`", content)

    # Supabase queries:
    # We need to append `.eq('store_type', useAppStore.getState().storeType)` to all selects, updates, deletes.
    # And we need to add `store_type: useAppStore.getState().storeType` to all inserts.
    
    # 1. Update inserts
    # `.insert([{ ...item, user_id: userData?.user?.id }])` -> `.insert([{ ...item, user_id: userData?.user?.id, store_type: useAppStore.getState().storeType }])`
    content = re.sub(
        r'\.insert\(\[\{(.*?)\}\]\)',
        r'.insert([{\1, store_type: useAppStore.getState().storeType}])',
        content
    )
    
    # Handle direct object inserts in ledgerDb like .insert([invoiceData]) -> .insert([{ ...invoiceData, store_type: useAppStore.getState().storeType }])
    content = re.sub(
        r'\.insert\(\[([a-zA-Z0-9_]+)\]\)',
        r'.insert([{ ...\1, store_type: useAppStore.getState().storeType }])',
        content
    )
    
    # 2. Update selects, updates, deletes
    # Find .from('table').select(...) or .update(...) or .delete()
    # We want to add `.eq('store_type', useAppStore.getState().storeType)` before any `.order`, `.eq`, `.ilike`, etc.
    # We can just inject it right after `.from('X')` -> `.from('X').eq('store_type', useAppStore.getState().storeType)`
    
    def replace_from(match):
        table_name = match.group(1)
        if table_name == 'profiles':
            return match.group(0) # don't touch profiles
        return f".from('{table_name}').eq('store_type', useAppStore.getState().storeType)"

    content = re.sub(r"\.from\('([^']+)'\)", replace_from, content)

    with open(filepath, 'w') as f:
        f.write(content)

process_file(r'd:\Website\Tracker\src\lib\db.ts')
process_file(r'd:\Website\Tracker\src\lib\ledgerDb.ts')
print("Done")
