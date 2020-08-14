import { SettingsPage } from "./settings.po"
import { browser } from "protractor";


describe('User settings page should', () => {
    let page: SettingsPage;

    beforeEach(() => {
        page = new SettingsPage();
        page.navigateTo();
    })

    it('tell the user its identity, permissions and token expiration date', () => {
        expect(page.getUsername()).toMatch(/\w+@\w+/);
        expect(page.getPermissions()).toMatch(/\w+/);
        expect(page.getTokenExpirationDate()).toMatch(/\w+ \w+/);
    })

    fit('let the user change it perferred units', () => {
        page.setDistance('NM');
        page.setSpeed('knots');
        page.setWeight('ton');

        page.save();
        page.navigateTo();
        
        expect(page.getDistance()).toBe('NM');
        expect(page.getSpeed()).toBe('knots');
        expect(page.getWeight()).toBe('ton');
        page.setDistance('km');
        page.setSpeed('km/h');
        page.setWeight('kg');

        page.save();
        page.navigateTo();

        expect(page.getDistance()).toBe('km');
        expect(page.getSpeed()).toBe('km/h');
        expect(page.getWeight()).toBe('kg');
    }
})