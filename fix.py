import glob

for fp in glob.glob('src/**/*.html', recursive=True):
    with open(fp, 'r') as f:
        content = f.read()
    
    original_content = content
    
    # Fix the broken quote at the start
    content = content.replace(r'onerror=\"this.onerror=null;', r'onerror="this.onerror=null;')
    
    # Fix the broken quote at the end
    content = content.replace(r'random\'\"', r'random\'"')
    content = content.replace(r'fff\'\"', r'fff\'"')
    
    # This specifically addresses the broken line split in doctor/patients.component.html
    content = content.replace(r'onerror=\"this.onerror=null;', r'onerror="this.onerror=null;')
    
    if content != original_content:
        with open(fp, 'w') as f:
            f.write(content)
        print("Updated", fp)
