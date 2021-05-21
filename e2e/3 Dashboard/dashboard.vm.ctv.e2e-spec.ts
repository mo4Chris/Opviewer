import { by, element } from 'protractor';
import { DashboardPage } from './dashboard.po';


describe('VM CTV: Dashboard', () => {
  let page: DashboardPage;

  beforeEach(async () => {
    page = new DashboardPage();
    await page.navigateTo();
  });

  describe('should load general info', () => {
    it('and not redirect', async () => {
        expect(await page.pageRedirectsDashboard()).toBe(true);
    });

    it('and have correct title', async () => {
        expect(await page.checkDashboardHeader()).toMatch('Dashboard');
    });

    it('and have correctly loaded the legend', async () => {
        const legend = await element(by.id('mapLegendID'));
        expect(legend.isPresent()).toBe(true, 'Legend failed to load');
        const entries = await element.all(by.xpath('//div[@id=\'mapLegendID\']/div/span'));
        expect(entries.length).toBeGreaterThan(1, 'Legend has no entries');
    });

    it('and correctly load the map', async () => {
        expect(await page.checkDashboardMapExists()).toBe(true);
    });
  });

  describe('should load ctv vm feature', async () => {
    it('table', async () => {
      // At given date, all transfers are assigned
      expect(await element(by.className('table')).isPresent()).toBe(false);
    });
  });
});
