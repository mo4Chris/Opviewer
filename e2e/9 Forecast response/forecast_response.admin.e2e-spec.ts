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
      expect(await projectSelectRow?.isPresent()).toBeTruthy();
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

  describe('ops settings', () => {
    beforeEach(async () => {
      page = new ForecastResponsePage();
      await page.navigateTo();
    });

    it('should open all the tabs', async () => {
      const tabs = await page.getOpsTabs();
      await page.asyncForEach(tabs, async tab => {
        await page.openOpsTab(tab);
      })
      // Check all the tabs are open
      await page.asyncForEach(tabs, async tab => {
        expect(await page.checkOpsTabIsOpen(tab)).toBeTruthy();
      })
      await page.validateNoConsoleErrors()
    })
  })
})
