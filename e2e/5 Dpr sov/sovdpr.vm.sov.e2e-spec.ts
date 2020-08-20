import { browser, element, by, ExpectedConditions, ElementFinder, ElementArrayFinder, Key } from 'protractor';
import { SovDprPage, E2eDprInputTableElt } from './sovdpr.po';
import { E2eSelectHandler } from '../SupportFunctions/e2eDropdown.support';

describe('Sov dpr', () => {
    let page: SovDprPage;
    afterEach(() => {
      page.validateNoConsoleLogs();
    });

    describe('in case of no data', () => {
        beforeEach(() => {
            page = new SovDprPage();
            page.navigateToEmpty();
        });

        it('should not redirect', () => {
            expect(page.getUrl()).toMatch('reports/dpr;mmsi');
        });
        it('should display the no data message', () => {
            const noDataMsg = element(by.tagName('h3'));
            expect(noDataMsg.isDisplayed()).toBe(true);
            expect(noDataMsg.getText()).toMatch('There is no map available for the selected day and vessel.');
        });
        it('should disable the summary tab', () => {
            page.clickTabByName('Transfers');
            expect(page.getTabByName('Summary').isEnabled()).toBe(false);
        });
    });

    describe('always', () => {
        beforeEach(() => {
            page = new SovDprPage();
            page.navigateTo();
        });

        it('should load a map', () => {
            expect(page.getMap().isPresent()).toBe(true);
        });
        // Check if route is drawn
        // Check if turbines are drawn
        // Check if zoom is ok
        it('should have working print all button', () => {
            const printButton = page.getPrintFullButton();
            const result = page.clickPrintButton(printButton);
            expect(result).toBe(true);
        });
        it('Should not redirect', () => {
            expect(page.getUrl()).toMatch('reports/dpr;mmsi');
        });
        it('Should have all date buttons', () => {
            expect(page.getPrevDayButton().isPresent()).toBe(true);
            expect(page.getNextDayButton().isPresent()).toBe(true);
            expect(page.getDatePickerbtn().isPresent()).toBe(true);
            expect(page.getCurrentDateField().isPresent()).toBe(true);
            expect(page.getDatePickerString()).toMatch(/\d{4}-\d{2}-\d{2}/);
        });
        it('should switch dates via buttons', () => {
            const prevDayBtn = page.getPrevDayButton();
            const nextDayBtn = page.getNextDayButton();
            const oriDate    = page.getDatePickerString();
            prevDayBtn.click();
            browser.waitForAngular();
            expect(page.getDatePickerString()).not.toBe(oriDate);
            nextDayBtn.click();
            browser.waitForAngular();
            expect(page.getDatePickerString()).toBe(oriDate);
        });
        it('should switch dates via date picker', () => {
            page.switchDate({
                year: 2019,
                month: 10,
                day: 3
            });
            expect(page.getDatePickerString()).toBe('2019-10-03');
        });
        it('should have vessel switch dropdown disabled', () => {
            const vesselDropdown = page.getVesselDropdown();
            expect(vesselDropdown.isEnabled()).toBe(false);
            expect(vesselDropdown.getText()).toBe('SOV example');
        });
    });

    describe('summary tab', () => {
        beforeEach(() => {
            page = new SovDprPage();
            page.navigateTo();
        });

        it('should be selected on intialization', () => {
            expect(page.getActiveTab().getText()).toMatch('Summary');
        });
        it('should not show NaNs', () => {
            expect(page.getNanCount()).toBe(0);
        });
        it('should render daily stats', () => {
            expect(page.getContainerByTitle('Daily Summary').isDisplayed()).toBe(true);
            expect(page.getValueByCellKey('Distance sailed').getText()).toMatch(/\d+/);
            expect(page.getValueByCellKey('Number of gangway connections').getText()).toMatch(/\d+/);
            const avgDockingTime = page.getValueByCellKey('Number of CTV vessel to vessel transfers');
            expect(avgDockingTime.getText()).toMatch(/\d+/);

            const cell = page.getCellByKey('Number of CTV vessel to vessel transfers');
            expect(cell.isDisplayed()).toBe(true);
            const tooltip = page.getTooltipForElt(cell);
            expect(tooltip.isPresent()).toBe(true, 'Tooltip should render');
            expect(tooltip.getText()).toMatch(/\w+ \w+/, 'Tooltip should render');
        });
        it('should render charts', () => {
            expect(page.summary.getOperationActivityChart().isDisplayed()).toBe(true);
            expect(page.summary.getGangwayLimitationChart().isDisplayed()).toBe(true);
        });
        it('should render weather overview', () => {
            expect(page.getContainerByTitle('Weather overview').isDisplayed()).toBe(true);
            expect(page.summary.getWeatherOverviewChart());
        });
    });

    describe('transfers tab', () => {
        beforeEach(() => {
            page = new SovDprPage();
            page.navigateTo('Transfers');
        });

        it('should have switched tab', () => {
            expect(page.getActiveTab().getText()).toMatch('Transfers');
            expect(page.getContainerByTitle('Daily Summery').isPresent())
                .toBe(false, 'Summary info should no longer be present');
        });
        it('should not show NaNs', () => {
            expect(page.getNanCount()).toBe(0);
        });
        it('should have a proper DC table', () => {
            const dcTable = page.transfer.getDcTable();
            expect(dcTable.isPresent()).toBe(true, 'DC table must be loaded');
            const addMissedTransferBtn = element(by.buttonText('Add missed transfer'));
            expect(addMissedTransferBtn.isPresent()).toBe(true);
            const removeLastMissedTransferBtn = element(by.buttonText('Remove last transfer'));
            expect(removeLastMissedTransferBtn.isPresent()).toBe(true);

            expect(page.transfer.getDcSaveBtn().isDisplayed()).toBe(false);
            page.getInputByPlaceholder('turbine', dcTable).sendKeys('Test turbine');
            expect(page.transfer.getDcSaveBtn().isDisplayed()).toBe(true);
        });
        it('should have a proper Rov ops table', () => {
            const opsTable = page.transfer.getDcTable();
            expect(opsTable.isPresent()).toBe(true, 'Rov ops table must be loaded');
            const addMissedTransferBtn = element(by.buttonText('Add line'));
            expect(addMissedTransferBtn.isPresent()).toBe(true);
            const removeLastMissedTransferBtn = element(by.buttonText('remove last'));
            expect(removeLastMissedTransferBtn.isPresent()).toBe(true);

            expect(page.transfer.getDcSaveBtn().isDisplayed()).toBe(false);
            page.getInputByPlaceholder('Location', opsTable).sendKeys('Test turbine');
            expect(page.transfer.getDcSaveBtn().isDisplayed()).toBe(true);
        });

        fdescribe('turbine table', () => {
            let table: ElementFinder;
            beforeEach(() => {
                table = page.transfer.getTurbineTable();
            });

            it('should load properly', () => {
                const turb = page.transfer;
                expect(table.isDisplayed()).toBe(true);
                expect(turb.getPlatformTable().isPresent()).toBe(false);
                const row = turb.getRows(table);

                expect(row.count()).toBeGreaterThan(0);
                // let paxcargo = turb.getPaxCargo(row.first());

            });
            fit('should allow adding heli transfers', () => {
                const turb = page.transfer;
                const helirows = turb.getHeliRows(table);
                expect(helirows.count()).toBe(5);
            });
        });
    });

    describe('DPR input tab', () => {
        beforeEach(() => {
            page = new SovDprPage();
            page.navigateToEmpty('DPR input');
        });

        it('should correctly enter the first table', () => {
            const io = page.dprinput;
            const clearArray = (elt: {rows: ElementArrayFinder, addline: ElementFinder}) => {
                elt.rows.each(e =>  io.removeLine(elt.addline));
            };
            const standby = io.getStandby();
            const techdt = io.getTechnicalDowntime();
            const weatherdt = io.getWeatherDowntime();
            const accessDayType = io.getAccessDayType();
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

            const standbyTimes = io.setRandomTime(standby.rows.first());
            const techTimes = io.setRandomTime(techdt.rows.first());
            const weatherTimes = io.setRandomTime(weatherdt.rows.first());
            const selectHelper = new E2eSelectHandler();
            const selectedAccessType = selectHelper.setNewOption(accessDayType);
            io.saveDprTableByIndex(0);

            page.navigateToEmpty('DPR input');
            expect(standby.rows.count()).toBe(1);
            expect(techdt.rows.count()).toBe(1);
            expect(weatherdt.rows.count()).toBe(1);
            io.checkRowTimes(standby.rows.first(), standbyTimes);
            io.checkRowTimes(techdt.rows.first(), techTimes);
            io.checkRowTimes(weatherdt.rows.first(), weatherTimes);
            expect(selectHelper.getValue(accessDayType)).toBe(selectedAccessType);
        });
        it('should have a functioning reports & toolbox talks table', () => {
            const io = page.dprinput;
            io.getSocCards().each(() => io.rmSocCard());
            io.getToolboxTalks().each(() => io.rmToolboxTalk());
            expect(io.getSocCards().count()).toBe(0);
            expect(io.getToolboxTalks().count()).toBe(0);
            io.addSocCard();
            io.addToolboxTalk();
            const socText = page.rng.getRandomString();
            const tbText = page.rng.getRandomString();
            const socArea = io.getSocCards().first().element(by.tagName('textarea'));
            socArea.sendKeys(socText);
            const tbArea = io.getToolboxTalks().first().element(by.tagName('textarea'));
            tbArea.sendKeys(tbText);
            io.saveSocToolbox();

            page.navigateToEmpty('DPR input');
            expect(io.getSocCards().count()).toBe(1);
            expect(io.getToolboxTalks().count()).toBe(1);
            expect(socArea.getAttribute('value')).toBe(socText);
            expect(tbArea.getAttribute('value')).toBe(tbText);
        });
        it('should have a functioning fuel input', () => {
            const io = page.dprinput;
            const index = page.rng.getRandomInt(0, 15);
            const fuelTable = io.getDprInputTable(2);
            const fuelIn = fuelTable.all(by.tagName('input')).get(index);
            const rndFuel = page.rng.getRandomInt(20, 1000).toString();
            fuelIn.clear();
            fuelIn.sendKeys(rndFuel);
            fuelIn.sendKeys(Key.TAB);
            fuelTable.element(by.buttonText('Save')).click();
            browser.waitForAngular();

            page.navigateToEmpty('DPR input');
            expect(fuelIn.getAttribute('value')).toBe(rndFuel);
        });
        it('should have a functioning catering', () => {
            const io = page.dprinput;
            const table = io.getDprInputTable(3);
            const rndMeals = page.rng.getRandomInt(1, 100).toString();
            const cateringInput = table.all(by.tagName('input')).get(2);
            cateringInput.clear();
            cateringInput.sendKeys(rndMeals);
            table.element(by.buttonText('Save')).click();
            browser.waitForAngular();

            page.navigateToEmpty('DPR input');
            expect(cateringInput.getAttribute('value')).toBe(rndMeals);
        });
        it('should have a functioning dp usage', () => {
            // Geen zin in
        });
        it('should have proper remarks', () => {
            const io = page.dprinput;
            const table = io.getDprInputTable(5);
            const remark = page.rng.getRandomString();
            const remarkField = table.element(by.tagName('textarea'));
            remarkField.clear();
            remarkField.sendKeys(remark);
            table.element(by.buttonText('Save remarks')).click();
            browser.waitForAngular();

            page.navigateToEmpty('DPR input');
            expect(remarkField.getAttribute('value')).toBe(remark);
        });
    });

    describe('Commercial overview tab', () => {
        beforeEach(() => {
            page = new SovDprPage();
            page.navigateTo('Commercial overview');
        });

        it('should have proper data', () => {
            const io = page.dprinput;
            expect(io.getStandby().rows.count()).toBeGreaterThan(0);
            expect(io.getTechnicalDowntime().rows.count()).toBeGreaterThan(0);
            expect(io.getWeatherDowntime().rows.count()).toBeGreaterThan(0);
        });
    });

    describe('HSE overview', () => {
        beforeEach(() => {
            page = new SovDprPage();
            page.navigateTo('HSE overview');
        });

        it('Should have proper data', () => {
            expect(page.getNanCount()).toBe(0);
        });
    });
});
