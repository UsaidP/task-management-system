const fs = require('fs');
let config = fs.readFileSync('/Volumes/E/Projects/task-management-system/frontend/tailwind.config.js', 'utf8');

// Replace Light Mode bg
config = config.replace(/primary: "#ffffff"/, 'primary: "#ffffff"');
config = config.replace(/secondary: "#f8f9fa"/, 'secondary: "#f8fafc"');
config = config.replace(/tertiary: "#f1f4f8"/, 'tertiary: "#f1f5f9"');
config = config.replace(/hover: "#e2e8f0"/, 'hover: "#e2e8f0"');

// Replace Light Mode text
config = config.replace(/primary: "#1a1a1a"/, 'primary: "#0f172a"');
config = config.replace(/secondary: "#4a5568"/, 'secondary: "#334155"');
config = config.replace(/tertiary: "#c1cad6"/, 'tertiary: "#64748b"');
config = config.replace(/inverse: "#ffffff"/, 'inverse: "#ffffff"');

// Replace Light Mode border
config = config.replace(/DEFAULT: "#e2e8f0"/, 'DEFAULT: "#e2e8f0"');
config = config.replace(/strong: "#cbd5e0"/, 'strong: "#cbd5e1"');
config = config.replace(/focus: "#ff1053"/, 'focus: "#4f46e5"');

// Replace Accent Colors (Light)
config = config.replace(/light: "#ff6b8b"/, 'light: "#818cf8"');
config = config.replace(/DEFAULT: "#ff1053"/, 'DEFAULT: "#4f46e5"');

config = config.replace(/light: "#a3a5cc"/, 'light: "#a78bfa"');
config = config.replace(/DEFAULT: "#6c6ea0"/, 'DEFAULT: "#8b5cf6"');

config = config.replace(/light: "#99dcf7"/, 'light: "#38bdf8"');
// Note: DEFAULT: "#66c7f4" is shared, but let's change just the light ones if possible?
// Actually in tailwind.config.js, `accent` colors don't have separate light/dark objects, they just have light/DEFAULT/dark.
// So if I change DEFAULT to indigo, it affects dark mode too.
// Wait, Tailwind config in this project separates by light/dark nesting? Let me check the structure.
