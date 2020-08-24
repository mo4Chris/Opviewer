import { LoginPage } from './login.po';
import { browser, element, by } from 'protractor';
import { env } from 'process';

describe('Admin login page', () => {
  let page: LoginPage;

  beforeEach(() => {
    page = new LoginPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('BMO Dataviewer');
  });

  it('should login to website', () => {
    page.navigateTo();
    page.setPasswordText();
    page.setUsernameText();
    page.clickLoginButton();
    expect(page.pageRedirectsDashboard()).toBe(true);
  });

  it('should open and close 2fa help button', ()=>{
    page.navigateTo();
    const helpbtn = element(by.className('helpBtn'));
    let helpRef = element(by.className('popover-body'));
    expect(helpRef.isPresent()).toBe(false);
    helpbtn.click();
    helpRef = element(by.className('popover-body'));
    expect(helpRef.isPresent()).toBe(true);
    expect(helpRef.getText()).toMatch('2FA');
    helpbtn.click();
    helpRef = element(by.className('popover-body'));
    expect(helpRef.isPresent()).toBe(false);
  })
});
