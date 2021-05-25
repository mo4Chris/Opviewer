import { browser, element, by, ElementFinder, ElementArrayFinder } from 'protractor';
import { env } from 'process';
import { E2eDropdownHandler, E2eSelectHandler } from '../SupportFunctions/e2eDropdown.support';
import { E2ePageObject } from '../SupportFunctions/e2epage.support';
import { E2eDatePicker } from '../SupportFunctions/e2eDatepicker.support';
import { E2eRandomTools } from '../SupportFunctions/e2eRandom.support';

const dropdownHandler = new E2eDropdownHandler();
export class SovDprPage extends E2ePageObject {
  summary = new SovDprSummaryTab();
  transfer = new SovDprTransferTab();
  dprinput = new SovDprInputTab();

  async navigateTo(tab?: string) {
    await browser.get('/reports/dpr;mmsi=987654321;date=737700');
    if (tab) {
      await this.clickTabByName(tab);
    }
  }
  async navigateToEmpty(tab?: string) {
    await browser.get('/reports/dpr;mmsi=987654321;date=737701');
    if (tab) {
      await this.clickTabByName(tab);
    }
  }
  async navigateToLatest(tab?: string) {
    await browser.get('/reports/dpr;mmsi=987654321');
    if (tab) {
      await this.clickTabByName(tab);
    }
  }
  async navigateToPlatform(tab?: string) {
    await browser.get('/reports/dpr;mmsi=987654321;date=737622');
    if (tab) {
      await this.clickTabByName(tab);
    }
  }

  getMap() {
    return element(by.tagName('agm-map'));
  }
  getDate() {
    throw new Error(('To be done!'));
  }

  getPrintFullButton() {
    return element(by.buttonText('Print DPR Full'));
  }
  getCurrentPrintMode() {
    throw new Error(('To be done!'));
    // return element(by.binding('printMode')).getText();
  }
  clickPrintButton(printButton: ElementFinder) {
    const printIsClicked = browser.executeAsyncScript(function (elm, callback) {
      function listener() {
        callback(true);
      }
      window.print = listener;
      elm.click();
    }, printButton.getWebElement());
    return printIsClicked;
  }

  getContainerByTitle(name: string) {
    const headerDiv = element(by.xpath('//div[contains(@class,"card-header") and contains(text(),"' + name + '")]'));
    return headerDiv.element(by.xpath('../..'));
  }
  getTabEnabledByName(name: string) {
    return this.getTabByName(name).isEnabled();
  }
  getTabPresentByName(name: string) {
    return this.getTabByName(name).isPresent();
  }
  getTabByName(name: string) {
    return element(by.xpath('//li/a[contains(text(),\'' + name + '\')]'));
  }
  getActiveTab() {
    return element(by.xpath('//li/a[contains(@class, \'active\')]'));
  }
  async clickTab(tab: ElementFinder) {
    await tab.click();
    await browser.waitForAngular();
  }
  async tabIsEnabled(tab: ElementFinder) {
    const attr = await tab.getAttribute('ariaDisabled')
    return attr == 'false';
  }
  clickTabByName(name: string) {
    return this.clickTab(this.getTabByName(name));
  }

  getPrevDayButton() {
    return element(by.id('prevDayButton'));
  }
  getCurrentDateField() {
    return element(by.xpath('//div[contains(@class, "datepicker-input")]/input'));
  }
  getDatePickerbtn() {
    return element(by.id('datePickBtn'));
  }
  getDatePickerString() {
    return this.getCurrentDateField().getAttribute('value');
  }
  getNextDayButton() {
    return element(by.id('nextDayButton'));
  }
  async switchDate(date: {year: number, month: number, day: number}) {
    const helper = await E2eDatePicker.open();
    await helper.setDate(date);
  }

  getVesselDropdown() {
    return element(by.name('selectVessel'));
  }
}

