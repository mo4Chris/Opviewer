import { browser, by, element, ExpectedConditions } from 'protractor';
import { env } from 'process';
import { E2ePageObject } from '../SupportFunctions/e2epage.support';

var EC = ExpectedConditions;

export class ReportsPage extends E2ePageObject {
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

  getTableHeaderByName(txt: string) {
    return element(by.xpath("//th[contains(text(),'" + txt + "')]"))
  }
 
  clickSortButton(key: string) {
    return element(by.id(key)).click();
  }

  getSearchField() {
    return element(by.id('searchBox'));
  }

  getActiveVesselNames() {
    return element.all(by.xpath("//tr/td[@id='vesselnameValue']"));
  }

  getDprButtons() {
    return element.all(by.xpath('//a[contains(text(), "Daily Vessel Report")]'))
  }

  getLtmButtons() {
    // return element.all(by.buttonText('Long term reports'));
    return element.all(by.xpath('//a[contains(text(), "Long term reports")]'))
  }

}
