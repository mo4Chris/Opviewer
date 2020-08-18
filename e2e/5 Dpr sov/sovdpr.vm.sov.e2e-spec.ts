import { browser, element, by, ExpectedConditions, ElementFinder, ElementArrayFinder, Key } from 'protractor';
import { SovDprPage, E2eDprInputTableElt } from './sovdpr.po';
import { E2eSelectHandler } from '../SupportFunctions/e2eDropdown.support';

describe('Sov dpr', () => {
    let page: SovDprPage;

    describe('in case of no data', () => {
        beforeEach(() => {
            page = new SovDprPage();
            page.navigateToEmpty();
        })

        it('should not redirect', ()=> {
            expect(page.getUrl()).toMatch('reports/dpr;mmsi')
        })
        it('should display the no data message', () => {
            let noDataMsg = element(by.tagName('h3'))
            expect(noDataMsg.isDisplayed()).toBe(true);
            expect(noDataMsg.getText()).toMatch('There is no map available for the selected day and vessel.')
        });
        it('should disable the summary tab', () => {
            page.clickTabByName('Transfers');
            expect(page.getTabByName('Summary').isEnabled()).toBe(false)
        })
    })

    describe('always', () => {
        beforeEach(() => {
            page = new SovDprPage();
            page.navigateTo();
        })

        it('should load a map', () => {
            expect(page.getMap().isPresent()).toBe(true);
        })
        // Check if route is drawn
        // Check if turbines are drawn
        // Check if zoom is ok
        it('should have working print all button', () => {
            let printButton = page.getPrintFullButton();
            let result = page.clickPrintButton(printButton);
            expect(result).toBe(true);
        })
        it('Should not redirect', ()=> {
            expect(page.getUrl()).toMatch('reports/dpr;mmsi')
        })
        it('Should have all date buttons', ()=> {
            expect(page.getPrevDayButton().isPresent()).toBe(true)
            expect(page.getNextDayButton().isPresent()).toBe(true)
            expect(page.getDatePickerbtn().isPresent()).toBe(true)
            expect(page.getCurrentDateField().isPresent()).toBe(true)
            expect(page.getDatePickerString()).toMatch(/\d{4}-\d{2}-\d{2}/)
        });
        it('should switch dates via buttons', () => {
            let prevDayBtn = page.getPrevDayButton();
            let nextDayBtn = page.getNextDayButton();
            let oriDate    = page.getDatePickerString();
            prevDayBtn.click();
            browser.waitForAngular();
            expect(page.getDatePickerString()).not.toBe(oriDate);
            nextDayBtn.click();
            browser.waitForAngular();
            expect(page.getDatePickerString()).toBe(oriDate);
        })
        it('should switch dates via date picker', () => {
            page.switchDate({
                year: 2019,
                month: 10,
                day: 3
            });
            expect(page.getDatePickerString()).toBe('2019-10-03')
        })
        it('should have vessel switch dropdown disabled', () => {
            let vesselDropdown = page.getVesselDropdown();
            expect(vesselDropdown.isEnabled()).toBe(false);
            expect(vesselDropdown.getText()).toBe('SOV example');
        })
    })

    describe('summary tab', () => {
        beforeEach(() => {
            page = new SovDprPage();
            page.navigateTo();
        })

        it('should be selected on intialization', () => {
            expect(page.getActiveTab().getText()).toMatch('Summary')
        })
        it('should not show NaNs', () => {
            expect(page.getNanCount()).toBe(0);
        })
        it('should render daily stats', () => {
            expect(page.getContainerByTitle('Daily Summary').isDisplayed()).toBe(true)
            expect(page.getValueByCellKey('Distance sailed').getText()).toMatch(/\d+/)
            expect(page.getValueByCellKey('Number of gangway connections').getText()).toMatch(/\d+/)
            let avgDockingTime = page.getValueByCellKey('Number of CTV vessel to vessel transfers');
            expect(avgDockingTime.getText()).toMatch(/\d+/)

            let cell = page.getCellByKey('Number of CTV vessel to vessel transfers');
            expect(cell.isDisplayed()).toBe(true)
            let tooltip = page.getTooltipForElt(cell);
            expect(tooltip.isPresent()).toBe(true, 'Tooltip should render');
            expect(tooltip.getText()).toMatch(/\w+ \w+/, 'Tooltip should render');
        })
        it('should render charts', () => {
            expect(page.summary.getOperationActivityChart().isDisplayed()).toBe(true);
            expect(page.summary.getGangwayLimitationChart().isDisplayed()).toBe(true);
        })
        it('should render weather overview', () => {
            expect(page.getContainerByTitle('Weather overview').isDisplayed()).toBe(true);
            expect(page.summary.getWeatherOverviewChart());
        })
    })

    describe('transfers tab', () => {
        beforeEach(() => {
            page = new SovDprPage();
            page.navigateTo('Transfers');
        })

        it('should have switched tab', () => {
            expect(page.getActiveTab().getText()).toMatch('Transfers')
            expect(page.getContainerByTitle('Daily Summery').isPresent())
                .toBe(false, 'Summary info should no longer be present')
        })
        it('should not show NaNs', () => {
            expect(page.getNanCount()).toBe(0);
        })
        it('should have a proper DC table', () => {
            let dcTable = page.transfer.getDcTable();
            expect(dcTable.isPresent()).toBe(true, 'DC table must be loaded');
            let addMissedTransferBtn = element(by.buttonText('Add missed transfer'))
            expect(addMissedTransferBtn.isPresent()).toBe(true);
            let removeLastMissedTransferBtn = element(by.buttonText('Remove last transfer'))
            expect(removeLastMissedTransferBtn.isPresent()).toBe(true);

            expect(page.transfer.getDcSaveBtn().isDisplayed()).toBe(false);
            page.getInputByPlaceholder('turbine', dcTable).sendKeys('Test turbine');
            expect(page.transfer.getDcSaveBtn().isDisplayed()).toBe(true);
        })
        it('should have a proper Rov ops table', () => {
            let opsTable = page.transfer.getDcTable();
            expect(opsTable.isPresent()).toBe(true, 'Rov ops table must be loaded');
            let addMissedTransferBtn = element(by.buttonText('Add line'))
            expect(addMissedTransferBtn.isPresent()).toBe(true);
            let removeLastMissedTransferBtn = element(by.buttonText('remove last'))
            expect(removeLastMissedTransferBtn.isPresent()).toBe(true);

            expect(page.transfer.getDcSaveBtn().isDisplayed()).toBe(false);
            page.getInputByPlaceholder('Location', opsTable).sendKeys('Test turbine');
            expect(page.transfer.getDcSaveBtn().isDisplayed()).toBe(true);
        })
    })

    fdescribe('DPR input tab', () => {
        beforeEach(() => {
            page = new SovDprPage();
            page.navigateToEmpty('DPR input');
        })

        it('should correctly enter the first table', () => {
            let io = page.dprinput;
            let clearArray = (elt: {rows: ElementArrayFinder, addline: ElementFinder}) => {
                elt.rows.each(e =>  io.removeLine(elt.addline));
            }
            let standby = io.getStandby();
            let techdt = io.getTechnicalDowntime();
            let weatherdt = io.getWeatherDowntime();
            let accessDayType = io.getAccessDayType();
            clearArray(standby);
            clearArray(techdt);
            clearArray(weatherdt);
            expect(standby.rows.count()).toBe(0);
            expect(techdt.rows.count()).toBe(0);
            expect(weatherdt.rows.count()).toBe(0);
            expect(accessDayType.isPresent()).toBe(true);
            io.addLine(standby.addline);
            io.addLine(techdt.addline);
            io.addLine(weatherdt.addline);

            browser.waitForAngular();
            expect(standby.rows.count()).toBe(1);
            expect(techdt.rows.count()).toBe(1);
            expect(weatherdt.rows.count()).toBe(1);
            
            let standbyTimes = io.setRandomTime(standby.rows.first());
            let techTimes = io.setRandomTime(techdt.rows.first());
            let weatherTimes = io.setRandomTime(weatherdt.rows.first());
            let selectHelper = new E2eSelectHandler();
            let selectedAccessType = selectHelper.setNewOption(accessDayType);
            io.saveDprTableByIndex(0);

            page.navigateToEmpty('DPR input');
            expect(standby.rows.count()).toBe(1);
            expect(techdt.rows.count()).toBe(1);
            expect(weatherdt.rows.count()).toBe(1);
            io.checkRowTimes(standby.rows.first(), standbyTimes);
            io.checkRowTimes(techdt.rows.first(), techTimes);
            io.checkRowTimes(weatherdt.rows.first(), weatherTimes);
            expect(selectHelper.getValue(accessDayType)).toBe(selectedAccessType);
        })

        it('should have a functioning reports & toolbox talks table', () => {
            let io = page.dprinput;
            io.getSocCards().each(() => io.rmSocCard());
            io.getToolboxTalks().each(() => io.rmToolboxTalk());
            expect(io.getSocCards().count()).toBe(0);
            expect(io.getToolboxTalks().count()).toBe(0);
            io.addSocCard();
            io.addToolboxTalk();
            let socText = page.rng.getRandomString();
            let tbText = page.rng.getRandomString();
            let socArea = io.getSocCards().first().element(by.tagName('textarea'));
            socArea.sendKeys(socText);
            let tbArea = io.getToolboxTalks().first().element(by.tagName('textarea'));
            tbArea.sendKeys(tbText);
            io.saveSocToolbox();

            page.navigateToEmpty('DPR input');
            expect(io.getSocCards().count()).toBe(1);
            expect(io.getToolboxTalks().count()).toBe(1);
            expect(socArea.getAttribute('value')).toBe(socText);
            expect(tbArea.getAttribute('value')).toBe(tbText);
        })

        it('should have a functioning fuel input', () => {
            let io = page.dprinput;
            let index = page.rng.getRandomInt(0,15);
            let fuelTable = io.getDprInputTable(2);
            let fuelIn = fuelTable.all(by.tagName('input')).get(index);
            let rndFuel = page.rng.getRandomInt(20, 1000).toString();
            fuelIn.clear();
            fuelIn.sendKeys(rndFuel);
            fuelIn.sendKeys(Key.TAB);
            fuelTable.element(by.buttonText('Save')).click();
            browser.waitForAngular();

            page.navigateToEmpty('DPR input');
            expect(fuelIn.getAttribute('value')).toBe(rndFuel);
        })

        it('should have a functioning catering', () => {
            let io = page.dprinput;
            let table = io.getDprInputTable(4);
            let rndFuel = page.rng.getRandomInt(20, 1000).toString();\
            table.element(by.buttonText('Save')).click();
            browser.waitForAngular();

            page.navigateToEmpty('DPR input');
            expect(table.getAttribute('value')).toBe(rndFuel);
        })
    })

    describe('Commercial overview tab', () => {
        beforeEach(() => {
            page = new SovDprPage();
            page.navigateTo('Commercial overview');
        })
    })

    describe('HSE overview', () => {
        beforeEach(() => {
            page = new SovDprPage();
            page.navigateTo('HSE overview');
        })
    })
})