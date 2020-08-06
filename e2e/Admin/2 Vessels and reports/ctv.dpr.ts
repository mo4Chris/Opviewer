import { browser, element, by, ElementFinder } from "protractor";
import { env } from "process";

export class CtvDprPage {
    navigateTo() {
        browser.get(env.baseUrl + '/reports/dpr;mmsi=232009504;date=737701');
    }

    navigateToEmpty() {
        browser.get(env.baseUrl + '/reports/dpr;mmsi=232009504;date=737700');
    }

    navigateToLatest() {
        browser.get(env.baseUrl + '/reports/dpr;mmsi=232009504');
    }

    getUrl() {
        return browser.getCurrentUrl();
    }

    getMap() {
        return element(by.tagName('agm-map'));
    }

    getDate() {
        throw('To be done!')
    }

    getSlipGraphs() {
        return element.all(by.xpath('//app-ctvslipgraph/div'))
    }

    getPrintFullButton() {
        return element(by.buttonText('Print DPR Full'))
    }

    getCurrentPrintMode() {
        return element(by.binding('printMode')).getText();
    }

    getEltsWithText(txt: string) {
        return element.all(by.xpath("//*[contains(text(),'" + txt + "')]"))
    }

    clickPrintButton(printButton: ElementFinder) {
        let printIsClicked = browser.executeAsyncScript(function (elm, callback) {
            function listener() {
                callback(true);
            }
            window.print = listener;
            elm.click();
        }, printButton.getWebElement());
        return printIsClicked;
    }
}