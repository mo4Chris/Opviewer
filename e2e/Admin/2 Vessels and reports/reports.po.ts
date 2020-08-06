import { browser, by, element, ExpectedConditions } from 'protractor';

var EC = ExpectedConditions;

export class ReportsPage {
  navigateTo() {
    return browser.get('reports');
    // return browser.get('/login');
  }

  pageCheckReports() {
    return browser.wait(EC.urlContains('/reports'), 5000);
  }

  clickVesselsAndReportsLink(){
    return element(by.css('[href="/reports"]')).click();
  }

  checkVesselsHeader() {
    return element(by.className('tableTitle')).getText();
  }
 
  clickSortButton(key: string) {
    return element(by.id(key)).click();
  }

  getSearchField() {
    return element(by.id('searchBox'));
  }

  getActiveVesselnames() {
    return element.all(by.repeater("let rd of filter;let ind = index"))
  }
}
