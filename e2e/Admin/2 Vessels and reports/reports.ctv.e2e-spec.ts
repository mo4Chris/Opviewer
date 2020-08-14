import { browser, element, by, ExpectedConditions, ElementFinder } from 'protractor';
import { CtvDprPage } from './reports.ctv.dpr';
import { env } from 'process';
import { elementEnd } from '@angular/core/src/render3';
import { callbackify } from 'util';
import { E2eDropdownHandler } from '../../SupportFunctions/e2eDropdown.support';
import { E2eRandomTools } from '../../SupportFunctions/e2eRandom.support';


let dropdownHandler = new E2eDropdownHandler();
let e2eRng = new E2eRandomTools();
describe('CTV dpr', () => {
    let page: CtvDprPage;

    describe('Should not fail without data', () => {
        beforeEach(() => {
            page = new CtvDprPage();
            page.navigateToEmpty();
        })

        it('Should not redirect', ()=> {
            expect(page.getUrl()).toMatch('reports/dpr;mmsi')
        })

        it('Should display no data message', () => {
            let noDataMsg = element(by.tagName('h3'))
            expect(noDataMsg.isDisplayed()).toBe(true);
            expect(noDataMsg.getText()).toMatch('There is no map available for the selected day and vessel.')
        });
    })

    describe('Should create a map', () => {
        beforeEach(() => {
            page = new CtvDprPage();
            page.navigateTo();
        })

        it('Should load a map', () => {
            expect(page.getMap().isPresent()).toBe(true);
        })

        // Check if route is drawn
        // Check if turbines are drawn
        // Check if zoom is ok
    });

    describe('Should generate print preview', () => {
        beforeEach(() => {
            page = new CtvDprPage();
            page.navigateTo();
        })
        
        it('Should have working print all button', () => {
            let printButton = page.getPrintFullButton();
            let result = page.clickPrintButton(printButton);
            expect(result).toBe(true);
        })
    })

    describe('Should switch dates', () => {
        beforeEach(() => {
            page = new CtvDprPage();
            page.navigateTo();
        })
        
        it('Should not redirect', ()=> {
            expect(page.getUrl()).toMatch('reports/dpr;mmsi')
        })

    })

    describe('Should generate statistics', () => {
        beforeEach(() => {
            page = new CtvDprPage();
            page.navigateTo();
        })

        it('Should not contain any NaNs', () => {
            let nanElts = page.getEltsWithText('NaN');
            expect(nanElts.count()).toBe(0);
            nanElts = page.getEltsWithText('_NaN_');
            expect(nanElts.count()).toBe(0);
        })

        it('Should save fuel consumption', () => {
            let fuelConsumed = page.getFuelInput();
            let oldFuel = e2eRng.getRandomInt(500, 1000);
            
            expect(fuelConsumed.isDisplayed()).toBe(true);
            fuelConsumed.clear();
            fuelConsumed.sendKeys(oldFuel);
            let saveBtn = page.getStatsSaveBtn();
            saveBtn.click();
            page.navigateTo();
            fuelConsumed = page.getFuelInput();
            expect(fuelConsumed.getValue()).toBe(oldFuel.toString());
        })

        it('Should save waste oil consumption', () => {
            let wasteOilLanded = page.getWasteoilInput();
            let oldFuel = e2eRng.getRandomInt(0, 100);
            
            expect(wasteOilLanded.isDisplayed()).toBe(true);
            wasteOilLanded.clear();
            wasteOilLanded.sendKeys(oldFuel);
            let saveBtn = page.getStatsSaveBtn();
            saveBtn.click();
            page.navigateTo();
            wasteOilLanded = page.getWasteoilInput();
            expect(wasteOilLanded.getValue()).toBe(oldFuel.toString());
        })

        it('Should save garbage landed', () => {
            let garbageLanded = page.getGarbagelandedInput();
            let landed = e2eRng.getRandomNumber(0, 0.5);
            
            expect(garbageLanded.isDisplayed()).toBe(true);
            garbageLanded.clear();
            garbageLanded.sendKeys(landed);
            let saveBtn = page.getStatsSaveBtn();
            saveBtn.click();
            page.navigateTo();
            garbageLanded = page.getGarbagelandedInput();
            expect(garbageLanded.getValue()).toBe(landed.toString());
        })

    })

    describe('Should generate dockings', () => {
        let dockingRow: ElementFinder;
        let saveBtn: ElementFinder;

        beforeEach(() => {
            page = new CtvDprPage();
            page.navigateTo();
            dockingRow = page.getFirstDockingEntry();
            saveBtn = page.getSaveButtonFromDockingRow(dockingRow);
        })

        it('Should have multiple dockings', () => {
            let dockings = page.getAllDockings();
            expect(dockings.count()).toBeGreaterThan(0);
        });

        it('Should set normal values for docking table', () => {
            expect(dockingRow.isPresent()).toBe(true, 'Page should contain docking row');
            expect(page.getEltInDockingRow(dockingRow, 0).getText()).toBe('1');
            expect(page.getEltInDockingRow(dockingRow, 1).getText()).toMatch(/\d{2}:\d{2}/, "Start time should be formatted");
            expect(page.getEltInDockingRow(dockingRow, 2).getText()).toMatch(/\d{2}:\d{2}/, 'Stop time should be formatted');
            expect(page.getEltInDockingRow(dockingRow, 3).getText()).toMatch(/\d{2}:\d{2}/, 'Duration should be formatted');
            expect(page.getEltInDockingRow(dockingRow, 4).getText()).toMatch(/\d+/, 'Impact should be formatted');
            expect(page.getEltInDockingRow(dockingRow, 5).getText()).toMatch(/\d.\d/, 'Score should be formatted');
            expect(page.getEltInDockingRow(dockingRow, 6).getText()).toMatch(/\w+/, 'Location should be formatted');
            expect(page.getEltInDockingRow(dockingRow, 10).getText()).toMatch(/\w+/, 'Detector should be formatted');
        })

        it('Should allow users to input pax in / out', () => {
            // Init pax in/out
            expect(saveBtn.isEnabled()).toBe(false, 'Save button should only enable on input change')
            let paxInInput = page.getPaxInputFromDockingRow(dockingRow);
            let paxOutInput = page.getPaxOutputFromDockingRow(dockingRow);
            paxInInput.clear();paxInInput.sendKeys(1);
            paxOutInput.clear();paxOutInput.sendKeys(2);
            let cargoInput = page.getCargoInputFromDockingRow(dockingRow);
            let cargoOutput = page.getCargoOutputFromDockingRow(dockingRow);
            cargoInput.clear();cargoInput.sendKeys(3);
            cargoOutput.clear();cargoOutput.sendKeys(4);
            saveBtn.click();

            // Save
            page.navigateTo();
            paxInInput = page.getPaxInputFromDockingRow(dockingRow);
            expect(paxInInput.getValue()).toBe('1');
            paxOutInput = page.getPaxOutputFromDockingRow(dockingRow);
            expect(paxOutInput.getValue()).toBe('2');
            paxInInput.clear();paxInInput.sendKeys(0);
            paxOutInput.clear();paxOutInput.sendKeys(0);
            cargoInput = page.getCargoInputFromDockingRow(dockingRow);
            expect(cargoInput.getValue()).toBe('3');
            cargoOutput = page.getCargoOutputFromDockingRow(dockingRow);
            expect(cargoOutput.getValue()).toBe('4');
            cargoInput.clear();cargoInput.sendKeys(0);
            cargoOutput.clear();cargoOutput.sendKeys(0);
            
            saveBtn.click();

            // Check if we were not seeing old values
            page.navigateTo();
            paxInInput = page.getPaxInputFromDockingRow(dockingRow);
            expect(paxInInput.getValue()).toBe('0');
            paxOutInput = page.getPaxOutputFromDockingRow(dockingRow);
            expect(paxOutInput.getValue()).toBe('0');
            cargoInput = page.getCargoInputFromDockingRow(dockingRow);
            expect(cargoInput.getValue()).toBe('0');
            cargoOutput = page.getCargoOutputFromDockingRow(dockingRow);
            expect(cargoOutput.getValue()).toBe('0');
        });

        it('Should save default comments', () => {
            let commentBtn = page.getCommentButtonFromDockingRow(dockingRow);
            expect(dropdownHandler.getValue(commentBtn)).toMatch(/\w+/, 'Comment should be formatted');
            expect(dropdownHandler.getNumOptions(commentBtn)).toBeGreaterThan(1);

            dropdownHandler.setValueByIndex(commentBtn, 1);
            let oldValue = dropdownHandler.getValue(commentBtn);

            saveBtn.click();
            
            commentBtn = page.getCommentButtonFromDockingRow(dockingRow);
            expect(dropdownHandler.getValue(commentBtn)).toBe(oldValue)
            
            dropdownHandler.setValueByIndex(commentBtn, 0);
            oldValue = dropdownHandler.getValue(commentBtn);
            saveBtn.click();

            commentBtn = page.getCommentButtonFromDockingRow(dockingRow);
            expect(dropdownHandler.getValue(commentBtn)).toBe(oldValue)
        });

        it('Should save other comments', () => {
            let commentBtn = page.getCommentButtonFromDockingRow(dockingRow);
            dropdownHandler.setValue(commentBtn, 'Other');
            let otherInput = page.getOtherCommentInputFromDockingRow(dockingRow);
            expect(otherInput.isDisplayed()).toBe(true);
            
            let str = e2eRng.getRandomString();
            otherInput.clear();
            otherInput.sendKeys(str)
            console.log(str);
            saveBtn.click();

            page.navigateTo();
            dockingRow = page.getFirstDockingEntry();
            otherInput = page.getOtherCommentInputFromDockingRow(dockingRow);
            expect(otherInput.isDisplayed()).toBe(true);
            otherInput.getText().then(function(text) {
                console.log(text);
              });
            expect(otherInput.getText()).toBe(str);
        });
    })

    describe('Should create slip graphs', () => {
        beforeEach(() => {
            page = new CtvDprPage();
            page.navigateTo();
        })

        it('Should have loaded slip graphs', () => {
            expect(page.getSlipGraphs().count()).toBeGreaterThan(0);
            let slip = page.getSlipGraph(0);
            expect(slip.isDisplayed()).toBe(true);
        })

        it('Should have formatted slip graphs', () => {
            let slips = page.getSlipGraphs();
            slips.each(_slip => {
                expect(_slip.isDisplayed()).toBe(true);
                let title = page.getTitleFromSlipGraph(_slip);
                expect(title.isDisplayed()).toBe(true);
                expect(title.getText()).toMatch(/Transfer: #\d+ - location: \w+ - Score: \d/)
                let canvas = page.getCanvasFromSlipGraph(_slip);
                expect(canvas.isDisplayed()).toBe(true);
            })
        })
    })
})