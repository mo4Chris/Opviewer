import { browser, element, by, ElementFinder } from "protractor";
import { E2eDropdownHandler } from "./e2eDropdown.support";
import { E2eRandomTools } from "./e2eRandom.support";

// Abstract class from which to extend the e2e test classes
export abstract class E2ePageObject {
    abstract navigateTo(): void;
    dropdown    = new E2eDropdownHandler();
    rng         = new E2eRandomTools();

    getUrl() {
        return browser.getCurrentUrl();
    }
    getValueByCellKey(key: string) {
        let cell = element(by.xpath("//tr/td[contains(text(),'" + key + "')]"));
        return cell.all(by.xpath('../td')).get(1);
    }
    getEltsWithText(txt: string) {
        return element.all(by.xpath("//*[contains(text(),'" + txt + "')]"))
    }
    getNanCount() {
        return this.getEltsWithText('NaN').count();
    }
    getActiveTooltips() {
        return element.all(by.xpath('//ng-tooltip-window/div[contains(@class, "tooltip-inner")]'))
    }
    getTooltipForElt(elt: ElementFinder) {
        browser.actions().mouseMove(elt);
        return this.getActiveTooltips().first();
    }
}