// Diagnostic script — safe to delete after use
const { chromium } = require('@playwright/test');

(async () => {
  const br = await chromium.launch({ headless: true });
  const ctx = await br.newContext();
  const page = await ctx.newPage();

  // ── 1. Registration: validation errors ─────────────────────────────────
  console.log('\n━━━ REGISTRATION VALIDATION ━━━');
  await page.goto('https://parabank.parasoft.com/parabank/register.htm');
  await page.getByRole('button', { name: 'Register' }).click();
  await page.waitForLoadState('domcontentloaded');
  console.log('URL after empty submit:', page.url());
  console.log('Title:', await page.title());

  // Find all error elements
  const errEls = await page.locator('.error').allTextContents();
  console.log('All .error texts:', errEls);

  // Try specific field errors
  const fnErr = await page.locator('[id="customer.firstName"] + span.error').textContent().catch(() => null);
  console.log('firstName sibling span.error:', fnErr);

  // Check the structure around first name
  const fnHtml = await page.locator('[id="customer.firstName"]').evaluate(el => el.parentElement?.innerHTML).catch(() => null);
  console.log('firstName parent HTML (first 400):', fnHtml?.substring(0, 400));

  // ── 2. Registration: duplicate username error ───────────────────────────
  console.log('\n━━━ REGISTRATION DUPLICATE USERNAME ━━━');
  const ts = Date.now();
  const un = `dup${ts.toString(36)}`;
  // First registration
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
  console.log('First reg title:', await page.title());

  // Second registration with same username
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
  console.log('Dup reg URL:', page.url());
  console.log('Dup reg title:', await page.title());
  const dupErrs = await page.locator('.error').allTextContents();
  console.log('Dup reg errors:', dupErrs);

  // ── 3. Registration: password mismatch ─────────────────────────────────
  console.log('\n━━━ REGISTRATION PASSWORD MISMATCH ━━━');
  await page.goto('https://parabank.parasoft.com/parabank/register.htm');
  await page.fill('[id="customer.firstName"]', 'Test');
  await page.fill('[id="customer.lastName"]', 'User');
  await page.fill('[id="customer.address.street"]', '123 Elm');
  await page.fill('[id="customer.address.city"]', 'Springfield');
  await page.fill('[id="customer.address.state"]', 'IL');
  await page.fill('[id="customer.address.zipCode"]', '62701');
  await page.fill('[id="customer.ssn"]', '123456789');
  await page.fill('[id="customer.username"]', `pw${ts.toString(36)}`);
  await page.fill('[id="customer.password"]', 'Password123');
  await page.fill('#repeatedPassword', 'WrongPass99');
  await page.getByRole('button', { name: 'Register' }).click();
  await page.waitForLoadState('domcontentloaded');
  const pwErrs = await page.locator('.error').allTextContents();
  console.log('Password mismatch errors:', pwErrs);

  // ── 4. Login: empty credentials ─────────────────────────────────────────
  console.log('\n━━━ LOGIN - EMPTY CREDENTIALS ━━━');
  await page.goto('https://parabank.parasoft.com/parabank/index.htm');
  await page.getByRole('button', { name: 'Log In' }).click();
  await page.waitForLoadState('domcontentloaded');
  console.log('URL:', page.url());
  console.log('Title:', await page.title());
  const loginErrEmpty = await page.locator('.error').allTextContents();
  console.log('Errors:', loginErrEmpty);

  // ── 5. Login: invalid credentials ───────────────────────────────────────
  console.log('\n━━━ LOGIN - INVALID CREDENTIALS ━━━');
  await page.goto('https://parabank.parasoft.com/parabank/index.htm');
  await page.fill('#loginPanel input[name="username"]', 'baduser999');
  await page.fill('#loginPanel input[name="password"]', 'badpass');
  await page.getByRole('button', { name: 'Log In' }).click();
  await page.waitForLoadState('domcontentloaded');
  console.log('URL:', page.url());
  console.log('Title:', await page.title());
  const loginErrInvalid = await page.locator('.error').allTextContents();
  console.log('Errors:', loginErrInvalid);
  // Try other selectors
  const mainPanelText = await page.locator('#rightPanel').textContent().catch(() => null);
  console.log('rightPanel text:', mainPanelText?.trim().substring(0, 200));

  // ── 6. Login: success + logout ───────────────────────────────────────────
  console.log('\n━━━ LOGIN SUCCESS + LOGOUT ━━━');
  // Use the username we just registered
  await page.goto('https://parabank.parasoft.com/parabank/index.htm');
  await page.fill('#loginPanel input[name="username"]', un);
  await page.fill('#loginPanel input[name="password"]', 'Test1234!');
  await page.getByRole('button', { name: 'Log In' }).click();
  await page.waitForLoadState('domcontentloaded');
  console.log('After login URL:', page.url());
  console.log('After login title:', await page.title());

  // Find logout link
  const logoutHref = await page.locator('a[href*="logout"]').first().getAttribute('href').catch(() => null);
  const logoutText = await page.locator('a[href*="logout"]').first().textContent().catch(() => null);
  console.log('Logout link href:', logoutHref, 'text:', logoutText);

  // Do logout
  await page.locator('a[href*="logout"]').first().click();
  await page.waitForLoadState('domcontentloaded');
  console.log('After logout URL:', page.url());
  console.log('After logout title:', await page.title());

  // ── 7. Protected page after logout ──────────────────────────────────────
  console.log('\n━━━ PROTECTED PAGE AFTER LOGOUT ━━━');
  await page.goto('https://parabank.parasoft.com/parabank/overview.htm');
  await page.waitForLoadState('domcontentloaded');
  console.log('Protected page URL:', page.url());
  console.log('Protected page title:', await page.title());
  const protectedContent = await page.locator('#rightPanel').textContent().catch(() => null);
  console.log('rightPanel text:', protectedContent?.trim().substring(0, 300));

  // ── 8. Account overview: balance format ─────────────────────────────────
  console.log('\n━━━ ACCOUNT OVERVIEW BALANCE FORMAT ━━━');
  await page.goto('https://parabank.parasoft.com/parabank/index.htm');
  await page.fill('#loginPanel input[name="username"]', un);
  await page.fill('#loginPanel input[name="password"]', 'Test1234!');
  await page.getByRole('button', { name: 'Log In' }).click();
  await page.waitForLoadState('domcontentloaded');
  await page.goto('https://parabank.parasoft.com/parabank/overview.htm');
  await page.waitForLoadState('domcontentloaded');
  // Wait for table rows
  await page.locator('#accountTable tbody tr:has(a)').first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  const acctNum = await page.locator('#accountTable tbody tr:has(a) td a').first().textContent().catch(() => null);
  const balance = await page.locator('#accountTable tbody tr:has(a) td:nth-child(2)').first().textContent().catch(() => null);
  const available = await page.locator('#accountTable tbody tr:has(a) td:nth-child(3)').first().textContent().catch(() => null);
  console.log('Account number:', acctNum?.trim());
  console.log('Balance:', balance?.trim());
  console.log('Available:', available?.trim());

  // ── 9. Password masking ──────────────────────────────────────────────────
  console.log('\n━━━ PASSWORD MASKING ━━━');
  const loginPwType = await page.goto('https://parabank.parasoft.com/parabank/index.htm').then(() =>
    page.locator('#loginPanel input[name="password"]').getAttribute('type')
  );
  console.log('Login password input type:', loginPwType);
  await page.goto('https://parabank.parasoft.com/parabank/register.htm');
  const regPwType = await page.locator('[id="customer.password"]').getAttribute('type');
  const regConfirmPwType = await page.locator('#repeatedPassword').getAttribute('type');
  console.log('Reg password type:', regPwType, '| confirm type:', regConfirmPwType);

  await br.close();
})().catch(e => { console.error('FATAL:', e.message, e.stack); process.exit(1); });
