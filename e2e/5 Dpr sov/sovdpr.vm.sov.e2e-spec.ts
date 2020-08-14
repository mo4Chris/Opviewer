import { browser, element, by, ExpectedConditions, ElementFinder } from 'protractor';
import { SovDprPage } from './sovdpr.po';

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
    })

    fdescribe('always', () => {
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
        
        beforeEach(() => {
            page = new SovDprPage();
            page.navigateTo();
        })
        
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
        fit('should switch dates via date picker', () => {
            page.switchDate({
                year: 2019,
                month: 10,
                day: 1
            });
            expect(page.getDatePickerString()).toBe('2019-10-01')
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
            page.navigateTo();
            page.clickTabByName('Transfers');
        })

        it('should have switched tab', () => {
            expect(page.getActiveTab().getText()).toMatch('Transfers')
            expect(page.getContainerByTitle('Daily Summery').isPresent())
                .toBe(false, 'Summary info should no longer be present')
        })
        it('should not show NaNs', () => {
            expect(page.getNanCount()).toBe(0);
        })
    })

    describe('DPR input tab', () => {
        beforeEach(() => {
            page = new SovDprPage();
            page.navigateTo();
            page.clickTabByName('DPR input');
        })
    })

    describe('Commercial overview tab', () => {
        beforeEach(() => {
            page = new SovDprPage();
            page.navigateTo();
            page.clickTabByName('Commercial overview');
        })
    })

    describe('HSE overview', () => {
        beforeEach(() => {
            page = new SovDprPage();
            page.navigateTo();
            page.clickTabByName('HSE overview');
        })
    })
})