class SovDprSummaryTab {
  getOperationActivityChart() {
    return element(by.id('operationalStats'));
  }
  getGangwayLimitationChart() {
    return element(by.id('gangwayLimitations'));
  }
  getWeatherOverviewChart() {
    return element(by.id('weatherOverview'));
  }
}

class SovDprTransferTab {
  private getContainerByTitle(name: string) {
    const headerDiv = element(by.xpath('//div[contains(@class,"card-header") and contains(text(),"' + name + '")]'));
    return headerDiv.element(by.xpath('../..'));
  }
  getV2vTable() {
    return this.getContainerByTitle('Vessel Transfers');
  }
  getDcTable() {
    return this.getContainerByTitle('Turbine transfers for daughtercraft');
  }
  getDcSaveBtn() {
    return this.getDcTable().element(by.buttonText('Save all transfers'));
  }
  getRovTable() {
    return this.getContainerByTitle('ROV Operations');
  }
  getRovSaveBtn() {
    return this.getRovTable().element(by.buttonText('Save'));
  }
  getTurbineTable() {
    return element(by.id('sovTurbineTransfers'));
  }
  getPlatformTable() {
    return this.getContainerByTitle('Platform docking');
  }
  getGangwayTable() {
    return this.getContainerByTitle('Gangway usage');
  }
  getCycleTimeTable() {
    return this.getContainerByTitle('Cycle Times');
  }

  async setPaxCargo(row: ElementFinder, input: {paxIn: number, paxOut: number, cargoIn: number, cargoOut: number}) {
    const inputs = row.all(by.tagName('input'));
    await inputs.get(-4).clear();
    await inputs.get(-3).clear();
    await inputs.get(-2).clear();
    await inputs.get(-1).clear();
    await inputs.get(-4).sendKeys(input.paxIn);
    await inputs.get(-3).sendKeys(input.paxOut);
    await inputs.get(-2).sendKeys(input.cargoIn);
    await inputs.get(-1).sendKeys(input.cargoOut);
  }
  async getPaxCargo(row: ElementFinder) {
    const inputs = row.all(by.tagName('input'));
    const parse = async (index: number) => {
      const val = await inputs.get(index).getAttribute('value')
      return parseInt(val);
    };
    return  {
      paxIn: await parse(-4),
      paxOut: await parse(-3),
      cargoIn: await parse(-2),
      cargoOut: await parse(-1),
    };
  }
  getRndpaxCargo() {
    const rng = new E2eRandomTools();
    return {
      paxIn: rng.getRandomInt(0, 20),
      paxOut: rng.getRandomInt(0, 20),
      cargoIn: rng.getRandomInt(0, 20),
      cargoOut: rng.getRandomInt(0, 20),
    };
  }
  getHeader(table: ElementFinder) {
    return table.all(by.xpath('.//thead/tr'));
  }
  getRows(table: ElementFinder) {
    return table.all(by.css('tbody > tr'));
  }
  getHeliRows(table: ElementFinder) {
    // return table.element(by.xpath('tr/th[contains(text(),"Helicopter")]/..'))
    return table.all(by.name('helicopter'));
  }
  getMissedTransferRows(table: ElementFinder) {
    return table.all(by.name('missedTransfer'));
  }
  async saveTurbineTransfers() {
    await this.getTurbineTable().element(by.buttonText('Save all transfers')).click();
    await browser.waitForAngular();
  }
  async savePlatformTransfers() {
    await this.getPlatformTable().all(by.buttonText('Save all transfers')).last().click();
    await browser.waitForAngular();
  }
}

class SovDprInputTab {
  private hrs   = this.initTimeOpts();
  public dprInput = this.getContainerByTitle('DPR input');
  public hseInput = this.getContainerByTitle('Additional HSE inputs');

