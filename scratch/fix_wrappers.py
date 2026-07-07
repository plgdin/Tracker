import os
import re

def fix_wrappers(directory, type_str):
    for root, _, files in os.walk(directory):
        for file in files:
            if not file.endswith('.tsx'):
                continue
            
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            if "const setStoreType =" not in content or f"setStoreType('{type_str}')" not in content:
                continue
            
            if "if (storeType !==" in content:
                continue # already fixed

            # inject `const storeType = useAppStore((s: any) => s.storeType);`
            # right above `const setStoreType = useAppStore((s: any) => s.setStoreType);`
            content = content.replace(
                "const setStoreType = useAppStore((s: any) => s.setStoreType);",
                "const storeType = useAppStore((s: any) => s.storeType);\n  const setStoreType = useAppStore((s: any) => s.setStoreType);"
            )

            # inject `if (storeType !== 'type_str') return null;`
            # right above `return <`
            content = re.sub(
                r"(return\s+<[A-Za-z0-9_]+[^>]*/>;)",
                f"if (storeType !== '{type_str}') return null;\n\n  \\1",
                content
            )

            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)

fix_wrappers(r'd:\Website\Tracker\src\pages\online\admin', 'online')
fix_wrappers(r'd:\Website\Tracker\src\pages\offline', 'offline')
print("Wrappers fixed.")
