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
        fit('should disable the summary tab', () => {
            page.clickTabByName('Transfers');
            let tab = page.getTabByName('Summary');
            expect(page.tabIsEnabled(tab)).toBe(false, 'Summary tab holds no usefull information w/out data')
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
        fit('should have a proper daughtercraft transfer table', () => {
            let dcTable = page.transfer.getDcTable();
            expect(dcTable.isDisplayed()).toBe(true, 'DC table must be loaded');
            let addMissedTransferBtn = element(by.buttonText('Add missed transfer'))
            expect(addMissedTransferBtn.isPresent()).toBe(true);
            let removeLastMissedTransferBtn = element(by.buttonText('Remove last transfer'))
            expect(removeLastMissedTransferBtn.isPresent()).toBe(true);

            expect(page.transfer.getDcSaveBtn().isDisplayed()).toBe(false);
            removeLastMissedTransferBtn.click();
            page.getInputByPlaceholder('turbine', dcTable).sendKeys('Test turbine');
            expect(page.transfer.getDcSaveBtn().isDisplayed()).toBe(true);

            // ToDo: add save / load test
        })
        fit('should have a proper Rov ops table', () => {
            let opsTable = page.transfer.getDcTable();
            expect(opsTable.isPresent()).toBe(true, 'Rov ops table must be loaded');
            let addMissedTransferBtn = element(by.buttonText('Add line'))
            expect(addMissedTransferBtn.isPresent()).toBe(true);
            let removeLastMissedTransferBtn = element(by.buttonText('remove last'))
            expect(removeLastMissedTransferBtn.isPresent()).toBe(true);

            expect(page.transfer.getDcSaveBtn().isDisplayed()).toBe(false);
            removeLastMissedTransferBtn.click();
            page.getInputByPlaceholder('Location', opsTable).sendKeys('Test turbine');
            expect(page.transfer.getDcSaveBtn().isDisplayed()).toBe(true);
            // ToDo: add save / load test
        })

        describe('turbine table', () => {
            let table: ElementFinder;
            beforeEach(() => {
                table = page.transfer.getTurbineTable();
            })

            it('should load properly', () => {
                let turb = page.transfer;
                expect(table.isDisplayed()).toBe(true);
                expect(turb.getPlatformTable().isPresent()).toBe(false);
                let row = turb.getRows(table);

                expect(row.count()).toBeGreaterThan(0);

            })
            it('should allow save pax in/out', () => {
                let turb = page.transfer;
                let row = turb.getRows(table).get(0);
                let rndPaxCargo = turb.getRndpaxCargo();
                let rowCnt = turb.getRows(table).count();
                turb.setPaxCargo(row, rndPaxCargo);
                turb.saveTurbineTransfers();

                page.navigateTo('Transfers');
                expect(turb.getRows(table).count()).toBe(rowCnt);
                let newPax = turb.getPaxCargo(row);
                expect(newPax.paxIn).toBe(rndPaxCargo.paxIn);
                expect(newPax.paxOut).toBe(rndPaxCargo.paxOut);
                expect(newPax.cargoIn).toBe(rndPaxCargo.cargoIn);
                expect(newPax.cargoOut).toBe(rndPaxCargo.cargoOut);
            })
            it('should allow adding heli transfers', () => {
                let turb = page.transfer;
                let helirows = turb.getHeliRows(table);
                helirows.each((_, index) => {
                    if (index > 0 ) {
                        helirows.first().element(by.buttonText('remove last transfer')).click();
                    }
                })
                expect(helirows.count()).toBeGreaterThan(0);
                helirows.first().element(by.buttonText('add helicopter transfer')).click();
                let rndPaxCargo = turb.getRndpaxCargo();
                turb.setPaxCargo(helirows.last(), rndPaxCargo);
                turb.saveTurbineTransfers();

                page.navigateTo('Transfers');
                expect(helirows.count()).toBe(2);
                let hrow = helirows.get(1);
                let newPax = turb.getPaxCargo(hrow);
                expect(newPax.paxIn).toBe(rndPaxCargo.paxIn);
                expect(newPax.paxOut).toBe(rndPaxCargo.paxOut);
                expect(newPax.cargoIn).toBe(rndPaxCargo.cargoIn);
                expect(newPax.cargoOut).toBe(rndPaxCargo.cargoOut);
            })
            it('should allow adding missed transfers', () => {
                let turb = page.transfer;
                let rows = turb.getMissedTransferRows(table);
                rows.each((_, index) => {
                    if (index > 0 ) {
                        rows.first().element(by.buttonText('remove last transfer')).click();
                    }
                })
                expect(rows.count()).toBeGreaterThan(0);
                rows.first().element(by.buttonText('add missed transfer')).click();
                let rndPaxCargo = turb.getRndpaxCargo();
                turb.setPaxCargo(rows.last(), rndPaxCargo);
                let rndLoc = page.rng.getRandomString();
                rows.last().all(by.tagName('input')).get(0).clear();
                rows.last().all(by.tagName('input')).get(0).sendKeys(rndLoc);
                turb.saveTurbineTransfers();

                page.navigateTo('Transfers');
                expect(rows.count()).toBe(2);
                let hrow = rows.get(1);
                let newLoc = hrow.all(by.tagName('input')).get(0).getAttribute('value');
                expect(newLoc).toBe(rndLoc);
                let newPax = turb.getPaxCargo(hrow);
                expect(newPax.paxIn).toBe(rndPaxCargo.paxIn);
                expect(newPax.paxOut).toBe(rndPaxCargo.paxOut);
                expect(newPax.cargoIn).toBe(rndPaxCargo.cargoIn);
                expect(newPax.cargoOut).toBe(rndPaxCargo.cargoOut);
            })
        })
    })

    describe('platform table', () => {
        let table: ElementFinder;
        beforeEach(() => {
            page = new SovDprPage();
            page.navigateToPlatform('Transfers');
            table = page.transfer.getPlatformTable();
        })

        it('should load properly', () => {
            let turb = page.transfer;
            expect(page.getNanCount()).toBe(0);
            expect(table.isDisplayed()).toBe(true);
            expect(turb.getTurbineTable().isPresent()).toBe(false);
            let row = turb.getRows(table);

            expect(row.count()).toBeGreaterThan(0);

        })
        it('should allow save pax in/out', () => {
            let turb = page.transfer;
            let row = turb.getRows(table).get(0);
            let rndPaxCargo = turb.getRndpaxCargo();
            let rowCnt = turb.getRows(table).count();
            turb.setPaxCargo(row, rndPaxCargo);
            turb.savePlatformTransfers();

            page.navigateToPlatform('Transfers');
            expect(turb.getRows(table).count()).toBe(rowCnt);
            let newPax = turb.getPaxCargo(row);
            expect(newPax.paxIn).toBe(rndPaxCargo.paxIn);
            expect(newPax.paxOut).toBe(rndPaxCargo.paxOut);
            expect(newPax.cargoIn).toBe(rndPaxCargo.cargoIn);
            expect(newPax.cargoOut).toBe(rndPaxCargo.cargoOut);
        })
        it('should allow adding heli transfers', () => {
            let turb = page.transfer;
            let helirows = turb.getHeliRows(table);
            helirows.each((_, index) => {
                if (index > 0 ) {
                    helirows.first().element(by.buttonText('remove last transfer')).click();
                }
            })
            expect(helirows.count()).toBeGreaterThan(0);
            helirows.first().element(by.buttonText('add helicopter transfer')).click();
            let rndPaxCargo = turb.getRndpaxCargo();
            turb.setPaxCargo(helirows.last(), rndPaxCargo);
            turb.savePlatformTransfers();

            page.navigateToPlatform('Transfers');
            expect(helirows.count()).toBe(2);
            let hrow = helirows.get(1);
            let newPax = turb.getPaxCargo(hrow);
            expect(newPax.paxIn).toBe(rndPaxCargo.paxIn);
            expect(newPax.paxOut).toBe(rndPaxCargo.paxOut);
            expect(newPax.cargoIn).toBe(rndPaxCargo.cargoIn);
            expect(newPax.cargoOut).toBe(rndPaxCargo.cargoOut);
        })
        it('should allow adding missed transfers', () => {
            let turb = page.transfer;
            let rows = turb.getMissedTransferRows(table);
            rows.each((_, index) => {
                if (index > 0 ) {
                    rows.first().element(by.buttonText('remove last transfer')).click();
                }
            })
            expect(rows.count()).toBeGreaterThan(0);
            rows.first().element(by.buttonText('add missed transfer')).click();
            let rndPaxCargo = turb.getRndpaxCargo();
            turb.setPaxCargo(rows.last(), rndPaxCargo);
            let rndLoc = page.rng.getRandomString();
            rows.last().all(by.tagName('input')).get(0).clear();
            rows.last().all(by.tagName('input')).get(0).sendKeys(rndLoc);
            turb.savePlatformTransfers();

            page.navigateToPlatform('Transfers');
            expect(rows.count()).toBe(2);
            let hrow = rows.get(1);
            let newLoc = hrow.all(by.tagName('input')).get(0).getAttribute('value');
            expect(newLoc).toBe(rndLoc);
            let newPax = turb.getPaxCargo(hrow);
            expect(newPax.paxIn).toBe(rndPaxCargo.paxIn);
            expect(newPax.paxOut).toBe(rndPaxCargo.paxOut);
            expect(newPax.cargoIn).toBe(rndPaxCargo.cargoIn);
            expect(newPax.cargoOut).toBe(rndPaxCargo.cargoOut);
        })
    })

    describe('DPR input tab', () => {
        beforeEach(() => {
            page = new SovDprPage();
            page.navigateToEmpty('DPR input');
        })

        it('should load both tables', () => {
            let io = page.dprinput;
            expect(io.dprInput.isDisplayed()).toBe(true)
            expect(io.hseInput.isDisplayed()).toBe(true)
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
            expect(socArea.isPresent()).toBe(true);
            socArea.sendKeys(socText);
            let tbArea = io.getToolboxTalks().first().element(by.tagName('textarea'));
            expect(tbArea.isPresent()).toBe(true);
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
            let table = io.getDprInputTable(3);
            let rndMeals = page.rng.getRandomInt(1, 100).toString();
            let cateringInput = table.all(by.tagName('input')).get(2);
            cateringInput.clear();
            cateringInput.sendKeys(rndMeals);
            table.element(by.buttonText('Save')).click();
            browser.waitForAngular();

            page.navigateToEmpty('DPR input');
            expect(cateringInput.getAttribute('value')).toBe(rndMeals);
        })
        it('should have a functioning dp usage', () => {
            // Geen zin in
        })
        it('should have proper remarks', () => {
            let io = page.dprinput;
            let table = io.getDprInputTable(5);
            let remark = page.rng.getRandomString();
            let remarkField = table.element(by.tagName('textarea'))
            remarkField.clear();
            remarkField.sendKeys(remark);
            table.element(by.buttonText('Save remarks')).click();
            browser.waitForAngular();

            page.navigateToEmpty('DPR input');
            expect(remarkField.getAttribute('value')).toBe(remark);
        })
        fit('should save at least 1 hse input value', () => {
            let hse = page.dprinput.hseInput;
            expect(hse.isDisplayed()).toBe(true)
            let cnt = hse.all(by.tagName('input')).first();
            let txt = hse.all(by.tagName('textarea')).first();
            let rndTxt = page.rng.getRandomString();
            let rndCnt = page.rng.getRandomInt(1, 20);
            cnt.clear();
            cnt.sendKeys(rndCnt);
            txt.clear();
            txt.sendKeys(rndTxt);
            hse.element(by.buttonText('Save HSE input')).click();
            browser.waitForAngular();

            page.navigateTo('DPR input');
            expect(cnt.getText()).toBe(rndCnt.toString())
            expect(txt.getText()).toBe(rndTxt.toString())
        })
    })

    describe('Commercial overview tab', () => {
        beforeEach(() => {
            page = new SovDprPage();
            page.navigateTo('Commercial overview');
        })

        it('should have proper data', () => {
            let io = page.dprinput;
            expect(io.getStandby().rows.count()).toBeGreaterThan(0)
            expect(io.getTechnicalDowntime().rows.count()).toBeGreaterThan(0)
            expect(io.getWeatherDowntime().rows.count()).toBeGreaterThan(0)
        })
    })

    describe('HSE overview', () => {
        beforeEach(() => {
            page = new SovDprPage();
            page.navigateTo('HSE overview');
        })

        it('Should have proper data', () => {
            expect(page.getNanCount()).toBe(0);
        })
    })
})