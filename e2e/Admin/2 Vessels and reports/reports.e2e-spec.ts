import { AppPage } from './reports.po';

describe('Admin Vessels and Reports page', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display vessel list', () => {
    page.navigateTo();
    expect(page.checkVesselsHeader()).toContain('Vessel overview');
  });

  it('should allow sorting on vessel name', () => {
    page.clickVesselsAndReportsLink();
    page.clickSortButton('vesselname');
    expect(page.checkVesselsHeader()).toContain('Vessel overview');
  });

  it('should allow sorting on mmsi', () => {
    page.clickSortButton('mmsi');
    expect(page.checkVesselsHeader()).toContain('Vessel overview');
  });

  // it('should allow sorting on clients', () => {
  //   page.clickSortButton('clients');
  //   expect(page.checkVesselsHeader()).toContain('Vessel overview');
  // });
});
