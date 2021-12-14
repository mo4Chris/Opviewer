import { browser, by, element, ExpectedConditions } from 'protractor';
import { E2ePageObject } from '../SupportFunctions/e2epage.support';

const EC = ExpectedConditions;

export class DashboardPage extends E2ePageObject {
    navigateTo() {
        return browser.get('/dashboard');
    }

    async checkDashboardHeader() {
        const headerElt = await element(by.id('DashboardHeader'))
        const isPresent = await headerElt.isPresent();
        expect(isPresent).toBeTruthy();
        return headerElt.getText();
    }

    checkDashboardMapExists() {
        return element(by.id('mapLegendID')).isPresent();
    }

    pageRedirectsDashboard() {
        return browser.wait(EC.urlContains('/dashboard'), 2000);
    }
}
