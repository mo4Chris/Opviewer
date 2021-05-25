import { by, element } from 'protractor';
import { DashboardPage } from './dashboard.po';


describe('VM SOV: Dashboard', () => {
  let page: DashboardPage;

  beforeEach(() => {
    page = new DashboardPage();
    return page.navigateTo();
  });

  describe('should load general info', () => {
    it('and not redirect', async () => {
        expect(await page.pageRedirectsDashboard()).toBe(true);
    });

    it('and have correct title', async () => {
        expect(await page.checkDashboardHeader()).toMatch('Dashboard');
    });

    it('and have correctly loaded the legend', async () => {
        const legend = element(by.id('mapLegendID'));
        expect(await legend.isPresent()).toBe(true, 'Legend failed to load');
        const entries = element.all(by.xpath('//div[@id=\'mapLegendID\']/div/span'));
        expect(await entries.count()).toBeGreaterThan(1, 'Legend has no entries');
    });

    it('and correctly load the map', async () => {
        expect(await page.checkDashboardMapExists()).toBe(true);
    });
  });

  describe('should load sov vm feature', () => {
    it('table', async () => {
      // At given date, all transfers are assigned
      expect(await element(by.className('table')).isPresent()).toBe(false);
    });
  });
});
