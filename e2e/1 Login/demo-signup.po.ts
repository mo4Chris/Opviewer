import { browser, by, element, ExpectedConditions } from 'protractor';
import { E2ePageObject } from '../SupportFunctions/e2epage.support';


export class DemoSignupPage extends E2ePageObject {
  navigateTo() {
    return browser.get('/registration');
  }
  getEmailInput() {
    return element(by.name('emailField'))
  }
  getPasswordInput() {
    return element(by.name('passwordField'))
  }
  getConfirmPasswordInput() {
    return element(by.name('confirmPasswordField'))
  }
  getFullNameInput() {
    return element(by.name('nameField'))
  }
  getCompanyInput() {
    return element(by.name('companyField'))
  }
  getJobTitleInput() {
    return element(by.name('jobTitleField'))
  }
  getPhoneNumberInput() {
    return element(by.name('phoneNumberField'))
  }
  getPolicyConcent() {
    return element(by.name('dataPolicy'))
  }
  getConfirmButton() {
    return element(by.id('register'))
  }
  getCancelButton() {
    return element(by.id('cancel'))
  }
};
