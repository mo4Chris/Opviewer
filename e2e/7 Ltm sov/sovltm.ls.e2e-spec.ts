import { SovLtmPage } from './sovltm.po';
import { browser, by } from 'protractor';



describe('Sov longterm module', () => {
  let page: SovLtmPage;
  beforeEach(() => {
    page = new SovLtmPage();
    page.navigateTo();
  });
  // afterEach(() => {
  //   page.validateNoConsoleLogs();
  // });

  it('should initialize correctly', () => {
    expect(page.getNanCount()).toBe(0);
    expect(page.dp.getLastMonthBtn().isEnabled()).toBe(true);
    expect(page.dp.getNextMonthBtn().isEnabled()).toBe(false);
    expect(page.getVesselList().count()).toBeGreaterThan(0);
    expect(page.getKpiCard().isPresent()).toBe(false, 'BMO logistic specialist does not have KPI permission');
    expect(page.dp.isOpen()).toBe(false);
    expect(page.getDateString()).toMatch(/\d{4}-\d{2}-01 - \d{4}-\d{2}-\d{2}/);
  });

  it('should switch dates via buttons', () => {
    page.switchLastMonth();
    expect(page.getNanCount()).toBe(0);
    expect(page.dp.getNextMonthBtn().isEnabled()).toBe(true, 'Next month button should be enabled');
    expect(page.getVesselList().count()).toBeGreaterThan(0);
    expect(page.getKpiCard().isPresent()).toBe(false, 'KPI should not be enabled for BMO logistic specialist');
    expect(page.dp.isOpen()).toBe(false, 'Date picker should be closed');
    expect(page.getDateString()).toMatch(/\d{4}-\d{2}-01 - \d{4}-\d{2}-01/);
  });

  it('should only load new data when confirming the new date selection', () => {
    const dp = page.dp;
    dp.open();
    dp.setDate({year: 2020, month: 1, day: 1});
    dp.setDate({year: 2020, month: 2, day: 1});
    const oldDateString = page.getDateString();
    expect(page.dp.getNextMonthBtn().isEnabled()).toBe(false, 'Next day button should only enable on confirm');
    dp.cancelBtn.click();
    expect(page.getDateString()).toBe(oldDateString);
  });

  it('should initialize correctly when data is present', () => {
    page.setDateRange({year: 2020, month: 1, day: 1}, {year: 2020, month: 2, day: 1});
    expect(page.getNanCount()).toBe(0, 'Can be no nans!');
    expect(page.dp.getNextMonthBtn().isEnabled()).toBe(true, 'Next month button should be enabled');
    expect(page.getUtilizationGraph().isDisplayed()).toBe(true, 'Utilization graph should load with data present!');
    expect(page.getUtilizationGraph().element(by.tagName('canvas')).isDisplayed()).toBe(true, 'Utilization graph should load with data present!');
    expect(page.getGraphContainers().count()).toBeGreaterThan(3);
  });

  it('should allow adding vessels', () => {

  });

  it('should not fail without any selected vessels', () => {

  });
});

const sleep = () => {
  browser.sleep(5000);
};
