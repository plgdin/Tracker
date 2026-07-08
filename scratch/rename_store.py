import os
import glob

def replace_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return False

    new_content = content
    new_content = new_content.replace('Chef & Joy', 'Template Store')
    new_content = new_content.replace('CHEF & JOY', 'TEMPLATE STORE')
    new_content = new_content.replace('chef & joy', 'template store')
    new_content = new_content.replace('Chef and Joy', 'Template Store')
    new_content = new_content.replace('CHEFJOY', 'TEMPLATESTORE')
    new_content = new_content.replace('chefjoy', 'templatestore')

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")
        return True
    return False

def main():
    root_dir = 'd:/Website/Tracker'
    count = 0
    
    # Process src directory
    for root, dirs, files in os.walk(os.path.join(root_dir, 'src')):
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx', '.html', '.css')):
                if replace_in_file(os.path.join(root, file)):
                    count += 1
                    
    # Process root sql files
    for file in glob.glob(os.path.join(root_dir, '*.sql')):
        if replace_in_file(file):
            count += 1

    print(f"Replaced in {count} files.")

if __name__ == "__main__":
    main()
