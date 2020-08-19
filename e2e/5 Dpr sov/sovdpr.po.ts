import { browser, element, by, ElementFinder, ElementArrayFinder } from "protractor";
import { env } from "process";
import { E2eDropdownHandler, E2eSelectHandler } from "../SupportFunctions/e2eDropdown.support";
import { E2ePageObject } from "../SupportFunctions/e2epage.support";
import { E2eDatePicker } from "../SupportFunctions/e2eDatepicker.support";
import { E2eRandomTools } from "../SupportFunctions/e2eRandom.support";

var dropdownHandler = new E2eDropdownHandler();
export class SovDprPage extends E2ePageObject {
    summary = new SovDprSummaryTab();
    transfer = new SovDprTransferTab();
    dprinput = new SovDprInputTab();

    navigateTo(tab?: string) {
        browser.get(env.baseUrl + '/reports/dpr;mmsi=987654321;date=737700');
        if (tab) {
            this.clickTabByName(tab);
        }
    }
    navigateToEmpty(tab?: string) { 
        browser.get(env.baseUrl + '/reports/dpr;mmsi=987654321;date=737701');
        if (tab) {
            this.clickTabByName(tab);
        }
    }
    navigateToLatest(tab?: string) {
        browser.get(env.baseUrl + '/reports/dpr;mmsi=987654321');
        if (tab) {
            this.clickTabByName(tab);
        }
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
        let helper = E2eDatePicker.open();
        helper.setDate(date);
    }

    getVesselDropdown() {
        return element(by.name('selectVessel'));
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
        let headerDiv = element(by.xpath('//div[contains(@class,"card-header") and contains(text(),"' + name + '")]'))
        return headerDiv.element(by.xpath('../..'))
    }
    getV2vTable() {
        return this.getContainerByTitle('Vessel Transfers')
    }
    getDcTable() {
        return this.getContainerByTitle('Turbine transfers for daughtercraft');
    }
    getDcSaveBtn() {
        return this.getDcTable().element(by.buttonText('Save all transfers'));
    }
    getRovTable() {
        return this.getContainerByTitle('ROV Operations');
    }
    getTurbineTable() {
        return element(by.id("sovTurbineTransfers"))
    }
    getPlatformTable() {
        return this.getContainerByTitle('Platform transfers');
    }
    getGangwayTable() {
        return this.getContainerByTitle('Gangway usage');
    }
    getCycleTimeTable() {
        return this.getContainerByTitle('Cycle Times');
    }

    setPaxCargo(row: ElementFinder, input: {paxIn: number, paxOut: number, cargoIn: number, cargoOut: number}) {
        
    }
    getPaxCargo(row: ElementFinder) {
        return  {
            // paxIn: row.element(by.binding('paxIn')).getAttribute('value'),
        }
    }
    getHeader(table: ElementFinder) {
        return table.all(by.xpath('.//thead/tr'));
    }
    getRows(table: ElementFinder) {
        return table.all(by.xpath('.//tbody/tr'));
    }
    getHeliRows(table: ElementFinder) {
        // return table.element(by.xpath('tr/th[contains(text(),"Helicopter")]/..'))
        let rows = table.element(by.name('heli'));
    }
}

class SovDprInputTab {
    private getContainerByTitle(name: string) {
        return element(by.xpath('//div[contains(@class,"card-header") and contains(text(),"' + name + '")]'))
    }
    private hrs     = this.initTimeOpts();
    public dprInput = this.getContainerByTitle('DPR input');
    public hseInput = this.getContainerByTitle('Additional HSE inputs');

    private initTimeOpts() {
        const quarterHours = ['00', '15', '30', '45'];
        const times = [];
        for (let i = 0; i < 24; i++) {
            for (let j = 0; j < 4; j++) {
                let time = i + ':' + quarterHours[j];
                if (i < 10) {
                    time = '0' + time;
                }
                times.push(time);
            }
        }
        times.push('24:00');
        return times;
    }
    setRandomTime(row: ElementFinder) {
        let rng = new E2eRandomTools();
        let drp = new E2eSelectHandler();
        let start: number, stop: number;
        let a = rng.getRandomInt(0, 96);
        let b = rng.getRandomInt(0, 95);
        if (a < b) {
            start = a;
            stop = b + 1;
        } else if (a ==b) {
            start = a;
            stop = b + 1;
        } else {
            start = b;
            stop = a;
        }
        let selects = row.all(by.xpath('./td/select'));
        drp.setValueByIndex(selects.get(1), start);
        drp.setValueByIndex(selects.get(2), stop);
        return {
            start: this.hrs[start],
            stop: this.hrs[stop],
        }
    }
    addLine(row: ElementFinder) {
        // row.element(by.xpath('//button[text()="add line"]')).click();
        row.element(by.buttonText('add line')).click();
    }
    removeLine(row: ElementFinder) {
        row.element(by.buttonText('remove last')).click();
    }
    saveTable(tab: ElementFinder) {
        tab.element(by.buttonText('Save')).click();
    }

    getDprInputTable(index: number) {
        return this.dprInput.all(by.xpath('.//table/tbody')).get(index);
    }
    getHseInputTable(index: number) {
        return this.hseInput.all(by.xpath('.//table/tbody')).get(index);
    }
    getStandby(): E2eDprInputTableElt {
        return {
            rows: element.all(by.name('standby-array')),
            addline: element(by.name('standby-addrow')),
        }
    }
    getTechnicalDowntime(): E2eDprInputTableElt {
        return {
            rows: element.all(by.name('tdt-array')),
            addline: element(by.name('tdt-addrow')),
        }
    }
    getWeatherDowntime(): E2eDprInputTableElt {
        return {
            rows: element.all(by.name('wdt-array')),
            addline: element(by.name('wdt-addrow')),
        }
    }
    getAccessDayType() {
        return element(by.id('accessDayType')).element(by.xpath('./td'));
    }
    saveDprTableByIndex(index: number = 0) {
        this.getDprInputTable(index).element(by.buttonText('Save')).click();
        browser.waitForAngular();
    }
    checkRowTimes(row: ElementFinder, t: {start: string, stop: string}) {
        let inputs = row.all(by.xpath('./td/select'))
        expect(inputs.count()).toBeGreaterThanOrEqual(3);
        expect(inputs.get(1).getAttribute('value')).toBe(t.start)
        expect(inputs.get(2).getAttribute('value')).toBe(t.stop)
    }

    private getSocRow() {
        return element(by.id('socCards'));
    }
    addSocCard() {
        this.getSocRow().element(by.buttonText('add line')).click();
    }
    rmSocCard() {
        this.getSocRow().element(by.buttonText('remove last')).click();
    }
    getSocCards() {
        return this.getSocRow().all(by.className('tableRow'))
    }
    private getToolboxRow() {
        return element(by.id('toolboxTalks'));
    }
    addToolboxTalk() {
        this.getToolboxRow().element(by.buttonText('add line')).click();
    }
    rmToolboxTalk() {
        this.getToolboxRow().element(by.buttonText('remove last')).click();
    }
    getToolboxTalks() {
        return this.getToolboxRow().all(by.className('tableRow'))
    }
    saveSocToolbox() {
        this.saveDprTableByIndex(1);
    }
}

export interface E2eDprInputTableElt {
    rows: ElementArrayFinder,
    addline: ElementFinder,
}