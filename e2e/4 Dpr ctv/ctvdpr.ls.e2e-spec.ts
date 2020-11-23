import { browser, element, by, ExpectedConditions, ElementFinder } from 'protractor';
import { CtvDprPage } from './ctvdpr.po';
import { env } from 'process';
import { elementEnd } from '@angular/core/src/render3';
import { callbackify } from 'util';
import { E2eDropdownHandler } from '../SupportFunctions/e2eDropdown.support';
import { E2eRandomTools } from '../SupportFunctions/e2eRandom.support';


const dropdownHandler = new E2eDropdownHandler();
const e2eRng = new E2eRandomTools();
describe('CTV dpr', () => {
    let page: CtvDprPage;
    afterEach(() => {
      page.validateNoConsoleLogs();
    });

    describe('Should not fail without data', () => {
        beforeEach(() => {
            page = new CtvDprPage();
            page.navigateToEmpty();
        });

        it('Should not redirect', () => {
            expect(page.getUrl()).toMatch('reports/dpr;mmsi');
        });

        it('Should display no data message', () => {
            const noDataMsg = element(by.tagName('h3'));
            expect(noDataMsg.isDisplayed()).toBe(true);
            expect(noDataMsg.getText()).toMatch('There is no');
        });
    });

    describe('Should create a map', () => {
        beforeEach(() => {
            page = new CtvDprPage();
            page.navigateTo();
        });

        it('Should load a map', () => {
            expect(page.getMap().isPresent()).toBe(true);
        });

        // Check if route is drawn
        // Check if turbines are drawn
        // Check if zoom is ok
    });

    describe('Should generate print preview', () => {
        beforeEach(() => {
            page = new CtvDprPage();
            page.navigateTo();
        });

        it('Should have working print all button', () => {
            const printButton = page.getPrintFullButton();
            const result = page.clickPrintButton(printButton);
            expect(result).toBe(true);
        });
    });

    describe('Should switch dates', () => {
        beforeEach(() => {
            page = new CtvDprPage();
            page.navigateTo();
        });

        it('Should not redirect', () => {
            expect(page.getUrl()).toMatch('reports/dpr;mmsi');
        });

    });

    describe('Should generate statistics', () => {
        beforeEach(() => {
            page = new CtvDprPage();
            page.navigateTo();
        });

        it('Should not contain any NaNs', () => {
            let nanElts = page.getEltsWithText('NaN');
            expect(nanElts.count()).toBe(0);
            nanElts = page.getEltsWithText('_NaN_');
            expect(nanElts.count()).toBe(0);
        });

    });

    describe('should generate dockings', () => {
        let dockingRow: ElementFinder;
        let saveBtn: ElementFinder;

        beforeEach(() => {
            page = new CtvDprPage();
            page.navigateTo();
            dockingRow = page.getFirstDockingEntry();
            saveBtn = page.getSaveButtonFromDockingRow(dockingRow);
        });

        it('and have multiple dockings', () => {
            const dockings = page.getAllDockings();
            expect(dockings.count()).toBeGreaterThan(0);
        });

        it('and set normal values for docking table', async (done) => {
            expect(dockingRow.isPresent()).toBe(true, 'Page should contain docking row');
            let target = await page.getElementInDockingRowByTitle(dockingRow, '#');
            expect(target.getText()).toBe('1');
            target = await page.getElementInDockingRowByTitle(dockingRow, 'Location');
            expect(target.getText()).toMatch(/\w+/, 'Location should be formatted');
            target = await page.getElementInDockingRowByTitle(dockingRow, 'Start time');
            expect(target.getText()).toMatch(/\d{2}:\d{2}/, 'Start time should be formatted');
            target = await page.getElementInDockingRowByTitle(dockingRow, 'Stop time');
            expect(target.getText()).toMatch(/\d{2}:\d{2}/, 'Stop time should be formatted');
            target = await page.getElementInDockingRowByTitle(dockingRow, 'Duration');
            expect(target.getText()).toMatch(/\d{2}:\d{2}/, 'Duration should be formatted');
            target = await page.getElementInDockingRowByTitle(dockingRow, 'Max impact');
            expect(target.getText()).toMatch(/\dKN/, 'Map impact should be formatted');
            target = await page.getElementInDockingRowByTitle(dockingRow, 'Score');
            expect(target.getText()).toMatch(/\d/, 'Score should be formatted');
            target = await page.getElementInDockingRowByTitle(dockingRow, 'Detector');
            expect(target.getText()).toMatch(/\w+/, 'Detector should be formatted');
            return done();
        });

        it('and save other comments', () => {
            const commentBtn = page.getCommentButtonFromDockingRow(dockingRow);
            dropdownHandler.setValue(commentBtn, 'Other');
            let otherInput = page.getOtherCommentInputFromDockingRow(dockingRow);
            expect(otherInput.isDisplayed()).toBe(true);

            const str = e2eRng.getRandomString();
            otherInput.clear();
            otherInput.sendKeys(str);
            saveBtn.click();

            page.navigateTo();
            dockingRow = page.getFirstDockingEntry();
            otherInput = page.getOtherCommentInputFromDockingRow(dockingRow);
            expect(otherInput.isDisplayed()).toBe(true);
            expect(otherInput.getAttribute('value')).toBe(str);
        });

    });


    describe('should be able to manage video requests', () => {
        let dockingRow: ElementFinder;
        let saveBtn: ElementFinder;

        beforeEach(() => {
            page = new CtvDprPage();
            page.navigateTo();
            dockingRow = page.getFirstDockingEntry();
            saveBtn = page.getSaveButtonFromDockingRow(dockingRow);
        });

        it('should request video from docking', async (done) => {
            let videoRequestBtn = page.getVideoRequestButtonFromDockingRow(dockingRow);
            expect(await videoRequestBtn.getText()).toBe('Not requested');
            videoRequestBtn.click();
            expect(await videoRequestBtn.getText()).toBe('Requested');

            page.navigateTo();
            videoRequestBtn = page.getVideoRequestButtonFromDockingRow(dockingRow);
            expect(await videoRequestBtn.getText()).toBe('Requested');
            videoRequestBtn.click();
            expect(await videoRequestBtn.getText()).toBe('Not requested');

            page.navigateTo();
            expect(await videoRequestBtn.getText()).toBe('Not requested');
            done();
        }, 60000);
    });


    describe('should create slip graphs', () => {
        beforeEach(() => {
            page = new CtvDprPage();
            page.navigateTo();
        });

        it('and loaded slip graphs', () => {
            expect(page.getSlipGraphs().count()).toBeGreaterThan(0);
            const slip = page.getSlipGraph(0);
            expect(slip.isDisplayed()).toBe(true);
        });

        it('and have formatted slip graphs', () => {
            const slips = page.getSlipGraphs();
            slips.each(_slip => {
                expect(_slip.isDisplayed()).toBe(true);
                const title = page.getTitleFromSlipGraph(_slip);
                expect(title.isDisplayed()).toBe(true);
                expect(title.getText()).toMatch(/Transfer: #\d+ - location: \w+ - Score: \d/);
                const canvas = page.getCanvasFromSlipGraph(_slip);
                expect(canvas.isDisplayed()).toBe(true);
            });
        });
    });
});
