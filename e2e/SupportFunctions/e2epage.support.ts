import { browser, element, by, ElementFinder } from 'protractor';
import { E2eDropdownHandler } from './e2eDropdown.support';
import { E2eRandomTools } from './e2eRandom.support';
import { protractor } from 'protractor/built/ptor';

// Abstract class from which to extend the e2e test classes
export abstract class E2ePageObject {
  dropdown    = new E2eDropdownHandler();
  rng         = new E2eRandomTools();
  abstract navigateTo(): void;

  getUrl() {
    return browser.getCurrentUrl();
  }
  getCellByKey(key: string) {
    return element(by.xpath('//tr/td[contains(text(),\'' + key + '\')]'));
  }
  getValueByCellKey(key: string) {
    return this.getCellByKey(key).all(by.xpath('../td')).get(1);
  }
  getEltsWithText(txt: string) {
    return element.all(by.xpath('//*[contains(text(),\'' + txt + '\')]'));
  }
  getNanCount() {
    return this.getEltsWithText('NaN').count();
  }
  getDropdownValue(dropdown: ElementFinder) {
    return this.dropdown.getValue(dropdown);
  }
  getButtonValue(btn: ElementFinder) {
    // We add getValue as function to the returned promise
    return btn.getAttribute('value');
  }
  getActiveTooltips() {
    return element.all(by.xpath('//ngb-tooltip-window/div[contains(@class, "tooltip-inner")]'));
  }
  getTooltipForElt(elt: ElementFinder) {
    browser.actions().mouseMove(elt).perform();
    browser.waitForAngular();
    return this.getActiveTooltips().first();
  }
  getInputByPlaceholder(txt: string, elt?: ElementFinder) {
    if (elt) {
      return elt.element(by.xpath('//input[@placeholder="' + txt + '"]'));
    } else {
      return element(by.xpath('//input[@placeholder="' + txt + '"]'));
    }
  }

  validateNoConsoleLogs() {
    browser.manage().logs().get('browser').then(logs => {
      if (logs && Array.isArray(logs)) {
        const errorLogs = logs.filter(log => {
          let tf = log.level.name === 'OFF' || log.level.name === 'SEVERE';
          if (tf) {
            let match = log.message.match('maps\.googleapis');
            if (match && match.length > 0) {
              tf = false;
            } else {
              console.log(log);
            }
          }
          return tf;
        });
        expect(errorLogs.length).toBe(0, 'Console errors were detected!');
      } else {
        throw(new Error('Failed to get logs from browser'))
      }
    });
  }
}
