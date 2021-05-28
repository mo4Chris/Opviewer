import { browser, element, by } from 'protractor';
import { ForecastDashboardPage } from './forecast_dashboard.po';

describe('Forecast-Dashboard', () => {
  let page: ForecastDashboardPage;

  beforeEach(() => {
    page = new ForecastDashboardPage();
    return page.navigateTo();
  });

  it('should not redirect', async () => {
    const url = page.getUrl();
    expect(await url).toMatch('forecast')
  })

  it('should load multiple projects', async () => {
    const project = await page.getActiveOpsRows();
    expect(project.length).toBeGreaterThanOrEqual(2); // 1 user specific + 1 generic project
  })
  it('should redirect to response page', async () => {
    const rows = await page.getActiveOpsRows();
    const btn = await page.getButtonByName(rows[0], 'Forecast');
    await btn.click();
    expect(await page.getUrl()).not.toEqual('forecast')
  })
  xit('should redirect to project edit page', async () => {
    const rows = await page.getActiveOpsRows();
    const btn = await page.getButtonByName(rows[0], 'Edit');
    await btn.click();
    expect(await page.getUrl()).toMatch('forecast/project-overview')
  })

})
