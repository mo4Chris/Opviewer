import { browser, element, by } from 'protractor';
import { CtvDprPage } from './ctv.dpr';
import { env } from 'process';


fdescribe('CTV dpr', () => {
    let page: CtvDprPage;

    describe('Should not fail without data', () => {
        beforeEach(() => {
            page = new CtvDprPage();
            page.navigateToEmpty();
        })

        it('Should not redirect', ()=> {
            expect(page.getUrl).toMatch('reports/dpr;mmsi')
        })

        it('Should display no data message', () => {

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

    })

    describe('Should switch dates', () => {
        it('Should not redirect', ()=> {
            expect(page.getUrl).toMatch('reports/dpr;mmsi')
        })

    })

    describe('Should generate statistics', () => {

    })

    describe('Should generate dockings', () => {

    })

    describe('Should create slip graphs', () => {

    })
})