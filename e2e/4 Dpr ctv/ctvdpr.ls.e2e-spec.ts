import { element, by, ElementFinder } from 'protractor';
import { CtvDprPage } from './ctvdpr.po';
import { E2eDropdownHandler } from '../SupportFunctions/e2eDropdown.support';
import { E2eRandomTools } from '../SupportFunctions/e2eRandom.support';


const dropdownHandler = new E2eDropdownHandler();
const e2eRng = new E2eRandomTools();
describe('CTV dpr', () => {
  let page: CtvDprPage;

  describe('should not fail without data', () => {
    beforeEach(() => {
      page = new CtvDprPage();
      return page.navigateToEmpty();
    });

    it('and should not redirect', async () => {
      expect(await page.getUrl()).toMatch('reports/dpr;mmsi');
      await page.validateNoConsoleErrors();
    });

    it('and should display no data message', async () => {
      const noDataMsg = element(by.tagName('h3'));
      expect(await noDataMsg.isDisplayed()).toBe(true);
      expect(await noDataMsg.getText()).toMatch('There is no');
      await page.validateNoConsoleErrors();
    });
  });

  describe('Should create a map', () => {
    beforeEach(() => {
      page = new CtvDprPage();
      return page.navigateTo();
    });

    it('and load a map', async () => {
      const map = await page.getMap();
      expect(map.isPresent()).toBe(true);
      return page.validateNoConsoleErrors();
    });

    // Check if route is drawn
    // Check if turbines are drawn
    // Check if zoom is ok
  });

  describe('should generate print preview', () => {
    beforeEach(() => {
      page = new CtvDprPage();
      return page.navigateTo();
    });

    it('and have working print all button', async () => {
      const printButton = page.getPrintFullButton();
      expect(await printButton.isPresent()).toBeTruthy('Print button not found!')
      const result = await page.clickPrintButton(printButton);
      expect(await result).toBe(true);
      await page.validateNoConsoleErrors();
    });
  });

  describe('should switch dates', () => {
    beforeEach(() => {
      page = new CtvDprPage();
      return page.navigateTo();
    });

    it('and not redirect', async () => {
      expect(await page.getUrl()).toMatch('reports/dpr;mmsi');
      await page.validateNoConsoleErrors();
    });

  });

  describe('Should generate statistics', () => {
    beforeEach(() => {
      page = new CtvDprPage();
      return page.navigateTo();
    });

    it('Should not contain any NaNs', async () => {
      let nanElts = page.getEltsWithText('NaN');
      expect(await nanElts.count()).toBe(0);
      nanElts = page.getEltsWithText('_NaN_');
      expect(await nanElts.count()).toBe(0);
      await page.validateNoConsoleErrors();
    });

  });

  describe('should generate dockings', () => {
    let dockingRow: ElementFinder;
    let saveBtn: ElementFinder;

    beforeEach(async () => {
      page = new CtvDprPage();
      await page.navigateTo();
      dockingRow = page.getFirstDockingEntry();
      saveBtn = page.getSaveButtonFromDockingRow(dockingRow);
    });

    it('and have multiple dockings', async () => {
      const dockings = page.getAllDockings();
      expect(await dockings.count()).toBeGreaterThan(0);
      await  page.validateNoConsoleErrors();
    });

    it('and set normal values for docking table', async () => {
      expect(await dockingRow.isPresent()).toBe(true, 'Page should contain docking row');
      let target = await page.getElementInDockingRowByTitle(dockingRow, '#');
      expect(await target.getText()).toBe('1');
      target = await page.getElementInDockingRowByTitle(dockingRow, 'Location');
      expect(await target.getText()).toMatch(/\w+/, 'Location should be formatted');
      target = await page.getElementInDockingRowByTitle(dockingRow, 'Start time');
      expect(await target.getText()).toMatch(/\d{2}:\d{2}/, 'Start time should be formatted');
      target = await page.getElementInDockingRowByTitle(dockingRow, 'Stop time');
      expect(await target.getText()).toMatch(/\d{2}:\d{2}/, 'Stop time should be formatted');
      target = await page.getElementInDockingRowByTitle(dockingRow, 'Duration');
      expect(await target.getText()).toMatch(/\d{2}:\d{2}/, 'Duration should be formatted');
      target = await page.getElementInDockingRowByTitle(dockingRow, 'Max impact');
      expect(await target.getText()).toMatch(/\dKN/, 'Map impact should be formatted');
      target = await page.getElementInDockingRowByTitle(dockingRow, 'Score');
      expect(await target.getText()).toMatch(/\d/, 'Score should be formatted');
      target = await page.getElementInDockingRowByTitle(dockingRow, 'Detector');
      expect(await target.getText()).toMatch(/\w+/, 'Detector should be formatted');
      await page.validateNoConsoleErrors();
    });

    it('and save other comments', async () => {
      const commentBtn = page.getCommentButtonFromDockingRow(dockingRow);
      dropdownHandler.setValue(commentBtn, 'Other');
      let otherInput = page.getOtherCommentInputFromDockingRow(dockingRow);
      expect(await otherInput.isDisplayed()).toBe(true);

      const str = e2eRng.getRandomString();
      await otherInput.clear();
      await otherInput.sendKeys(str);
      await saveBtn.click();

      await page.navigateTo();
      dockingRow = page.getFirstDockingEntry();
      otherInput = page.getOtherCommentInputFromDockingRow(dockingRow);
      expect(await otherInput.isDisplayed()).toBe(true);
      expect(await otherInput.getAttribute('value')).toBe(str);
      await page.validateNoConsoleErrors();
    });

  });


  describe('should be able to manage video requests', () => {
    let dockingRow: ElementFinder;
    let saveBtn: ElementFinder;

    beforeEach( async () => {
      page = new CtvDprPage();
      await page.navigateTo();
      dockingRow = await page.getFirstDockingEntry();
      saveBtn = await page.getSaveButtonFromDockingRow(dockingRow);
    });

    it('should request video from docking', async () => {
      let videoRequestBtn = page.getVideoRequestButtonFromDockingRow(dockingRow);

      const initial_request_status = await videoRequestBtn.getText();
      if (initial_request_status ==  'Not requested') await videoRequestBtn.click();
      expect(await videoRequestBtn.getText()).toBe('Requested');

      await page.navigateTo();
      videoRequestBtn = page.getVideoRequestButtonFromDockingRow(dockingRow);
      expect(await videoRequestBtn.getText()).toBe('Requested');
      await videoRequestBtn.click();
      expect(await videoRequestBtn.getText()).toBe('Not requested');

      await page.navigateTo();
      expect(await videoRequestBtn.getText()).toBe('Not requested');
      await page.validateNoConsoleErrors();
    }, 60000);
  });


  describe('should create slip graphs', () => {
    beforeEach(() => {
      page = new CtvDprPage();
      return page.navigateTo();
    });

    it('and loaded slip graphs', async () => {
      expect(await page.getSlipGraphs().count()).toBeGreaterThan(0);
      const slip = page.getSlipGraph(0);
      expect(await slip.isDisplayed()).toBe(true);
      await page.validateNoConsoleErrors();
    });

    it('and have formatted slip graphs', async () => {
      const slips = await page.getSlipGraphs();
      await page.asyncForEach(slips, async _slip => {
        expect(await _slip.isDisplayed()).toBe(true);
        const title = page.getTitleFromSlipGraph(_slip);
        expect(await title.isDisplayed()).toBe(true);
        expect(await title.getText()).toMatch(/Transfer: #\d+ - location: \w+ - Score: \d/);
        const canvas = page.getCanvasFromSlipGraph(_slip);
        expect(await canvas.isDisplayed()).toBe(true);
      });
      await page.validateNoConsoleErrors();
    });
  });

  describe('should go to LTM', () => {
    beforeEach(() => {
      page = new CtvDprPage();
      return page.navigateTo();
    });

    it('should show goToLtmButton', async () => {
      const goToLtmButton = page.getGoToLTMButton();
      expect(await goToLtmButton.isPresent()).toBeTruthy('Ltm button not found!')
      await page.validateNoConsoleErrors();
    });

    it('should show goToLtmButton', async () => {
      const goToLtmButton = page.getGoToLTMButton();
      expect(await goToLtmButton.isPresent()).toBeTruthy('Ltm button not found!')
      await page.validateNoConsoleErrors();
    });

    it('should go to Ltm', async () => {
      const goToLtmButton = page.getGoToLTMButton();
      expect(await goToLtmButton.isPresent()).toBeTruthy('Ltm button not found!')
      goToLtmButton.click();
      await page.validateNoConsoleErrors();
      expect(await page.getUrl()).toMatch('reports/longterm;mmsi=123456789;vesselName=TEST%20BMO');
    });

    

  });
  
});

function log(message) {
  const today = new Date()
  const ts = today.toString().slice(16,24) + '.' + today.getMilliseconds();
  console.log(`${ts}: ${message}`)
}
