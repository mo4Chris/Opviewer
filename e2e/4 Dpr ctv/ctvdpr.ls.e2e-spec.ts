import { element, by, ElementFinder } from 'protractor';
import { CtvDprPage } from './ctvdpr.po';
import { E2eDropdownHandler } from '../SupportFunctions/e2eDropdown.support';
import { E2eRandomTools } from '../SupportFunctions/e2eRandom.support';


const dropdownHandler = new E2eDropdownHandler();
const e2eRng = new E2eRandomTools();
describe('CTV dpr', () => {
    let page: CtvDprPage;

    describe('should not fail without data', () => {
        beforeEach(() => {
            page = new CtvDprPage();
            return page.navigateToEmpty();
        });

        it('and should not redirect', async () => {
            expect(await page.getUrl()).toMatch('reports/dpr;mmsi');
            await page.validateNoConsoleErrors();
        });

        it('and should display no data message', async () => {
            const noDataMsg = element(by.tagName('h3'));
            expect(await noDataMsg.isDisplayed()).toBe(true);
            expect(await noDataMsg.getText()).toMatch('There is no');
            await page.validateNoConsoleErrors();
        });
    });

    describe('Should create a map', () => {
        beforeEach(() => {
            page = new CtvDprPage();
            return page.navigateTo();
        });

        it('Should load a map', async () => {
            expect(await page.getMap().isPresent()).toBe(true);
            await page.validateNoConsoleErrors();
        });

        // Check if route is drawn
        // Check if turbines are drawn
        // Check if zoom is ok
    });

    describe('Should generate print preview', () => {
        beforeEach(() => {
            page = new CtvDprPage();
            return page.navigateTo();
        });

        it('Should have working print all button', async () => {
            const printButton = page.getPrintFullButton();
            const result = page.clickPrintButton(printButton);
            expect(await result).toBe(true);
            await page.validateNoConsoleErrors();
        });
    });

    describe('Should switch dates', () => {
        beforeEach(() => {
            page = new CtvDprPage();
            return page.navigateTo();
        });

        it('Should not redirect', async () => {
            expect(await page.getUrl()).toMatch('reports/dpr;mmsi');
            await page.validateNoConsoleErrors();
        });

    });

    describe('Should generate statistics', () => {
        beforeEach(() => {
            page = new CtvDprPage();
            return page.navigateTo();
        });

        it('Should not contain any NaNs', async () => {
            let nanElts = page.getEltsWithText('NaN');
            expect(await nanElts.count()).toBe(0);
            nanElts = page.getEltsWithText('_NaN_');
            expect(await nanElts.count()).toBe(0);
            await page.validateNoConsoleErrors();
        });

    });

    describe('should generate dockings', () => {
        let dockingRow: ElementFinder;
        let saveBtn: ElementFinder;

        beforeEach(async () => {
            page = new CtvDprPage();
            await page.navigateTo();
            dockingRow = await page.getFirstDockingEntry();
            saveBtn = await page.getSaveButtonFromDockingRow(dockingRow);
        });

        it('and have multiple dockings', async () => {
            const dockings = page.getAllDockings();
            expect(await dockings.count()).toBeGreaterThan(0);
            await  page.validateNoConsoleErrors();
        });

        it('and set normal values for docking table', async () => {
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
            await page.validateNoConsoleErrors();
        });

        it('and save other comments', async () => {
            const commentBtn = page.getCommentButtonFromDockingRow(dockingRow);
            dropdownHandler.setValue(commentBtn, 'Other');
            let otherInput = page.getOtherCommentInputFromDockingRow(dockingRow);
            expect(await otherInput.isDisplayed()).toBe(true);

            const str = e2eRng.getRandomString();
            await otherInput.clear();
            await otherInput.sendKeys(str);
            await saveBtn.click();

            await page.navigateTo();
            dockingRow = page.getFirstDockingEntry();
            otherInput = page.getOtherCommentInputFromDockingRow(dockingRow);
            expect(await otherInput.isDisplayed()).toBe(true);
            expect(await otherInput.getAttribute('value')).toBe(str);
            await page.validateNoConsoleErrors();
        });

    });


    describe('should be able to manage video requests', () => {
        let dockingRow: ElementFinder;
        let saveBtn: ElementFinder;

        beforeEach( async () => {
            page = new CtvDprPage();
            await page.navigateTo();
            dockingRow = await page.getFirstDockingEntry();
            saveBtn = await page.getSaveButtonFromDockingRow(dockingRow);
        });

        it('should request video from docking', async () => {
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
            await page.validateNoConsoleErrors();
        }, 60000);
    });


    describe('should create slip graphs', () => {
        beforeEach(() => {
            page = new CtvDprPage();
            page.navigateTo();
        });

        it('and loaded slip graphs', async () => {
            expect(await page.getSlipGraphs().count()).toBeGreaterThan(0);
            const slip = page.getSlipGraph(0);
            expect(await slip.isDisplayed()).toBe(true);
            await page.validateNoConsoleErrors();
        });

        it('and have formatted slip graphs', async () => {
            const slips = page.getSlipGraphs();
            await slips.each(_slip => {
                expect(_slip.isDisplayed()).toBe(true);
                const title = page.getTitleFromSlipGraph(_slip);
                expect(title.isDisplayed()).toBe(true);
                expect(title.getText()).toMatch(/Transfer: #\d+ - location: \w+ - Score: \d/);
                const canvas = page.getCanvasFromSlipGraph(_slip);
                expect(canvas.isDisplayed()).toBe(true);
            });
            await page.validateNoConsoleErrors();
        });
    });
});
