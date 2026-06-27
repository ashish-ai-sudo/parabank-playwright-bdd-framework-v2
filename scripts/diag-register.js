// Temporary diagnostic script — safe to delete
const { chromium } = require('@playwright/test');

(async () => {
  const br = await chromium.launch({ headless: true });
  const page = await br.newPage();
  await page.goto('https://parabank.parasoft.com/parabank/register.htm');

  const ts = Date.now();
  const username = 'tst' + ts;

  await page.fill('[id="customer.firstName"]', 'Test');
  await page.fill('[id="customer.lastName"]', 'User');
  await page.fill('[id="customer.address.street"]', '123 Elm St');
  await page.fill('[id="customer.address.city"]', 'Springfield');
  await page.fill('[id="customer.address.state"]', 'IL');
  await page.fill('[id="customer.address.zipCode"]', '62701');
  await page.fill('[id="customer.ssn"]', '123456789');
  await page.fill('[id="customer.username"]', username);
  await page.fill('[id="customer.password"]', 'PassTest1!');
  await page.fill('#repeatedPassword', 'PassTest1!');

  console.log('Username used:', username, '(length:', username.length, ')');
  console.log('Clicking Register...');

  await page.getByRole('button', { name: 'Register' }).click();
  await page.waitForLoadState('domcontentloaded');

  console.log('URL after submit:', page.url());
  console.log('Title after submit:', await page.title());

  const errors = await page.locator('.error').allTextContents();
  if (errors.length) console.log('Validation errors:', errors);

  const h1 = await page.locator('#rightPanel h1').textContent().catch(() => null);
  if (h1) console.log('H1:', h1);

  const bodyText = await page.locator('#rightPanel').textContent().catch(() => null);
  if (bodyText) console.log('rightPanel text:', bodyText.trim().substring(0, 300));

  await br.close();
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
