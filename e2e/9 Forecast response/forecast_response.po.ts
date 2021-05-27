import { E2ePageObject } from '../SupportFunctions/e2epage.support';
import { browser, element, by, ElementFinder, ElementArrayFinder} from 'protractor';


export class ForecastResponsePage extends E2ePageObject {

  navigateTo(project_id = 17) {
    return browser.get(`/forecast/project;project_id=${project_id}`);
  }
  navigateToEmpty() {
    return this.navigateTo(-1);
  }
  navigateToTab(tab = 'Workability') {
    return this.clickTab(this.getTabByName(tab));
  }

  async getSettingsCard() {
    // return this.getCardByTitle('overview');
    const cards: ElementFinder[] = await element.all(by.className('card-header'));
    const is_match = await this.asyncForEach(cards, async e => {
      const txt = await e.getText();
      const match = txt.match('Project overview');
      return match == null;
    });
    const idx = is_match.findIndex(i => i != null);
    return cards[idx];
  }
  async getProjectSettingsRow(txt: string): Promise<ElementFinder> {
    const card = await this.getSettingsCard();
    expect(await card.isPresent()).toBeTruthy('Card not found!')
    const rows = await card.all(by.css('tr'));
    const row = this.asyncFind(rows, async (e) => {
      const _txt = await e.getText();
      const is_match = _txt.match(txt);
      return is_match == null
    });
    return row;
  }

  // Tabs
  getTabs() {
    return element.all(by.css('li > a[role=tab]'));
  }
  getActiveTab() {
    return element(by.xpath('//li/a[contains(@class, \'active\')]'));
  }
  getTabByName(name: string) {
    return element(by.xpath('//li/a[contains(text(),\'' + name + '\')]'));
  }
  clickTabByName(name: string) {
    return this.clickTab(this.getTabByName(name));
  }
  getTabEnabledByName(name: string) {
    return this.getTabByName(name).isEnabled();
  }
  getTabPresentByName(name: string) {
    return this.getTabByName(name).isPresent();
  }
  async clickTab(tab: ElementFinder) {
    await tab.click();
    await browser.waitForAngular();
  }
  async tabIsEnabled(tab: ElementFinder) {
    const attribute = await tab.getAttribute('ariaDisabled');
    return attribute == 'false';
  }

  getAlertBanner() {
    return element(by.css('ngb-alert'))
  }

  // Plotly
  getPlotlyWindows() {
    return element.all(by.css('plotly-plot'))
  }
}
