import { browser, by, element, ExpectedConditions } from 'protractor';
import { env } from 'process';

var EC = ExpectedConditions;

export class ReportsPage {
  navigateTo() {
    return browser.get(env.baseUrl + '/reports');
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

  getActiveVesselNames() {
    return element.all(by.xpath("//tr/td[@id='vesselnameValue']"))
  }

  getActi
}
