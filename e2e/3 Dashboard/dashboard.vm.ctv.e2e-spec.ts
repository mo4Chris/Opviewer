import { by, element } from 'protractor';
import { DashboardPage } from './dashboard.po';


describe('VM CTV: Dashboard', () => {
  let page: DashboardPage;

  beforeEach(() => {
    page = new DashboardPage();
    page.navigateTo();
  });

  describe('should load general info', () => {
    it('and not redirect', () => {
        expect(page.pageRedirectsDashboard()).toBe(true);
    });

    it('and have correct title', () => {
        expect(page.checkDashboardHeader()).toMatch('Dashboard');
    });

    it('and have correctly loaded the legend', () => {
        const legend = element(by.id('mapLegendID'));
        expect(legend.isPresent()).toBe(true, 'Legend failed to load');
        const entries = element.all(by.xpath('//div[@id=\'mapLegendID\']/div/span'));
        expect(entries.count()).toBeGreaterThan(1, 'Legend has no entries');
    });

    it('and correctly load the map', () => {
        expect(page.checkDashboardMapExists()).toBe(true);
    });
  });

  describe('should load ctv vm feature', () => {
    it('table', () => {
      // At given date, all transfers are assigned
      expect(element(by.className('table')).isPresent()).toBe(false);
    });
  });
});
