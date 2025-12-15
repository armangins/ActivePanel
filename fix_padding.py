#!/usr/bin/env python3
file_path = 'src/components/Products/AddProductView/sub-components/ProductDetailsPanel/ProductDetailsPanel.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace p-1.5 h-auto with just h-auto
content = content.replace('className={`p-1.5 h-auto ${', 'className={`h-auto ${')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Removed p-1.5 padding from icon button')
