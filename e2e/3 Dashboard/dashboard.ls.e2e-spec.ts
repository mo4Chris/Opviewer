import { by, element } from 'protractor';
import { DashboardPage } from './dashboard.po';


describe('LS: Dashboard', () => {
  let page: DashboardPage;

  beforeEach(() => {
    page = new DashboardPage();
    return page.navigateTo();
  });

  describe('should load general info', () => {
    it('and not redirect', () => {
        expect(page.pageRedirectsDashboard()).toBe(true);
    });

    it('and have correct title', async () => {
      const header = await page.checkDashboardHeader()
      expect(header).toMatch('Dashboard');
    });

    it('and have correctly loaded the legend', async () => {
        const legend = element(by.id('mapLegendID'));
        expect(await legend.isPresent()).toBe(true, 'Legend failed to load');
        const entries = element.all(by.xpath('//div[@id=\'mapLegendID\']/div/span'));
        expect(await entries.count()).toBeGreaterThan(1, 'Legend has no entries');
    });

    it('and correctly load the map', () => {
        expect(page.checkDashboardMapExists()).toBe(true);
    });
  });

  describe('should load ls feature', () => {
    it('active vessels table', () => {
      // At given date, all transfers are assigned
      expect(page.getCardByTitle('Active vessels').isPresent()).toBe(true);
    });
  });
});
