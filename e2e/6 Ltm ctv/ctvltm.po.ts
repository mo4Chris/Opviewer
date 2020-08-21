import { E2ePageObject } from '../SupportFunctions/e2epage.support';
import { browser, element, by, ElementFinder } from 'protractor';
import { env } from 'process';
import { E2eDatePicker } from '../SupportFunctions/e2eDatepicker.support';


export class CtvLtmPage extends E2ePageObject {
  dp = new LtmDatePicker();

  navigateTo() {
    browser.get('/reports/longterm;mmsi=123456789;vesselName=SOV%20example');
  }

  setDateRange(from: DateYMD, to: DateYMD) {
    this.dp.setDateRange(from, to);
  }
  switchLastMonth() {
    this.dp.getLastMonthBtn().click();
    browser.waitForAngular();
  }
  switchNextMonth() {
    this.dp.getNextMonthBtn().click();
    browser.waitForAngular();
  }
  getDateString() {
    return element(by.xpath('//h1/h2/small')).getText();
  }

  getVesselDropdown() {
    const dropdown =  element(by.xpath('//ng-multiselect-dropdown[@id="selectVessel"]/div'));
    expect(dropdown.isPresent()).toBe(true, 'Vessel dropdown not found!');
    return dropdown;
  }
  getVesselList() {
    const list = this.getVesselDropdown().element(by.className('dropdown-list'));
    expect(list.isPresent()).toBe(true, 'Vessel list not found!');
    return list.all(by.xpath('.//ul/li'));
  }
  getSelectedVessels() {
    this.getVesselList().filter((elt, cnt) => {
      return true;
    });
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
