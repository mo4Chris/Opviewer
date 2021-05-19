import { CtvLtmPage } from './ctvltm.po';
import { browser, by, element } from 'protractor';


describe('Ctv longterm module', () => {
  let page: CtvLtmPage;
  beforeEach(() => {
    page = new CtvLtmPage();
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
    expect(page.dp.isOpen()).toBe(false);
    expect(page.getDateString()).toMatch(/\d{4}-\d{2}-01 - \d{4}-\d{2}-\d{2}/);
  });

  it('should switch dates via buttons', () => {
    page.switchLastMonth();
    expect(page.getNanCount()).toBe(0);
    expect(page.dp.getNextMonthBtn().isEnabled()).toBe(true, 'Next month button should be enabled');
    expect(page.getVesselList().count()).toBeGreaterThan(0);
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

  it('should allow adding vessels', () => {
    const info = page.getVesselInfoTable();
    expect(info.all(by.css('tbody>tr')).count()).toEqual(1);
    const btn = page.getVesselDropdown();
    btn.click();
    const list = page.getVesselList();
    list.first().$('div').click(); // Selects all vessels
    browser.waitForAngular();
    expect(page.getActiveVesselCount()).toBeGreaterThan(1, 'No more active vessels');
    expect(info.all(by.css('tbody>tr')).count()).toBeGreaterThan(1, 'Select all button not working properly');
  });

  it('should not fail without any selected vessels', () => {
    const active = page.getSelectedVessels();
    expect(active.count()).toEqual(1, 'Should have 1 selected vessel');
    active.each(e => {
      return e.$('a').click();
    });
    browser.waitForAngular();
    expect(active.count()).toEqual(0, 'Should have no selected vessels');
  });

  it('should initialize correctly when data is present', () => {
    page.setDateRange({year: 2020, month: 1, day: 1}, {year: 2020, month: 2, day: 1});
    expect(page.getNanCount()).toBe(0, 'Can be no nans!');
    expect(page.dp.getNextMonthBtn().isEnabled()).toBe(true, 'Next month button should be enabled');    expect(page.getGraphContainers().count()).toBeGreaterThan(3);
  });

  it('should load wave data', () => {
    page.selectWaveSourceByIndex(1);
    expect(page).toBeTruthy();
    const vesselActivityChart = element(by.id('deploymentGraph'));
    expect(vesselActivityChart.isPresent()).toBe(true);
  });
});

const sleep = () => {
  browser.sleep(5000);
};

