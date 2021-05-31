import { ReportsPage } from './reports.po';
import { browser, element, by, ExpectedConditions, Key } from 'protractor';

describe('vm-ctv: Vessels and Reports page', () => {
  let page: ReportsPage;

  beforeEach(async () => {
    page = new ReportsPage();
    await page.navigateTo();
  });

  it('Should not be redirected', async () => {
    const isRedirected = browser.wait(ExpectedConditions.urlContains('/reports'), 2000);
    expect(await isRedirected).toBe(true);
  });

  it('should have correct header', async () => {
    expect(await page.checkVesselsHeader()).toContain('Vessel overview');
  });

  it('should display vessel list', async () => {
    const vessels = await element.all(by.id('vesselnameValue'));
    expect(vessels.length).toBeGreaterThan(0);
    const header = await page.checkVesselsHeader();
    expect( header ).toContain('Vessel overview');
  });

  it('should allow sorting on vessel name', async () => {
    await page.clickSortButton('vesselname');
    await browser.waitForAngular();
    expect(await page.checkVesselsHeader()).toContain('Vessel overview');
  });

  it('should allow sorting on mmsi', async () => {
    await page.clickSortButton('mmsi');
    await browser.waitForAngular();
    expect(await page.checkVesselsHeader()).toContain('Vessel overview');
  });

  // it('should allow sorting on clients', () => {
  //   // Only passes if admin
  //   page.clickSortButton('clients');
  //   browser.waitForAngular();
  //   expect(page.checkVesselsHeader()).toContain('Vessel overview');
  // });

  it('Should allow for filtering', async () => {
    const searchField = page.getSearchField();
    expect(await searchField.isPresent()).toBeTruthy('Filter field not found!')

    let vessels = await page.getActiveVesselNames();
    let original: string;

    expect(vessels.length).toBeGreaterThan(0, 'Expect at least one vessel before filtering');
    original = await vessels[0].getText()

    await searchField.sendKeys('nonExiSTentVesselName');
    vessels = await page.getActiveVesselNames();
    expect(vessels.length).toBe(0, 'No vessels should match bad filter');

    await searchField.sendKeys(Key.chord(Key.CONTROL, 'a'));
    await searchField.sendKeys(Key.DELETE);
    vessels = await page.getActiveVesselNames();
    expect(vessels.length).toBeGreaterThan(0, 'Expect at least 1 vessel after clearing filter');
    if (vessels.length > 0) {
      expect(vessels[0].getText()).toEqual(original);
    }
  });

  it('Should successfully click the dpr button', async () => {
    await element.all(by.id('routeToDpr')).first().click();
    await browser.waitForAngular();
    expect(await browser.getCurrentUrl()).toMatch('/reports/dpr');
  });

  // it('Should successfully click the ltm button', () => {
  //   // Not working as vessel master (or marine controller?)
  //   element.all(by.id('routeToLtm')).first().click();
  //   browser.waitForAngular();
  //   expect(browser.getCurrentUrl()).toMatch('/reports/ltm');
  // })
});
