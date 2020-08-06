import { browser, element, by, ExpectedConditions } from 'protractor';
import { CtvDprPage } from './ctv.dpr';
import { env } from 'process';
import { elementEnd } from '@angular/core/src/render3';
import { callbackify } from 'util';


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
            let noDataMsg = element(by.tagName('h3')).getText();
            expect(noDataMsg).toMatch('There is no map available for the selected day and vessel.')
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
    })

    describe('Should generate dockings', () => {
        beforeEach(() => {
            page = new CtvDprPage();
            page.navigateTo();
        })

        it('Should have multiple dockings', () => {
            let dockings = element.all(by.xpath('//app-ctv-turbine-transfer/table/tbody/tr'))
            expect(dockings.count()).toBeGreaterThan(0);
        });
    })

    describe('Should create slip graphs', () => {
        beforeEach(() => {
            page = new CtvDprPage();
            page.navigateTo();
        })

    })
})