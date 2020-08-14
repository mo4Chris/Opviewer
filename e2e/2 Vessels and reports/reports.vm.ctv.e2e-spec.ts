import { ReportsPage } from './reports.po';
import { browser, element, by, ExpectedConditions, Key } from 'protractor';

describe('Vessels and Reports page', () => {
  let page: ReportsPage;

  beforeEach(() => {
    page = new ReportsPage();
    page.navigateTo();
  });

  it('Should not be redirected', () => {
    let isRedirected = browser.wait(ExpectedConditions.urlContains('/reports'), 2000);
    expect(isRedirected).toBe(true);
  })

  it('should have correct header', () => {
    expect(page.checkVesselsHeader()).toContain('Vessel overview');
  });

  it('should allow sorting on vessel name', () => {
    page.clickSortButton('vesselname');
    browser.waitForAngular();
    expect(page.checkVesselsHeader()).toContain('Vessel overview');
  });

  it('should allow sorting on mmsi', () => {
    page.clickSortButton('mmsi');
    browser.waitForAngular();
    expect(page.checkVesselsHeader()).toContain('Vessel overview');
  });

  // it('should allow sorting on clients', () => {
  //   // Only passes if admin
  //   page.clickSortButton('clients');
  //   browser.waitForAngular();
  //   expect(page.checkVesselsHeader()).toContain('Vessel overview');
  // });

  it('Should allow for filtering', (done) => {
    let searchField = page.getSearchField();
    let vessels = page.getActiveVesselNames();
    let original: string;
    
    expect(vessels.count()).toBeGreaterThan(0, 'Expect at least one vessel before filtering');
    vessels.first().getText().then(txt => {
      original = txt;
    })

    searchField.sendKeys('nonExiSTentVesselName');
    browser.waitForAngular();
    vessels = page.getActiveVesselNames();
    expect(vessels.count()).toBe(0);

    searchField.sendKeys(Key.chord(Key.CONTROL, 'a'));
    searchField.sendKeys(Key.DELETE);
    browser.waitForAngular();
    vessels = page.getActiveVesselNames();
    expect(vessels.count()).toBeGreaterThan(0, 'Expect at least 1 vessel after clearing filter');
    vessels.first().getText().then(txt => {
      expect(txt).toEqual(original);
      done();
    })
  });

  fit('should successfully click the dpr button', () => {
    let dprButton = page.getDprButtons();
    expect(dprButton.count()).toBe(1);
    dprButton.first().click();
    browser.waitForAngular();
    expect(browser.getCurrentUrl()).toMatch('/reports/dpr');
  });

  it('should not have access to the LTM module', () => {
    expect(page.getLtmButtons().get(0).isPresent()).toBe(false);
  })

  it('Should not display onHire status', () => {
    expect(page.getTableHeaderByName('On hire').isPresent()).toBe(false);
  })
  // it('Should successfully click the ltm button', () => {
  //   // Not working as vessel master (or marine controller?)
  //   element.all(by.id('routeToLtm')).first().click();
  //   browser.waitForAngular();
  //   expect(browser.getCurrentUrl()).toMatch('/reports/ltm');
  // })
});
