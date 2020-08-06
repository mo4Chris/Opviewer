import { ReportsPage } from './reports.po';
import { browser, element, by } from 'protractor';

describe('Admin Vessels and Reports page', () => {
  let page: ReportsPage;

  beforeAll(() => {
    browser.get('http://localhost:4300/reports')
  });

  beforeEach(() => {
    page = new ReportsPage();
    page.navigateTo();
  });

  it('should navigate to the reports page', () => {
    // console.log('----------------------------------')
    // let header = element(by.className('nav-link'));
    // console.log(header.getText())
    expect(page.checkVesselsHeader()).toContain('Vessel overview');
    // console.log('**********************************')
  });

  it('should display vessel list', () => {
    let vessels = element.all(by.binding('nicename')).first()
    expect(page.checkVesselsHeader()).toContain('Vessel overview');
  });

  it('should allow sorting on vessel name', () => {
    page.clickVesselsAndReportsLink();
    browser.debugger()
    page.clickSortButton('vesselname');
    expect(page.checkVesselsHeader()).toContain('Vessel overview');
  });

  it('should allow sorting on mmsi', () => {
    page.clickVesselsAndReportsLink();
    page.clickSortButton('mmsi');
    browser.waitForAngular();
    expect(page.checkVesselsHeader()).toContain('Vessel overview');
  });

  it('should allow sorting on clients', () => {
    page.clickSortButton('clients');
    expect(page.checkVesselsHeader()).toContain('Vessel overview');
  });

  it('Should allow for filtering', () => {
    let searchField = page.getSearchField();
    searchField.sendKeys('nonExiSTentVesselName');
  });

  it('Should successfully click the dpr button', () => {
    element.all(by.buttonText('Daily vessel report')).first().click();
    browser.waitForAngular();
    expect(browser.getCurrentUrl()).toMatch('/reports/ltm');
  });

  it('Should successfully click the ltm button', () => {
    element.all(by.buttonText('Long term reports')).first().click();
    browser.waitForAngular();
    expect(browser.getCurrentUrl()).toMatch('/reports/ltm');
  })
});
