import { browser, by, element, ExpectedConditions } from 'protractor';

var EC = ExpectedConditions;
browser.ignoreSynchronization = true;

export class AppPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('app-root h1')).getText();
  }

  setUsernameText() {
    return element(by.id('username')).sendKeys('masterctv@bmo-offshore.com');
  }

  setPasswordText() {
    return element(by.id('password')).sendKeys('hanspasswordtocheck');
  }

  clickLoginButton(){
    return element(by.id('loginButton')).click();
  }

  pageRedirectsDashboard() {
    return browser.wait(EC.urlContains('/dashboard'), 5000);
  }

  checkDashboardHeader() {
    return element(by.id('DashboardHeader')).getText();
  }

  checkDashboardMapExists() {
    return element(by.id('mapLegendID')).isPresent();
  }
 
}
