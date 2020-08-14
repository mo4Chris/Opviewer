import { browser, element, by, ExpectedConditions, ElementFinder } from 'protractor';
import { SovDprPage } from './sovdpr.po';

fdescribe('Sov dpr', () => {
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

    describe('Should create a map', () => {
        beforeEach(() => {
            page = new SovDprPage();
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
            page = new SovDprPage();
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
            page = new SovDprPage();
            page.navigateTo();
        })
        
        it('Should not redirect', ()=> {
            expect(page.getUrl()).toMatch('reports/dpr;mmsi')
        })

    })

    describe('Should generate statistics', () => {
        beforeEach(() => {
            page = new SovDprPage();
            page.navigateTo();
        })

        it('Should not contain any NaNs', () => {
            expect(page.getNanCount()).toBe(0);
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
            expect(page.getValueByCellKey('Distance sailed').getText()).toMatch(/\d+/)
            expect(page.getValueByCellKey('Number of gangway connections').getText()).toMatch(/\d+/)
            let avgDockingTime = page.getValueByCellKey('Average time spent docking');
            expect(page.getTooltipForElt(avgDockingTime).isPresent()).toBe(true);
            expect(avgDockingTime.getText()).toMatch(/\d+/)
            expect()
        })
        it('should render charts', () => {
            expect(page.getOperationActivityChart().isDisplayed()).toBe(true);
            expect(page.getGangwayLimitationChart().isDisplayed()).toBe(true);
        })
        it('should render weather overview', () => {
            expect(page.getWeatherOverviewChart());
        })
    })
})