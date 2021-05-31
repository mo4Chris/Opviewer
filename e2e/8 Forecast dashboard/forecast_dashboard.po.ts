import { E2ePageObject } from '../SupportFunctions/e2epage.support';
import { browser, element, by, ElementFinder, ElementArrayFinder} from 'protractor';


export class ForecastDashboardPage extends E2ePageObject {

  navigateTo() {
    return browser.get('/forecast');
  }
  // navigateToProjectOverview(project_name = 'Wind_Farm') {
  //   return browser.get(`/forecast/project-overview;project_name=${project_name}`);
  // }
  // navigateToResponse(project_id = 1) {
  //   return browser.get(`/forecast/project;project_id=${project_id}`);
  // }

  getActiveOpsTable() {
    return this.getCardByTitle('Active operations').element(by.css('table'));
  }
  async getActiveOpsRows(): Promise<ElementFinder[]> {
    const table = this.getActiveOpsTable();
    expect(await table.isPresent())
    return table.all(by.xpath('./tbody/tr'))
  }
}
