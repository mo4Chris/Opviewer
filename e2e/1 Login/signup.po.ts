import { browser, by, element, ExpectedConditions } from 'protractor';
import { E2ePageObject } from '../SupportFunctions/e2epage.support';


export class SignupPage extends E2ePageObject {
  navigateTo() {
    return browser.get('/signup');
  }
  getEmailInput() {
    return element(by.name('emailField'))
  }
  getUserSelect() {
    return element(by.name('selectPermission'))
  }
  getClientSelect() {
    return element(by.name('selectBusinessName'))
  }
  getConfirmButton() {
    return element(by.id('register'))
  }
  getCancelButton() {
    return element(by.id('cancel'))
  }
}
