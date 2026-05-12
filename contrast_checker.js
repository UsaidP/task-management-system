function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function luminance(r, g, b) {
  var a = [r, g, b].map(function (v) {
    v /= 255;
    return v <= 0.03928
      ? v / 12.92
      : Math.pow( (v + 0.055) / 1.055, 2.4 );
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function contrast(rgb1, rgb2) {
  var lum1 = luminance(rgb1.r, rgb1.g, rgb1.b);
  var lum2 = luminance(rgb2.r, rgb2.g, rgb2.b);
  var brightest = Math.max(lum1, lum2);
  var darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

const colors = {
  light: {
    bg: '#FFFCF7',
    bgAlt: '#FFF8EE',
    surface: '#FFFFFF',
    text: '#2E1A05',
    textMuted: '#7A6040',
    primary: '#f25d0d',
    white: '#ffffff'
  },
  dark: {
    bg: '#1A1209',
    bgAlt: '#221810',
    surface: '#2A1E14',
    text: '#FFF2E0',
    textMuted: '#9A7D5A',
    primary: '#f25d0d',
    white: '#ffffff'
  }
};

function check(mode, bgName, fgName, bgHex, fgHex) {
  const c = contrast(hexToRgb(bgHex), hexToRgb(fgHex)).toFixed(2);
  console.log(`${mode} - ${bgName}(${bgHex}) vs ${fgName}(${fgHex}): ${c}:1`);
  if (c < 4.5) console.log(`  => WARNING: Low contrast!`);
}

console.log("=== LIGHT MODE ===");
check('Light', 'bg', 'text', colors.light.bg, colors.light.text);
check('Light', 'bg', 'textMuted', colors.light.bg, colors.light.textMuted);
check('Light', 'bgAlt', 'textMuted', colors.light.bgAlt, colors.light.textMuted);
check('Light', 'primary', 'white', colors.light.primary, colors.light.white);

console.log("\n=== DARK MODE ===");
check('Dark', 'bg', 'text', colors.dark.bg, colors.dark.text);
check('Dark', 'bg', 'textMuted', colors.dark.bg, colors.dark.textMuted);
check('Dark', 'bgAlt', 'textMuted', colors.dark.bgAlt, colors.dark.textMuted);
check('Dark', 'surface', 'text', colors.dark.surface, colors.dark.text);
check('Dark', 'primary', 'white', colors.dark.primary, colors.dark.white);

