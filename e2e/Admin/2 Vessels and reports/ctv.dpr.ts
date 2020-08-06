import { browser, element, by } from "protractor";
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
}