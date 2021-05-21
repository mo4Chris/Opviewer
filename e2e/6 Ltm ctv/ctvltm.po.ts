import { E2ePageObject } from '../SupportFunctions/e2epage.support';
import { browser, element, by, ElementFinder } from 'protractor';


export class CtvLtmPage extends E2ePageObject {
  dp = new LtmDatePicker();

  navigateTo() {
    return browser.get('/reports/longterm;mmsi=123456789;vesselName=SOV%20example');
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

  async getVesselDropdown(): Promise<ElementFinder> {
    const dropdown = element(by.xpath('//ng-multiselect-dropdown[@id="selectVessel"]/div'));
    expect(await dropdown.isPresent()).toBe(true, 'Vessel dropdown not found!');
    return dropdown;
  }
  async getVesselList() {
    const dropdown: ElementFinder = await this.getVesselDropdown();
    const list = dropdown.element(by.className('dropdown-list'));
    expect(await list.isPresent()).toBe(true, 'Vessel list not found!');
    return await list.all(by.xpath('.//ul/li'));
  }
  async getSelectedVessels() {
    const dropdown: ElementFinder = await this.getVesselDropdown();
    return dropdown.all(by.xpath('.//span[a]'));
  }
  async getActiveVesselCount() {
    const vessels = await this.getSelectedVessels()
    return vessels.length
  }

  getVesselInfoTable() {
    return element(by.xpath('//app-vesselinfo/table'));
  }

  getWaveDropdown() {
    return element(by.xpath('//ng-multiselect-dropdown[@name="selectField"]/div'));
  }
  async selectWaveSourceByIndex(index = 1) {
    const btn = await this.getWaveDropdown();
    expect(await btn.isPresent()).toBe(true, 'Wave selection dropdown not present!');
    await btn.click();
    await btn.all(by.xpath('.//ul/li')).get(index).click();
    await btn.click();
  }

  getGraphContainers() {
    return element.all(by.className('graphContainer'));
  }
}

export class LtmDatePicker {
  openBtn = element(by.buttonText('Date selector'));
  pickerDiv = element(by.xpath('//ngb-modal-window[@role="dialog"]/div/div'));
  confirmBtn = this.pickerDiv.element(by.buttonText('Search for new date range'));
  cancelBtn = this.pickerDiv.element(by.buttonText('Close without changing date'));
  private y = this.pickerDiv.element(by.xpath('//select[@title="Select year"]'));
  private m = this.pickerDiv.element(by.xpath('//select[@title="Select month"]'));
  private leftMonth = this.pickerDiv.all(by.tagName('ngb-datepicker-month-view')).first();

  async open() {
    await this.openBtn.click();
    await browser.waitForAngular();
  }
  isOpen() {
    return this.pickerDiv.isPresent();
  }
  getYear() {
      return getValue(this.y);
  }
  async setYear(year: number) {
      await this.y.click();
      const btn = this.y.element(by.xpath('./option[@value=' + year + ']'));
      await btn.click();
  }
  getMonth() {
      return getValue(this.m);
  }
  async setMonth(month: number) {
      await this.m.click();
      const btn = this.m.element(by.xpath('./option[@value=' + month + ']'));
      await btn.click();
  }
  getDay() {
      const btn = this.leftMonth.element(by.className('custom-day'));
      return btn.getText();
  }
  setDay(day: number) {
      return this.getDayCell(day).click();
  }
  async setDate(ymd: DateYMD) {
    await this.setYear(ymd.year);
    await this.setMonth(ymd.month);
    await this.setDay(ymd.day);
  }
  async setDateRange(from: DateYMD, to: DateYMD) {
    const _open = await this.isOpen()
    if (!_open) {
      this.open();
    }
    await this.setDate(from);
    await this.setDate(to);
    await this.confirmBtn.click();
    await browser.waitForAngular();
  }

  getLastMonthBtn() {
    return element(by.id('prevMonthButton'));
  }
  getNextMonthBtn() {
    return element(by.id('nextMonthButton'));
  }

  private getDayCell(day: number) {
      return this.leftMonth.element(by.xpath('.//span[text()=" ' + day + ' "]'));
  }
}

interface DateYMD {
  year: number;
  month: number;
  day: number;
}

const getValue = (elt: ElementFinder) => {
  return elt.getAttribute('value');
};
