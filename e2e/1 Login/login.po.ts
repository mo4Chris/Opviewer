import { browser, by, element, ExpectedConditions } from 'protractor';
import { env } from 'process';

const EC = ExpectedConditions;
// browser.ignoreSynchronization = true;

export class LoginPage {


  navigateTo() {
    return browser.get(env.baseUrl + '/login');
  }

  getParagraphText() {
    return element(by.css('app-root h1')).getText();
  }

  setUsernameText() {
    return element(by.id('username')).sendKeys(env.username);
  }

  setPasswordText() {
    return element(by.id('password')).sendKeys(env.password);
  }

  clickLoginButton() {
    return element(by.id('loginButton')).click();
  }

  pageRedirectsDashboard() {
    return browser.wait(EC.urlContains('/dashboard'), 2000);
  }


}
