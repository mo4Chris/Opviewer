import { browser, element, by, ElementFinder } from "protractor"
import { env } from "process";
import { E2ePageObject } from "../SupportFunctions/e2epage.support";

export class SettingsPage extends E2ePageObject{
    navigateTo() {
        browser.get(env.baseUrl + '/user-settings');
    }

    getUsername() {
        return this.getValueByCellKey('User').getText();
    }
    getPermissions() {
        return this.getValueByCellKey('Account permissions').getText(); 
    }
    getTokenExpirationDate() {
        return this.getValueByCellKey('Token expires').getText();
    }
    getDistance() {
        return this.getValueByCellKey('Distance').getText();
    }
    setDistance(unit: string) {
        this.setSetting(this.getValueByCellKey('Distance'), unit);
    }
    getSpeed() {
        return this.getValueByCellKey('Speed').getText();
    }
    setSpeed(unit: string) {
        this.setSetting(this.getValueByCellKey('Speed'), unit);
    }
    getWeight() {
        return this.getValueByCellKey('Weight').getText();
    }
    setWeight(unit: string) {
        this.setSetting(this.getValueByCellKey('Weight'), unit);
    }

    setSetting(cell: ElementFinder, unit: string) {
        this.dropdown.setValue(cell, unit);
    }
    save() {
        return element(by.buttonText('Save all'));
    }
}

let logText = (elt: ElementFinder) => {
    elt.getText().then(t => {
        console.log('Logged text:')
        console.log(t);
    })
}