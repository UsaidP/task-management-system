import re

with open('/Volumes/Secondry/coDesign/App.jsx', 'r') as f:
    code = f.read()

# Replace colors with CSS variables (leaving quotes intact where they exist)
replacements = [
    (r'#0f1219', 'var(--bg)'),
    (r'#131922', 'var(--bgAlt)'),
    (r'#2a3140', 'var(--neutral)'),
    (r'#1a2030', 'var(--surface)'),
    (r'#222b3d', 'var(--surfaceHi)'),
    (r'#f1f4f8', 'var(--text)'),
    (r'#8a93a6', 'var(--textMuted)'),
    (r'#ff3b71', 'var(--primary)'),
    (r'#8588b5', 'var(--secondary)'),
    (r'#66c7f4', 'var(--accent)'),
    (r'#151c28', 'var(--cardGrad2)'),
    (r'#1e2738', 'var(--cardGrad1)'),
    (r'#1f2839', 'var(--cardGrad4)'),
    (r'#263045', 'var(--cardGrad3)'),
    (r'rgba\(255,59,113,', 'rgba(var(--primary-rgb),'),
    (r'rgba\(102,199,244,', 'rgba(var(--accent-rgb),'),
    (r'rgba\(133,136,181,', 'rgba(var(--secondary-rgb),'),
    (r'rgba\(255,255,255,0\.06\)', 'var(--border-light)'),
    (r'rgba\(255,255,255,0\.05\)', 'var(--border-light)'),
    (r'rgba\(255,255,255,0\.04\)', 'var(--border-light)'),
    (r'rgba\(255,255,255,0\.08\)', 'var(--border-med)'),
    (r'rgba\(255,255,255,0\.1\)', 'var(--border-med)'),
    (r'rgba\(255,255,255,0\.12\)', 'var(--border-heavy)'),
    (r'rgba\(255,255,255,0\.15\)', 'var(--border-heavy)'),
    (r'rgba\(255,255,255,0\.2\)', 'var(--border-heavy)'),
]

for old, new in replacements:
    code = re.sub(old, new, code)

# Fix issue where "var(--bg)" is wrapped in extra quotes due to the tweak default? No, the original was "#ff3b71" which becomes "var(--primary)" which is correct string.

# Replace ReactDOM render with export default
code = code.replace('ReactDOM.createRoot(document.getElementById("root")).render(<App />);', 'export default App;')

# Add CSS variables to globalCSS
css_vars = """
:root {
  --bg: #ffffff;
  --bgAlt: #f8f9fa;
  --neutral: #c1cad6;
  --surface: #ffffff;
  --surfaceHi: #f1f4f8;
  --text: #1a1a1a;
  --textMuted: #6c6ea0;
  --primary: #ff1053;
  --secondary: #6c6ea0;
  --accent: #66c7f4;
  --radius: 14px;
  
  --primary-rgb: 255, 16, 83;
  --secondary-rgb: 108, 110, 160;
  --accent-rgb: 102, 199, 244;
  
  --border-light: rgba(0,0,0,0.06);
  --border-med: rgba(0,0,0,0.1);
  --border-heavy: rgba(0,0,0,0.15);
  
  --cardGrad1: #f8f9fa;
  --cardGrad2: #e9ecef;
  --cardGrad3: #ffffff;
  --cardGrad4: #f8f9fa;
}

.dark {
  --bg: #0f1219;
  --bgAlt: #131922;
  --neutral: #2a3140;
  --surface: #1a2030;
  --surfaceHi: #222b3d;
  --text: #f1f4f8;
  --textMuted: #8a93a6;
  --primary: #ff3b71;
  --secondary: #8588b5;
  --accent: #66c7f4;
  --radius: 14px;

  --primary-rgb: 255, 59, 113;
  --secondary-rgb: 133, 136, 181;
  --accent-rgb: 102, 199, 244;
  
  --border-light: rgba(255,255,255,0.06);
  --border-med: rgba(255,255,255,0.1);
  --border-heavy: rgba(255,255,255,0.15);
  
  --cardGrad1: #1e2738;
  --cardGrad2: #151c28;
  --cardGrad3: #263045;
  --cardGrad4: #1f2839;
}
"""

code = code.replace('const globalCSS = [', 'const globalCSS = `\\n' + css_vars + '\\n` + [')

# Inject ThemeToggle into Nav
nav_replacement = """
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          <ThemeToggle />
"""
code = code.replace('<div style={{ display: "flex", gap: 32, alignItems: "center" }}>', nav_replacement)

# Add imports
imports = """import React, { useState, useEffect } from 'react';
import ThemeToggle from '../theme/ThemeToggle';
"""

final_code = imports + "\n" + code

with open('/Volumes/E/Projects/task-management-system/frontend/src/pages/HomeMasterpiece.jsx', 'w') as f:
    f.write(final_code)
