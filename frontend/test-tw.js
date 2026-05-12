import resolveConfig from 'tailwindcss/resolveConfig.js';
import twConfig from './tailwind.config.js';
const config = resolveConfig(twConfig);
console.log("Colors:", Object.keys(config.theme.colors.bg || {}));
