import { browser, by, element, ExpectedConditions } from 'protractor';
import { env } from 'process';

var EC = ExpectedConditions;

export class DashboardPage {
    navigateTo() {
        return browser.get('/dashboard');
    }

    checkDashboardHeader() {
        // return element(by.id('DashboardHeader')).getText();
        return element.all(by.css('h2')).first().getText();
    }

    checkDashboardMapExists() {
        return element(by.id('mapLegendID')).isPresent();
    }
    
    pageRedirectsDashboard() {
        return browser.wait(EC.urlContains('/dashboard'), 2000);
    }
}