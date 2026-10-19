import { expect, test } from '@playwright/test';

const html = (page: import('@playwright/test').Page) => page.locator('html');

test('follows the OS color scheme until the user chooses', async ({ page, colorScheme }) => {
  await page.goto('/');
  await expect(html(page)).toHaveAttribute('data-theme', colorScheme === 'dark' ? 'dark' : 'light');
});

test('toggle flips the theme and persists the choice across reloads', async ({ page }) => {
  await page.goto('/');
  const before = await html(page).getAttribute('data-theme');
  await page.getByRole('button', { name: /^Theme:/ }).click();
  const after = before === 'dark' ? 'light' : 'dark';
  await expect(html(page)).toHaveAttribute('data-theme', after);
  await expect(page.getByRole('button', { name: `Theme: ${after}` })).toBeVisible();
  await page.reload();
  await expect(html(page)).toHaveAttribute('data-theme', after);
});

test('toggle shows exactly one icon', async ({ page }) => {
  await page.goto('/');
  const icons = page.locator('[data-theme-toggle] svg:visible');
  await expect(icons).toHaveCount(1);
});

test.describe('site themes', () => {
  for (const site of ['pixtitch', 'blog']) {
    test(`${site} page sets data-site and recolors the background`, async ({ page }) => {
      await page.goto('/');
      const base = await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);
      await page.goto(`/${site}`);
      await expect(html(page)).toHaveAttribute('data-site', site);
      const themed = await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);
      expect(themed).not.toBe(base);
    });
  }

  test('index page has no data-site', async ({ page }) => {
    await page.goto('/');
    await expect(html(page)).not.toHaveAttribute('data-site');
  });
});

test('footer links the four sites and marks the current one', async ({ page }) => {
  await page.goto('/pixtitch');
  const nav = page.getByRole('navigation', { name: 'tanoshikunarukoto sites' });
  await expect(nav.getByRole('link')).toHaveCount(4);
  await expect(nav.getByRole('link', { name: 'pixtitch' })).toHaveAttribute('aria-current', 'page');
  await expect(nav.getByRole('link', { name: 'blog' })).toHaveAttribute('href', 'https://blog.tanoshikunarukoto.org');
});

test('accent swatches all render distinct colors', async ({ page }) => {
  await page.goto('/');
  const colors = await page.locator('[data-testid=accents] li').evaluateAll((items) =>
    items.map((item) => getComputedStyle(item).borderTopColor),
  );
  expect(new Set(colors).size).toBe(5);
});
