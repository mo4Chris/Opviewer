import { E2ePageObject } from '../SupportFunctions/e2epage.support';
import { browser, element, by, ElementFinder } from 'protractor';
import { LtmDatePicker } from '../6 Ltm ctv/ctvltm.po';


export class SovLtmPage extends E2ePageObject {
  dp = new LtmDatePicker();

  navigateTo() {
    return browser.get('/reports/longterm;mmsi=987654321;vesselName=SOV%20example');
  }

  setDateRange(from: DateYMD, to: DateYMD) {
    return this.dp.setDateRange(from, to);
  }
  async switchLastMonth() {
    await this.dp.getLastMonthBtn().click();
    await browser.waitForAngular();
  }
  async switchNextMonth() {
    await this.dp.getNextMonthBtn().click();
    await browser.waitForAngular();
  }
  getDateString() {
    return element(by.xpath('//h1/h2/small')).getText();
  }

  getVesselDropdown() {
    const dropdown =  element(by.xpath('//ng-multiselect-dropdown[@id="selectVessel"]/div'));
    // expect(dropdown.isPresent()).toBe(true, 'Vessel dropdown not found!');
    return dropdown;
  }
  getVesselList() {
    const list = this.getVesselDropdown().element(by.className('dropdown-list'));
    // expect(list.isPresent()).toBe(true, 'Vessel list not found!');
    return list.all(by.xpath('.//ul/li'));
  }
  getSelectedVessels() {
    return this.getVesselList().filter((elt, cnt) => {
      return true;
    });
  }
  getKpiCard() {
    return element(by.xpath('//app-siemens-kpi-overview/div/div/div'));
  }
  getUtilizationGraph() {
    return element(by.xpath('//app-utilization-graph/div'));
  }

  getGraphContainers() {
    return element.all(by.className('graphContainer'));
  }
}

interface DateYMD {
  year: number;
  month: number;
  day: number;
}
