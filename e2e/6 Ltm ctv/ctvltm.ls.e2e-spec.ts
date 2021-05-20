import { CtvLtmPage } from './ctvltm.po';
import { browser, by, element } from 'protractor';


describe('Ctv longterm module', () => {
  let page: CtvLtmPage;
  beforeEach(() => {
    page = new CtvLtmPage();
    return page.navigateTo();
  });
  // afterEach(() => {
  //   page.validateNoConsoleLogs();
  // });

  it('should initialize correctly', async () => {
    expect(await page.getNanCount()).toBe(0);
    expect(page.dp.getLastMonthBtn().isEnabled()).toBe(true);
    expect(page.dp.getNextMonthBtn().isEnabled()).toBe(false);
    const vessels = await page.getVesselList();
    expect(vessels.length).toBeGreaterThan(0);
    expect(await page.dp.isOpen()).toBe(false);
    expect(await page.getDateString()).toMatch(/\d{4}-\d{2}-01 - \d{4}-\d{2}-\d{2}/);
  });

  it('should switch dates via buttons', async () => {
    await page.switchLastMonth();
    expect(page.getNanCount()).toBe(0);
    expect(await page.dp.getNextMonthBtn().isEnabled()).toBe(true, 'Next month button should be enabled');
    const vessels = await page.getVesselList();
    expect(vessels.length).toBeGreaterThan(0);
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

  it('should allow adding vessels', async () => {
    const info = page.getVesselInfoTable();
    const rows = info.all(by.css('tbody>tr'));
    expect(await rows.count()).toEqual(1);
    const btn = await page.getVesselDropdown();
    await btn.click();
    const list = await page.getVesselList();
    list[0].$('div').click(); // Selects all vessels
    await browser.waitForAngular();
    expect(await page.getActiveVesselCount()).toBeGreaterThan(1, 'No more active vessels');
    expect(await rows.count()).toBeGreaterThan(1, 'Select all button not working properly');
    await page.validateNoConsoleErrors()
  });

  it('should not fail without any selected vessels', async () => {
    const active = await page.getSelectedVessels();
    expect(active.length).toEqual(1, 'Should have 1 selected vessel');
    const btns = await active;
    for (let i = 0; i < btns.length; i++) {
      let e = btns[i];
      await e.$('a').click();
    };
    await browser.waitForAngular();
    const new_active = await page.getSelectedVessels();
    expect(new_active.length).toEqual(0, 'Should have no selected vessels');
  });

  it('should initialize correctly when data is present', async () => {
    await page.setDateRange({year: 2020, month: 1, day: 1}, {year: 2020, month: 2, day: 1});
    expect(await page.getNanCount()).toBe(0, 'Can be no nans!');
    expect(await page.dp.getNextMonthBtn().isEnabled()).toBe(true, 'Next month button should be enabled');
    expect(await page.getGraphContainers().count()).toBeGreaterThan(3);
  });

  it('should load wave data', async () => {
    await page.selectWaveSourceByIndex(1);
    expect(page).toBeTruthy();
    const vesselActivityChart = await element(by.id('deploymentGraph'));
    expect(await vesselActivityChart.isPresent()).toBe(true);
  });
});

const sleep = () => {
  browser.sleep(5000);
};

