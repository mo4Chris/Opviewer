import { SovLtmPage } from './sovltm.po';
import { browser, by } from 'protractor';



describe('Sov longterm module', () => {
  let page: SovLtmPage;
  beforeEach(() => {
    page = new SovLtmPage();
    return page.navigateTo();
  });
  // afterEach(() => {
  //   page.validateNoConsoleLogs();
  // });

  it('should initialize correctly', async () => {
    expect(await page.getNanCount()).toBe(0);
    expect(await page.dp.getLastMonthBtn().isEnabled()).toBe(true);
    expect(await page.dp.getNextMonthBtn().isEnabled()).toBe(false);
    expect(await page.getVesselList().count()).toBeGreaterThan(0);
    expect(await page.getKpiCard().isPresent()).toBe(false, 'BMO logistic specialist does not have KPI permission');
    expect(await page.dp.isOpen()).toBe(false);
    expect(await page.getDateString()).toMatch(/\d{4}-\d{2}-01 - \d{4}-\d{2}-\d{2}/);
  });

  it('should switch dates via buttons', async () => {
    await page.switchLastMonth();
    expect(await page.getNanCount()).toBe(0);
    expect(await page.dp.getNextMonthBtn().isEnabled()).toBe(true, 'Next month button should be enabled');
    expect(await page.getVesselList().count()).toBeGreaterThan(0);
    expect(await page.dp.isOpen()).toBe(false, 'Date picker should be closed');
    expect(await page.getDateString()).toMatch(/\d{4}-\d{2}-01 - \d{4}-\d{2}-01/);
  });

  it('should only load new data when confirming the new date selection', async () => {
    const dp = page.dp;
    await dp.open();
    await dp.setDate({year: 2020, month: 1, day: 1});
    await dp.setDate({year: 2020, month: 2, day: 1});
    const oldDateString = await page.getDateString();
    expect(await page.dp.getNextMonthBtn().isEnabled()).toBe(false, 'Next day button should only enable on confirm');
    await dp.cancelBtn.click();
    expect(await page.getDateString()).toBe(oldDateString);
  });

  it('should initialize correctly when data is present', async () => {
    await page.setDateRange({year: 2020, month: 1, day: 1}, {year: 2020, month: 2, day: 1});
    expect(await page.getNanCount()).toBe(0, 'Can be no nans!');
    expect(await page.dp.getNextMonthBtn().isEnabled()).toBe(true, 'Next month button should be enabled');
    expect(await page.getUtilizationGraph().isDisplayed()).toBe(true, 'Utilization graph should load with data present!');
    expect(await page.getUtilizationGraph().element(by.tagName('canvas')).isDisplayed()).toBe(true, 'Utilization graph should load with data present!');
    expect(await page.getGraphContainers().count()).toBeGreaterThan(3);
  });

  it('should allow adding vessels', () => {

  });

  it('should not fail without any selected vessels', () => {

  });
});

const sleep = () => {
  browser.sleep(5000);
};