  private getContainerByTitle(name: string) {
    const headerDiv = element(by.xpath('//div[contains(@class,"card-header") and contains(text(),"' + name + '")]'));
    return headerDiv.element(by.xpath('../..'));
  }
  private initTimeOpts() {
    const quarterHours = ['00', '15', '30', '45'];
    const times = [];
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 4; j++) {
        let time = i + ':' + quarterHours[j];
        if (i < 10) {
          time = '0' + time;
        }
        times.push(time);
      }
    }
    times.push('24:00');
    return times;
  }
  async setRandomTime(row: ElementFinder) {
    const rng = new E2eRandomTools();
    const drp = new E2eSelectHandler();
    let start: number, stop: number;
    const a = rng.getRandomInt(0, 96);
    const b = rng.getRandomInt(0, 95);
    if (a < b) {
      start = a;
      stop = b + 1;
    } else if (a === b) {
      start = a;
      stop = b + 1;
    } else {
      start = b;
      stop = a;
    }
    const selects = row.all(by.xpath('./td/select'));
    await drp.setValueByIndex(selects.get(1), start);
    await drp.setValueByIndex(selects.get(2), stop);
    return {
      start: this.hrs[start],
      stop: this.hrs[stop],
    };
  }
  addLine(row: ElementFinder) {
    // row.element(by.xpath('//button[text()="add line"]')).click();
    return row.element(by.buttonText('add line')).click();
  }
  removeLine(row: ElementFinder) {
    return row.element(by.buttonText('remove last')).click();
  }
  saveTable(tab: ElementFinder) {
    return tab.element(by.buttonText('Save')).click();
  }

  getDprInputTable(index: number) {
    return this.dprInput.all(by.xpath('.//table/tbody')).get(index);
  }
  getHseInputTable(index: number) {
    return this.hseInput.all(by.xpath('.//table/tbody')).get(index);
  }
  getStandby(): E2eDprInputTableElt {
    return {
      rows: element.all(by.name('standby-array')),
      addline: element(by.name('standby-addrow')),
    };
  }
  getTechnicalDowntime(): E2eDprInputTableElt {
    return {
      rows: element.all(by.name('tdt-array')),
      addline: element(by.name('tdt-addrow')),
    };
  }
  getWeatherDowntime(): E2eDprInputTableElt {
    return {
      rows: element.all(by.name('wdt-array')),
      addline: element(by.name('wdt-addrow')),
    };
  }
  getAccessDayType() {
    return element(by.id('accessDayType')).element(by.xpath('./td'));
  }
  async saveDprTableByIndex(index: number = 0) {
    const table = this.getDprInputTable(index);
    expect(await table.isPresent()).toBe(true, 'Cannot find dpr table');
    await this.saveTable(table);
  }
  checkRowTimes(row: ElementFinder, t: {start: string, stop: string}) {
    const inputs = row.all(by.xpath('./td/select'));
    expect(inputs.count()).toBeGreaterThanOrEqual(3);
    expect(inputs.get(1).getAttribute('value')).toBe(t.start);
    expect(inputs.get(2).getAttribute('value')).toBe(t.stop);
  }

  private getSocRow() {
    return element(by.id('socCards'));
  }
  addSocCard() {
    return this.getSocRow().element(by.buttonText('add line')).click();
  }
  rmSocCard() {
    return this.getSocRow().element(by.buttonText('remove last')).click();
  }
  getSocCards() {
    return this.getSocRow().all(by.className('tableRow'));
  }
  private getToolboxRow() {
    return element(by.id('toolboxTalks'));
  }
  addToolboxTalk() {
    return this.getToolboxRow().element(by.buttonText('add line')).click();
  }
  rmToolboxTalk() {
    return this.getToolboxRow().element(by.buttonText('remove last')).click();
  }
  getToolboxTalks() {
    return this.getToolboxRow().all(by.className('tableRow'));
  }
  saveSocToolbox() {
    return this.saveDprTableByIndex(1);
  }
}

export interface E2eDprInputTableElt {
  rows: ElementArrayFinder;
  addline: ElementFinder;
}
