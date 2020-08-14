import { SovDprPage } from "./sovdpr.po"

describe('When trying to access page without rights', () => {
    let page: SovDprPage;
    beforeEach(() => {
        page = new SovDprPage();
        page.navigateTo();
    })

    it('should not load without proper access', () => {
        expect(page.getMap().isPresent()).toBe(false);
    })
})