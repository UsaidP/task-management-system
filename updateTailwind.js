const fs = require('fs');
let config = fs.readFileSync('/Volumes/E/Projects/task-management-system/frontend/tailwind.config.js', 'utf8');

// Replace Light Mode bg
config = config.replace(/primary: "#FAF6F1"/, 'primary: "#ffffff"');
config = config.replace(/secondary: "#F5EDE3"/, 'secondary: "#f8f9fa"');
config = config.replace(/tertiary: "#F0E6D6"/, 'tertiary: "#f1f4f8"');
config = config.replace(/hover: "#E8DED0"/, 'hover: "#e2e8f0"');

// Replace Light Mode text
config = config.replace(/primary: "#2C2420"/, 'primary: "#1a1a1a"');
config = config.replace(/secondary: "#4A3C30"/, 'secondary: "#4a5568"');
config = config.replace(/tertiary: "#6B5D52"/, 'tertiary: "#c1cad6"');
config = config.replace(/inverse: "#FAF6F1"/, 'inverse: "#ffffff"');

// Replace Light Mode border
config = config.replace(/DEFAULT: "#E0D5C7"/, 'DEFAULT: "#e2e8f0"');
config = config.replace(/strong: "#C9BAA8"/, 'strong: "#cbd5e0"');
config = config.replace(/focus: "#C4654A"/, 'focus: "#ff1053"');

// Replace Dark Mode bg
config = config.replace(/primary: "#1A1614"/, 'primary: "#0f1219"');
config = config.replace(/secondary: "#231F1C"/, 'secondary: "#131922"');
config = config.replace(/tertiary: "#2C2723"/, 'tertiary: "#1a2030"');
config = config.replace(/hover: "#363028"/, 'hover: "#222b3d"');

// Replace Dark Mode text
config = config.replace(/primary: "#F5EDE3"/, 'primary: "#f1f4f8"');
config = config.replace(/secondary: "#D4C8B8"/, 'secondary: "#d1d5db"');
config = config.replace(/tertiary: "#A89B8E"/, 'tertiary: "#8a93a6"');
config = config.replace(/inverse: "#1A1614"/, 'inverse: "#0f1219"');

// Replace Dark Mode border
config = config.replace(/DEFAULT: "#2C2723"/, 'DEFAULT: "#2a3140"');
config = config.replace(/strong: "#3D3530"/, 'strong: "#374151"');
config = config.replace(/focus: "#C4654A"/g, 'focus: "#ff3b71"');

// Replace Accent Colors
config = config.replace(/light: "#D4856A"/, 'light: "#ff6b8b"');
config = config.replace(/DEFAULT: "#C4654A"/, 'DEFAULT: "#ff1053"');
config = config.replace(/dark: "#A8503A"/, 'dark: "#ff3b71"');

config = config.replace(/light: "#F0D4CA"/, 'light: "#a3a5cc"');
config = config.replace(/DEFAULT: "#E8C4B8"/, 'DEFAULT: "#6c6ea0"');
config = config.replace(/dark: "#D4A898"/, 'dark: "#8588b5"');

config = config.replace(/light: "#88A8C0"/, 'light: "#99dcf7"');
config = config.replace(/DEFAULT: "#6888A0"/, 'DEFAULT: "#66c7f4"');
config = config.replace(/dark: "#4A6A82"/, 'dark: "#66c7f4"');

fs.writeFileSync('/Volumes/E/Projects/task-management-system/frontend/tailwind.config.js', config);
console.log('Updated tailwind.config.js');
