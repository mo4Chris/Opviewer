import { browser, element, by, ElementFinder, ElementArrayFinder } from "protractor";
import { env } from "process";
import { E2eDropdownHandler } from "../SupportFunctions/e2eDropdown.support";
import { E2ePageObject } from "../SupportFunctions/e2epage.support";
import { E2eDatePicker } from "../SupportFunctions/e2eDatepicker.support";

var dropdownHandler = new E2eDropdownHandler();
export class SovDprPage extends E2ePageObject {
    summary = new SovDprSummaryTab();
    transfer = new SovDprTransferTab();

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

    getPrevDayButton() {
        return element(by.id('prevDayButton'))
    }
    getCurrentDateField() {
        return element(by.xpath('//div[contains(@class, "datepicker-input")]/input'));
    }
    getDatePickerbtn() {
        return element(by.id('datePickBtn'))
    }
    getDatePickerString() {
        return this.getCurrentDateField().getAttribute('value');
    }
    getNextDayButton() {
        return element(by.id('nextDayButton'))
    }
    switchDate(date: {year: number, month: number, day: number}) {
        let pickerBtn = this.getDatePickerbtn();
        pickerBtn.click();
        let picker = element(by.tagName('ngb-datepicker'));
        let helper = new E2eDatePicker(picker);
        helper.setDate(date);
    }
} 

class SovDprSummaryTab {
    getOperationActivityChart() {
        return element(by.id('operationalStats'));
    }
    getGangwayLimitationChart() {
        return element(by.id('gangwayLimitations'));
    }
    getWeatherOverviewChart() {
        return element(by.id('weatherOverview'));
    }
}

class SovDprTransferTab {
    private getContainerByTitle(name: string) {
        return element(by.xpath('//div[contains(@class,"card-header") and contains(text(),"' + name + '")]'))
    }
    getV2vPresent() {
        return this.getContainerByTitle('Vessel Transfers').isPresent();
    }
    getDcPresent() {
        return this.getContainerByTitle('Turbine transfers for daughtercraft').isPresent();
    }
    getRovPresent() {
        return this.getContainerByTitle('ROV Operations').isPresent();
    }
    getTurbinePresent() {
        return this.getContainerByTitle('Turbine transfers').isPresent();
    }
    getPlatformPresent() {
        return this.getContainerByTitle('Platform transfers').isPresent();
    }
    getGangwayPresent() {
        return this.getContainerByTitle('Gangway usage').isPresent();
    }
    getCycleTimePresent() {
        return this.getContainerByTitle('Cycle Times').isPresent();
    }
}