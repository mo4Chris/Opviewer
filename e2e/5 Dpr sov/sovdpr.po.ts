import { browser, element, by, ElementFinder, ElementArrayFinder } from "protractor";
import { env } from "process";
import { E2eDropdownHandler } from "../SupportFunctions/e2eDropdown.support";
import { E2ePageObject } from "../SupportFunctions/e2epage.support";

var dropdownHandler = new E2eDropdownHandler();
export class SovDprPage extends E2ePageObject {

    navigateTo() {
        browser.get(env.baseUrl + '/reports/dpr;mmsi=987654321;date=737700');
    }
    navigateToEmpty() { 
        browser.get(env.baseUrl + '/reports/dpr;mmsi=987654321;date=737701');
    }
    navigateToLatest() {
        browser.get(env.baseUrl + '/reports/dpr;mmsi=987654321');
    }

    getMap() {
        return element(by.tagName('agm-map'));
    }
    getDate() {
        throw ('To be done!')
    }

    getPrintFullButton() {
        return element(by.buttonText('Print DPR Full'))
    }
    getCurrentPrintMode() {
        throw ('To be done!')
        // return element(by.binding('printMode')).getText();
    }
    clickPrintButton(printButton: ElementFinder) {
        let printIsClicked = browser.executeAsyncScript(function (elm, callback) {
            function listener() {
                callback(true);
            }
            window.print = listener;
            elm.click();
        }, printButton.getWebElement());
        return printIsClicked;
    }

    getDropdownValue(dropdown: ElementFinder) {
        return dropdownHandler.getValue(dropdown);
    }
    getButtonValue(btn: ElementFinder) {
        // We add getValue as function to the returned promise
        return btn.getAttribute('value');
    }
    getContainerByTitle(name: string) {
        return element(by.xpath('//div[contains(@class,"card-header") and contains(text(),"' + name + '")]'))
    }
    
    getTabEnabledByName(name: string) {
        return this.getTabByName(name).isEnabled();
    }
    getTabPresentByName(name: string) {
        return this.getTabByName(name).isPresent();
    }
    getTabByName(name: string) {
        return element(by.xpath("//li/a[contains(text(),'" + name + "')]"))
    }
    clickTab(tab: ElementFinder) {
        tab.click();
        browser.waitForAngular();
    }
    getActiveTab() {
        return element(by.xpath("//li/a[contains(@class, 'active')]"));
    }
    clickTabByName(name: string) {
        this.clickTab(this.getTabByName(name));
    }

    getOperationActivityChart() {
        return element(by.id('operationalStats'));
    }
    getGangwayLimitationChart() {
        return element(by.id('gangwayLimitations'));
    }
    getWeatherOverviewChart() {

    }
} 