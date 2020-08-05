import { browser, by, element, ExpectedConditions } from 'protractor';

var EC = ExpectedConditions;
browser.ignoreSynchronization = true;

export class AppPage {
  navigateTo() {
    return browser.get('/dashboard');
  }

  pageCheckReports() {
    return browser.wait(EC.urlContains('/reports'), 5000);
  }

  clickVesselsAndReportsLink(){
    return element(by.css('[href="/reports"]')).click();
  }

  checkVesselsHeader() {
    return element(by.css('tableTitle')).getText();
  }
 
  clickSortButton(key: string) {
    return element(by.id(key)).click();
  }
}
