// Login-specific diagnostic (fresh context, no prior session)
const { chromium } = require('@playwright/test');

(async () => {
  const br = await chromium.launch({ headless: true });

  // ── 1. Empty credentials ───────────────────────────────────────────────
  {
    const page = await br.newPage();
    console.log('\n━━━ LOGIN - EMPTY CREDENTIALS ━━━');
    await page.goto('https://parabank.parasoft.com/parabank/index.htm');
    await page.waitForLoadState('domcontentloaded');
    console.log('Login page title:', await page.title());
    // Find the button
    const btn = page.locator('#loginPanel input[type="submit"], #loginPanel button');
    console.log('Login button count:', await btn.count());
    const btnText = await btn.first().getAttribute('value').catch(() => null) || await btn.first().textContent().catch(() => null);
    console.log('Button text/value:', btnText);
    await btn.first().click();
    await page.waitForLoadState('domcontentloaded');
    console.log('URL after empty submit:', page.url());
    console.log('Title:', await page.title());
    const errors = await page.locator('.error').allTextContents();
    console.log('Errors:', errors);
    const rightPanel = await page.locator('#rightPanel').textContent().catch(() => null);
    console.log('rightPanel:', rightPanel?.trim().substring(0, 200));
    await page.close();
  }

  // ── 2. Invalid credentials ────────────────────────────────────────────
  {
    const page = await br.newPage();
    console.log('\n━━━ LOGIN - INVALID CREDENTIALS ━━━');
    await page.goto('https://parabank.parasoft.com/parabank/index.htm');
    await page.fill('#loginPanel input[name="username"]', 'baduser999xyz');
    await page.fill('#loginPanel input[name="password"]', 'badpassword');
    await page.locator('#loginPanel input[type="submit"], #loginPanel button').first().click();
    await page.waitForLoadState('domcontentloaded');
    console.log('URL:', page.url());
    console.log('Title:', await page.title());
    const errors = await page.locator('.error').allTextContents();
    console.log('Errors:', errors);
    const rightPanel = await page.locator('#rightPanel').textContent().catch(() => null);
    console.log('rightPanel:', rightPanel?.trim().substring(0, 300));
    await page.close();
  }

  // ── 3. Successful login + logout ──────────────────────────────────────
  {
    const page = await br.newPage();
    console.log('\n━━━ LOGIN SUCCESS + LOGOUT ━━━');
    // First register a fresh user
    const ts = Date.now();
    const un = `lg${ts.toString(36)}`;
    await page.goto('https://parabank.parasoft.com/parabank/register.htm');
    await page.fill('[id="customer.firstName"]', 'Test');
    await page.fill('[id="customer.lastName"]', 'User');
    await page.fill('[id="customer.address.street"]', '123 Elm');
    await page.fill('[id="customer.address.city"]', 'Springfield');
    await page.fill('[id="customer.address.state"]', 'IL');
    await page.fill('[id="customer.address.zipCode"]', '62701');
    await page.fill('[id="customer.ssn"]', '123456789');
    await page.fill('[id="customer.username"]', un);
    await page.fill('[id="customer.password"]', 'Test1234!');
    await page.fill('#repeatedPassword', 'Test1234!');
    await page.getByRole('button', { name: 'Register' }).click();
    await page.waitForLoadState('domcontentloaded');
    console.log('Registered:', await page.title(), '- user:', un);

    // Now logout
    const logoutLinks = await page.locator('a').filter({ hasText: 'Log Out' }).count();
    console.log('Log Out links count:', logoutLinks);
    const logoutHref = await page.locator('a').filter({ hasText: 'Log Out' }).first().getAttribute('href').catch(() => null);
    console.log('Logout href:', logoutHref);
    await page.locator('a').filter({ hasText: 'Log Out' }).first().click();
    await page.waitForLoadState('domcontentloaded');
    console.log('After logout URL:', page.url());
    console.log('After logout title:', await page.title());

    // Now try protected page
    console.log('\n━━━ PROTECTED PAGE AFTER LOGOUT ━━━');
    await page.goto('https://parabank.parasoft.com/parabank/overview.htm');
    await page.waitForLoadState('domcontentloaded');
    console.log('Protected URL:', page.url());
    console.log('Protected title:', await page.title());
    const rp = await page.locator('#rightPanel').textContent().catch(() => null);
    console.log('rightPanel:', rp?.trim().substring(0, 300));
    const loginPanelVisible = await page.locator('#loginPanel').isVisible().catch(() => false);
    console.log('Login panel visible:', loginPanelVisible);

    // Now re-login
    console.log('\n━━━ RE-LOGIN AFTER LOGOUT ━━━');
    await page.goto('https://parabank.parasoft.com/parabank/index.htm');
    await page.fill('#loginPanel input[name="username"]', un);
    await page.fill('#loginPanel input[name="password"]', 'Test1234!');
    await page.locator('#loginPanel input[type="submit"], #loginPanel button').first().click();
    await page.waitForLoadState('domcontentloaded');
    console.log('Re-login URL:', page.url());
    console.log('Re-login title:', await page.title());
    const acctSvc = await page.getByRole('heading', { name: 'Account Services' }).isVisible().catch(() => false);
    console.log('Account Services visible:', acctSvc);

    await page.close();
  }

  await br.close();
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
