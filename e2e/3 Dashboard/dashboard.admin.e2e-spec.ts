import { browser, element, by } from 'protractor';
import { DashboardPage } from './dashboard.po';

describe('Dashboard', () => {
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

    // describe('Should have admin-specific features', () => {
    //     it('Should show number of active account', () => {
    //         page.navigateTo();
    //         let numAccounts = element(by.binding('num_active_accounts')).getText();
    //         expect(+numAccounts).toBeGreaterThan(5);
    //     })
    // })
});
