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
            let tab = page.getTabByName('Summary');
            expect(page.tabIsEnabled(tab)).toBe(false, 'Summary tab holds no usefull information w/out data')
        })
    })

    describe('should always', () => {
        beforeEach(() => {
            page = new SovDprPage();
            page.navigateTo();
        });

        it('load a map', () => {
            expect(page.getMap().isPresent()).toBe(true);
        });
        // Check if route is drawn
        // Check if turbines are drawn
        // Check if zoom is ok
        it('have a working print all button', () => {
            const printButton = page.getPrintFullButton();
            expect(printButton.isPresent()).toBe(true);
            const result = page.clickPrintButton(printButton);
            expect(result).toBe(true);
        });
        it('not redirect', () => {
            expect(page.getUrl()).toMatch('reports/dpr;mmsi');
        });
        it('have a valid date switch interface', () => {
            expect(page.getPrevDayButton().isPresent()).toBe(true);
            expect(page.getNextDayButton().isPresent()).toBe(true);
            expect(page.getDatePickerbtn().isPresent()).toBe(true);
            expect(page.getCurrentDateField().isPresent()).toBe(true);
            expect(page.getDatePickerString()).toMatch(/\d{4}-\d{2}-\d{2}/);
        });
        it('switch dates via buttons', () => {
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
            let tab = page.getTabByName('Summary');
            expect(page.tabIsEnabled(tab)).toBe(true)
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
            const addMissedTransferBtn = dcTable.element(by.buttonText('Add missed transfer'));
            expect(addMissedTransferBtn.isPresent()).toBe(true);
            const removeLastMissedTransferBtn = dcTable.element(by.buttonText('Remove last transfer'));
            expect(removeLastMissedTransferBtn.isPresent()).toBe(true);

            expect(page.transfer.getDcSaveBtn().isPresent()).toBe(false);
            removeLastMissedTransferBtn.click();
            page.getInputByPlaceholder('turbine', dcTable).sendKeys('Test turbine');
            expect(page.transfer.getDcSaveBtn().isDisplayed()).toBe(true);
            // ToDo: add save / load test
        });
        it('should have a proper Rov ops table', () => {
            const opsTable = page.transfer.getRovTable();
            expect(opsTable.isPresent()).toBe(true, 'Rov ops table must be loaded');
            const addMissedTransferBtn = opsTable.element(by.buttonText('add line'));
            expect(addMissedTransferBtn.isPresent()).toBe(true, 'Must have add line btn');
            const removeLastMissedTransferBtn = opsTable.element(by.buttonText('remove last'));
            expect(removeLastMissedTransferBtn.isPresent()).toBe(true, 'Must have remove last line btn');

            removeLastMissedTransferBtn.click();
            addMissedTransferBtn.click();
            let LocationInput = page.getInputByPlaceholder('Location', opsTable)
            expect(LocationInput.isPresent()).toBe(true, 'Location input must be present')
            LocationInput.sendKeys('Test turbine');
            expect(page.transfer.getRovSaveBtn().isPresent()).toBe(true, 'Save btn should be enabled');
            // ToDo: add save / load test
        });

        describe('turbine table', () => {
            let table: ElementFinder;
            beforeEach(() => {
                table = page.transfer.getTurbineTable();
            });

            it('should load properly', () => {
                const turb = page.transfer;
                expect(table.isPresent()).toBe(true);
                expect(turb.getPlatformTable().isPresent()).toBe(false);
                const row = turb.getRows(table);
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
        });

        it('should load both tables', () => {
            let io = page.dprinput;
            expect(io.dprInput.isDisplayed()).toBe(true)
            expect(io.hseInput.isDisplayed()).toBe(true)
        })
        it('should correctly enter the first table', (done) => {
            const io = page.dprinput;
            const selectHelper = new E2eSelectHandler();
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
            const selectedAccessType = selectHelper.setNewOption(accessDayType);
            io.dprInput.click(); // Required to trigger change detection on closing the window
            browser.waitForAngular();
            io.saveDprTableByIndex(0);
            browser.waitForAngular();

            page.navigateToEmpty('DPR input');
            expect(standby.rows.count()).toBe(1);
            expect(techdt.rows.count()).toBe(1);
            expect(weatherdt.rows.count()).toBe(1);
            io.checkRowTimes(standby.rows.first(), standbyTimes);
            io.checkRowTimes(techdt.rows.first(), techTimes);
            io.checkRowTimes(weatherdt.rows.first(), weatherTimes);
            expect(selectHelper.getValue(accessDayType)).toBe(selectedAccessType);
            done();
        }, 60000);
        it('should have a functioning reports & toolbox talks table', () => {
            const io = page.dprinput;
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
            const io = page.dprinput;
            let rng = page.rng;
            const table = io.getDprInputTable(4);

            let lines = table.all(by.name('dpRow'));
            let addLine = table.element(by.buttonText('add line'));
            let rmLine = table.element(by.buttonText('remove last'));
            lines.each(() => {
                rmLine.click();
            })
            expect(lines.count()).toBe(0);
            addLine.click();
            expect(lines.count()).toBe(1);

            let start = rng.getRandomInt(11, 15);
            let stop = rng.getRandomInt(16, 23);
            let inputs = lines.first().all(by.tagName('select'));
            // Technically these are select elements - might break
            inputs.get(0).sendKeys(start)
            inputs.get(2).sendKeys(stop)
            table.element(by.buttonText('Save')).click();
            browser.waitForAngular();

            page.navigateToEmpty('DPR input');
            expect(lines.count()).toBe(1);
            expect(inputs.get(0).getAttribute('value')).toBe(start.toString());
            expect(inputs.get(2).getAttribute('value')).toBe(stop.toString());
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
        })
        it('should save at least 1 hse input value', () => {
            let hse = page.dprinput.hseInput;
            expect(hse.isDisplayed()).toBe(true)
            let testFieldIndex = page.rng.getRandomInt(0, 21);
            let cnt = hse.all(by.tagName('input')).get(testFieldIndex);
            let txt = hse.all(by.tagName('textarea')).get(testFieldIndex);
            let rndTxt = page.rng.getRandomString();
            let rndCnt = page.rng.getRandomInt(1, 20);
            cnt.clear();
            cnt.sendKeys(rndCnt);
            txt.clear();
            txt.sendKeys(rndTxt);
            hse.element(by.buttonText('Save HSE input')).click();
            browser.waitForAngular();

            page.navigateToEmpty('DPR input');
            let newCnt = cnt.getAttribute('value');
            let newTxt = txt.getAttribute('value');
            expect(newCnt).toBe(rndCnt.toString(), 'Count does not match')
            expect(newTxt).toBe(rndTxt, 'Text does not match')
        })
    })

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

const log = (elt: ElementFinder) => {
    elt.getText().then(e => {
        console.log(e);
    });
    return elt;
}

const sleep = (timeout: number) => {
    browser.sleep(timeout)
}