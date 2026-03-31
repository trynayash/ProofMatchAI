import os
import re

svg_dir = r'C:\Users\LENOVO\Desktop\Documents\ProofMatchAI\frontend\ionicons.designerpack'
out_file = r'C:\Users\LENOVO\Desktop\Documents\ProofMatchAI\frontend\src\components\icons.jsx'

icon_mappings = {
    'AlertCircle': 'alert-circle-outline.svg',
    'RotateCcw': 'refresh-outline.svg',
    'Shield': 'shield-checkmark-outline.svg',
    'Eye': 'eye-outline.svg',
    'FileSearch': 'document-text-outline.svg',
    'FileCheck': 'checkmark-circle-outline.svg',
    'X': 'close-outline.svg',
    'Filter': 'filter-outline.svg',
    'Upload': 'cloud-upload-outline.svg',
    'Image': 'image-outline.svg',
    'CheckCircle2': 'checkmark-circle-outline.svg',
    'AlertTriangle': 'warning-outline.svg',
    'XCircle': 'close-circle-outline.svg',
    'Loader2': 'sync-outline.svg',
    'BarChart3': 'bar-chart-outline.svg',
    'Download': 'download-outline.svg',
    'FileJson': 'document-outline.svg',
    'ShieldAlert': 'shield-half-outline.svg',
    'Cpu': 'hardware-chip-outline.svg',
    'History': 'time-outline.svg',
    'LogOut': 'log-out-outline.svg',
    'Menu': 'menu-outline.svg',
    'Circle': 'ellipse-outline.svg',
    'Sparkles': 'sparkles-outline.svg',
    'ArrowRight': 'arrow-forward-outline.svg'
}

output_code = ['import React from \'react\';\n']

for icon_name, file_name in icon_mappings.items():
    file_path = os.path.join(svg_dir, file_name)
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            svg_content = f.read()
            
            # Extract inner HTML of svg
            match = re.search(r'<svg[^>]*>(.*?)</svg>', svg_content, re.DOTALL)
            if match:
                inner = match.group(1)
                
                # Replace snake-case attributes with camelCase
                # Do plain string replacements to avoid regex escaping issues
                inner = inner.replace('fill-rule=', 'fillRule=')
                inner = inner.replace('stroke-linecap=', 'strokeLinecap=')
                inner = inner.replace('stroke-linejoin=', 'strokeLinejoin=')
                inner = inner.replace('stroke-width=', 'strokeWidth=')
                inner = inner.replace('clip-rule=', 'clipRule=')
                inner = inner.replace('stroke-miterlimit=', 'strokeMiterlimit=')
                inner = inner.replace('class=', 'className=')
                
                # Strip color styling to use currentColor
                inner = inner.replace('stroke="#000"', 'stroke="currentColor"')
                inner = inner.replace('fill="#000"', 'fill="currentColor"')
                
                # Clean up existing literal escaped quotes caused by previous buggy script runs
                inner = inner.replace('\\"', '"')
                
                # Convert style="key:value;" into key="value"
                def repl_style(m):
                    style_str = m.group(1)
                    props = []
                    for decl in style_str.split(';'):
                        decl = decl.strip()
                        if not decl: continue
                        key, val = decl.split(':', 1)
                        # Camel case the key
                        parts = key.strip().split('-')
                        camel_key = parts[0] + ''.join(x.title() for x in parts[1:])
                        # enforce currentColor instead of hardcoded colors
                        if val.strip() == '#000':
                            val = 'currentColor'
                        props.append(f'{camel_key}="{val.strip()}"')
                    return ' '.join(props)
                
                inner = re.sub(r'style="([^"]*)"', repl_style, inner)
                
                icon_comp = f"""
export const {icon_name} = ({{ className, ...props }}) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 512 512" 
    className={{className}} 
    {{...props}}
  >
    {inner}
  </svg>
);
"""
                output_code.append(icon_comp)

with open(out_file, 'w', encoding='utf-8') as f:
    f.write('\n'.join(output_code))
print(f'Successfully generated {out_file} with {len(icon_mappings)} icons.')
