import { browser, element, by } from 'protractor';
import { E2eSelectHandler } from '../SupportFunctions/e2eDropdown.support';
import { ForecastResponsePage } from './forecast_response.po';

describe('Forecast - response page', () => {
  let page: ForecastResponsePage;

  describe('Workability tab', () => {
    beforeEach(() => {
      page = new ForecastResponsePage();
      return page.navigateTo();
    });

    it('should not redirect', async () => {
      const url = page.getUrl();
      expect(await url).toMatch('forecast/project')
    })

    it('should have loaded correctly', async () => {
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
      expect(await projectSelectRow?.isPresent()).toBeTruthy('Project select row not found!');
      const select = await projectSelectRow.element(by.css('select'));
      const dp = new E2eSelectHandler()
      dp.open(select);
      const values = await dp.getOptions(select);
      expect(values.length).toBeGreaterThan(0);
    }, 20000)
  })

  describe('motion overview tab', () => {
    beforeEach(async () => {
      page = new ForecastResponsePage();
      await page.navigateTo();
      await page.navigateToTab('Motion overview')
    });

    it('should not redirect', async () => {
      const url = page.getUrl();
      expect(await url).toMatch('forecast/project')
    })

    it('should have loaded correctly', async () => {
      const plotlyWindows = page.getPlotlyWindows();
      expect(await plotlyWindows.count()).toBeGreaterThan(1);

      await page.validateNoConsoleErrors();
    })
  })


  describe('weather overview tab', () => {
    beforeEach(async () => {
      page = new ForecastResponsePage();
      await page.navigateTo();
      await page.navigateToTab('Weather overview')
    });

    it('should not redirect', async () => {
      const url = page.getUrl();
      expect(await url).toMatch('forecast/project')
    })

    it('should have loaded correctly', async () => {
      const plotlyWindows = page.getPlotlyWindows();
      expect(await plotlyWindows.count()).toBeGreaterThan(1);

      await page.validateNoConsoleErrors();
    })
  })


  describe('wave spectrum tab', () => {
    beforeEach(async () => {
      page = new ForecastResponsePage();
      await page.navigateTo();
      await page.navigateToTab('Wave spectrum')
    });

    it('should not redirect', async () => {
      const url = page.getUrl();
      expect(await url).toMatch('forecast/project')
    })

    it('should have loaded correctly', async () => {
      const plotlyWindows = page.getPlotlyWindows();
      expect(await plotlyWindows.count()).toBeGreaterThan(1);

      await page.validateNoConsoleErrors();
    })
  })

  describe('for non-existing project', () => {
    beforeEach(async () => {
      page = new ForecastResponsePage();
      await page.navigateToEmpty();
    });

    it('should not redirect', async () => {
      expect(await page.getUrl()).toMatch('forecast/project')
    })

    it('should have a warning banner', async () => {
      const banner = page.getAlertBanner();
      expect(await banner.getText()).toMatch('Response was not loaded')
    })

    it('should not have alternate tabs available', async () => {
      const tabs = page.getTabs();
      expect(await tabs.count()).toEqual(1, 'No alternate tabs should be enabled')
    })
  })
})
