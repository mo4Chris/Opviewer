import { AppPage } from './app.po';

describe('Admin Vessels and Reports page', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display vessel list', () => {
    page.navigateTo();
    page.clickVesselsAndReportsLink();
    expect(page.checkVesselsHeader()).toContain('Vessel overview');
  });

});
