import { browser, element, by } from 'protractor';
import { DashboardPage } from './dashboard.po';

describe('Dashboard', () => {
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
            const header = await page.checkDashboardHeader();
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

    describe('Should have admin-specific features', () => {
        it('Should show number of active account', async () => {
            await page.navigateTo();
            let numAccounts = await element(by.id('num_active_accounts')).getText();
            expect(+numAccounts).toBeGreaterThan(5);
        })
    })
});
