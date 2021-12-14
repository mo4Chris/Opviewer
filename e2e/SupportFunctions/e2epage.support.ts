import { browser, element, by, ElementFinder } from 'protractor';
import { E2eDropdownHandler } from './e2eDropdown.support';
import { E2eRandomTools } from './e2eRandom.support';

// Abstract class from which to extend the e2e test classes
export abstract class E2ePageObject {
  dropdown    = new E2eDropdownHandler();
  rng         = new E2eRandomTools();
  abstract navigateTo(): void;

  getUrl() {
    return browser.getCurrentUrl();
  }
  getCardByTitle(key: string) {
    return element(by.xpath('//div[contains(concat(" ",normalize-space(@class)," "),"card") and div[@class="card-header" and contains(text(),\'' + key + '\')]]'));
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
  async getTooltipForElt(elt: ElementFinder) {
    await browser.actions().mouseMove(elt).perform();
    await browser.waitForAngular();
    return this.getActiveTooltips().first();
  }
  getInputByPlaceholder(txt: string, elt?: ElementFinder) {
    if (elt) {
      return elt.element(by.xpath('//input[@placeholder="' + txt + '"]'));
    } else {
      return element(by.xpath('//input[@placeholder="' + txt + '"]'));
    }
  }

  async getButtonByName(rootObj: ElementFinder, name: string) {
    const btns = await rootObj.all(by.css('button'));
    const names = await this.asyncForEach(btns, async (e) => await e.getText());
    const idx = names.findIndex(n => n == name);
    if (idx == -1) return null;
    return btns[idx];
  }

  async validateNoConsoleErrors() {
    const logs = await browser.manage().logs().get('browser')

    expect(Array.isArray(logs)).toBeTruthy('Failed to get logs from browser');
    if (logs.length == 0) return;

    const errorLogs = logs.filter(log => {
      if (log.level.value < 1000) return false
      const match = log.message.match('maps\.googleapis');
      if (match && match.length > 0) {
        return false;
      }
      console.log(log)
      return true;
    });
    expect(errorLogs.length).toBe(0, 'Console errors were detected!');
  }

  async asyncForEach(objects: ElementFinder[], callback: (e: ElementFinder, index?: number) => any): Promise<any[]> {
    const n = objects.length;
    const out = [];
    for (let i=0; i<n; i++) {
      const data = await callback(objects[i], i);
      out.push(data);
    }
    return out;
  }
  async asyncFind(objects: ElementFinder[], callback: (e: ElementFinder) => Promise<boolean>): Promise<any> {
    const valid = await this.asyncForEach(objects, callback);
    const idx = valid.findIndex(v => v!= null);
    if (idx == -1) return null;
    return objects[idx];
  }
}
