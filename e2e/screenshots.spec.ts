import { test } from '@playwright/test';

const PAGES = ['', 'pixtitch', 'blog'];

for (const path of PAGES) {
  test(`full page screenshot ${path || 'index'}`, async ({ page }, info) => {
    await page.goto(`/${path}`);
    await page.screenshot({ path: `e2e/__screenshots__/${info.project.name}-${path || 'index'}.png`, fullPage: true });
  });
}
