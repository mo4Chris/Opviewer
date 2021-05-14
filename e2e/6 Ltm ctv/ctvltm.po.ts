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

  getVesselDropdown() {
    const dropdown = element(by.xpath('//ng-multiselect-dropdown[@id="selectVessel"]/div'));
    expect(dropdown.isPresent()).toBe(true, 'Vessel dropdown not found!');
    return dropdown;
  }
  async getVesselList() {
    const list = await this.getVesselDropdown().element(by.className('dropdown-list'));
    expect(list.isPresent()).toBe(true, 'Vessel list not found!');
    return await list.all(by.xpath('.//ul/li'));
  }
  getSelectedVessels() {
    return this.getVesselDropdown().all(by.xpath('.//span[a]'));
  }
  getActiveVesselCount() {
    return this.getSelectedVessels().count();
  }

  getVesselInfoTable() {
    return element(by.xpath('//app-vesselinfo/table'));
  }

  getWaveDropdown() {
    return element(by.xpath('//ng-multiselect-dropdown[@name="selectField"]/div'));
  }
  async selectWaveSourceByIndex(index = 1) {
    const btn = await this.getWaveDropdown();
    expect(btn.isPresent()).toBe(true, 'Wave selection dropdown not present!');
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

  open() {
    this.openBtn.click();
    browser.waitForAngular();
  }
  isOpen() {
    return this.pickerDiv.isPresent();
  }
  getYear() {
      return getValue(this.y);
  }
  setYear(year: number) {
      this.y.click();
      const btn = this.y.element(by.xpath('./option[@value=' + year + ']'));
      btn.click();
  }
  getMonth() {
      return getValue(this.m);
  }
  setMonth(month: number) {
      this.m.click();
      const btn = this.m.element(by.xpath('./option[@value=' + month + ']'));
      btn.click();
  }
  getDay() {
      const btn = this.leftMonth.element(by.className('custom-day'));
      return btn.getText();
  }
  setDay(day: number) {
      this.getDayCell(day).click();
  }
  setDate(ymd: DateYMD) {
    this.setYear(ymd.year);
    this.setMonth(ymd.month);
    this.setDay(ymd.day);
  }
  setDateRange(from: DateYMD, to: DateYMD) {
    this.isOpen().then(_open => {
      if (!_open) {
        this.open();
      }
      this.setDate(from);
      this.setDate(to);
      this.confirmBtn.click();
      browser.waitForAngular();
    });
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
