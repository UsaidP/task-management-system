const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Navigating to http://localhost:5173');
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  } catch(e) {
    console.error("Failed to navigate:", e.message);
    await browser.close();
    process.exit(1);
  }
  
  // Try to toggle theme via JavaScript
  console.log('Toggling theme to Dark Mode');
  // First, let's see if there's a button we can click via JS, or just add the class
  await page.evaluate(() => {
    // Attempt 1: click ThemeToggle
    const buttons = Array.from(document.querySelectorAll('button'));
    const themeBtn = buttons.find(b => b.textContent.includes('🌙') || b.textContent.includes('☀️') || b.innerHTML.includes('theme') || b.innerHTML.includes('moon') || b.innerHTML.includes('sun'));
    if (themeBtn) {
      themeBtn.click();
    } else {
      // Fallback: manually set it
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      // trigger event if needed
      window.dispatchEvent(new Event('storage'));
    }
  });

  // Wait a bit for transition
  await page.waitForTimeout(1000);
  
  // Ensure we are in dark mode (if the app uses 'dark' class on HTML)
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await page.waitForTimeout(500);

  // Capture screenshot of the top of the page
  console.log('Capturing top of page screenshot...');
  const topPath = '/Users/usaidpatel/.gemini/antigravity/brain/62afb9ee-7d70-4cb9-b7d7-99a9c6d5e441/artifacts/dark_mode_top.png';
  await page.screenshot({ path: topPath });
  
  // Scroll down 1000px
  console.log('Scrolling down 1000px...');
  await page.evaluate(() => window.scrollBy(0, 1000));
  await page.waitForTimeout(1000);
  
  // Capture screenshot after scroll
  console.log('Capturing scrolled page screenshot...');
  const scrollPath = '/Users/usaidpatel/.gemini/antigravity/brain/62afb9ee-7d70-4cb9-b7d7-99a9c6d5e441/artifacts/dark_mode_scrolled.png';
  await page.screenshot({ path: scrollPath });
  
  console.log('Done!');
  await browser.close();
})();
