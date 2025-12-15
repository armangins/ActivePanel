#!/usr/bin/env python3
import re

file_path = 'src/components/Products/AddProductView/sub-components/ProductDetailsPanel/ProductDetailsPanel.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update bodyStyle - add flexDirection, change gap, add padding
content = re.sub(
    r"display: 'flex',\s+flexWrap: 'wrap',\s+gap: '24px'",
    "display: 'flex',\n        flexDirection: 'column',\n        flexWrap: 'wrap',\n        gap: '0px',\n        paddingLeft: '24px',\n        paddingRight: '24px'",
    content
)

# Update div.space-y-6 - add inline style
content = re.sub(
    r'<div className="space-y-6">',
    r'<div className="space-y-6" style={{ display: \'flex\', flexDirection: \'column\', gap: \'20px\' }}>',
    content
)

# Add id to SKU input
content = re.sub(
    r'(<Input\s+label=\{t\(\'sku\'\)\})',
    r'<Input\n              id="input-sku"\n              label={t(\'sku\')}',
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Changes applied successfully')
