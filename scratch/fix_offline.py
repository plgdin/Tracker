import os
import glob

files = glob.glob(r'd:\Website\Tracker\src\pages\offline\*.tsx')
for f in files:
    with open(f, 'r') as file:
        content = file.read()
    content = content.replace('../../../', '../../')
    # Also fix the type issue: useAppStore(s => s.setStoreType) -> useAppStore((s: any) => s.setStoreType)
    # Actually just add the import type or (s: any)
    content = content.replace('useAppStore(s =>', 'useAppStore((s: any) =>')
    with open(f, 'w') as file:
        file.write(content)

files_online = glob.glob(r'd:\Website\Tracker\src\pages\online\admin\*.tsx')
for f in files_online:
    with open(f, 'r') as file:
        content = file.read()
    content = content.replace('useAppStore(s =>', 'useAppStore((s: any) =>')
    with open(f, 'w') as file:
        file.write(content)

print("Fixed offline wrappers.")
