import { browser, element, by } from 'protractor';


describe('CTV dpr', () => {
    let vesselname: string;
    beforeEach(() => {
        browser.get('/reports');
        let firstVesselBtn = element.all(by.buttonText('Daily Vessel Report')).first();
        element.all(by.id('vesselnameValue')).first().then((vname) => {
            vesselname = vname;
        })
        firstVesselBtn.click();
        browser.waitForAngular();
    })
})