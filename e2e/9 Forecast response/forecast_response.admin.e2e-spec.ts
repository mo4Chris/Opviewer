import { browser, element, by } from 'protractor';
import { E2eSelectHandler } from '../SupportFunctions/e2eDropdown.support';
import { ForecastResponsePage } from './forecast_response.po';

fdescribe('Forecast-Dashboard', () => {
  let page: ForecastResponsePage;

  beforeEach(() => {
    page = new ForecastResponsePage();
    return page.navigateTo();
  });

  it('should not redirect', async () => {
    const url = page.getUrl();
    expect(await url).toMatch('forecast/project')
  })

  fit('should have loaded correctly', async () => {
    const card = await page.getSettingsCard();
    expect(card.isPresent()).toBeTruthy();

    const tabs = await page.getTabs();
    const names = <string[]> await page.asyncForEach(tabs, (e) => e.getText());
    expect(names.length).toBeGreaterThan(0, 'Tabs not found!');
    expect(names).toContain('Weather overview');
    expect(names).toContain('Motion overview');
    expect(names).toContain('Workability');
    expect(names).toContain('Wave spectrum');

    const plotlyWindows = page.getPlotlyWindows();
    expect(await plotlyWindows.count()).toBeGreaterThan(1);

    await page.validateNoConsoleErrors();
  })

  it('should load multiple projects', async () => {
    const projectSelectRow = await page.getProjectSettingsRow('Selected project');
    expect(await projectSelectRow.isPresent()).toBeTruthy();
    const select = await projectSelectRow.element(by.css('select'));
    const dp = new E2eSelectHandler()
    dp.open(select);
    const values = await dp.getOptions(select);
    expect(values.length).toBeGreaterThan(0);
  }, 20000)
  // it('should redirect to response page', async () => {
  //   const rows = await page.getActiveOpsRows();
  //   const btn = await page.getButtonByName(rows[0], 'Forecast');
  //   await btn.click();
  //   expect(await page.getUrl()).not.toEqual('forecast')
  // })
  // xit('should redirect to project edit page', async () => {
  //   const rows = await page.getActiveOpsRows();
  //   const btn = await page.getButtonByName(rows[0], 'Edit');
  //   await btn.click();
  //   expect(await page.getUrl()).not.toEqual('forecast')
  // })

})
