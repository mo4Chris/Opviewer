import { LoginPage } from './login.po';
import { browser, element, by, ExpectedConditions } from 'protractor';
import { env } from 'process';

describe('Admin login page', () => {
  let page: LoginPage;

  beforeEach(() => {
    page = new LoginPage();
  });

  it('should display welcome message', async () => {
    await page.navigateTo();
    expect(await page.getParagraphText()).toMatch('Dataviewer');
  });

  it('should login to website', async () => {
    await page.navigateTo();
    await page.setPasswordText();
    await page.setUsernameText();
    await page.clickLoginButton();
    expect(await page.pageRedirectsDashboard()).toBe(true);
  });

  it('should open and close 2fa help button', async () => {
    await page.navigateTo();
    const helpbtn = element(by.className('helpBtn'));
    let helpRef = element(by.className('popover-body'));
    expect(await helpRef.isPresent()).toBe(false);
    helpbtn.click();
    helpRef = element(by.className('popover-body'));
    expect(await helpRef.isPresent()).toBe(true);
    expect(await helpRef.getText()).toMatch('2FA');
    helpbtn.click();
    helpRef = element(by.className('popover-body'));
    expect(await helpRef.isPresent()).toBe(false);
  });
});
