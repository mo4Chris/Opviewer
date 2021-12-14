import { element, by, ElementFinder } from 'protractor';
import { CtvDprPage } from './ctvdpr.po';
import { E2eDropdownHandler } from '../SupportFunctions/e2eDropdown.support';
import { E2eRandomTools } from '../SupportFunctions/e2eRandom.support';


const dropdownHandler = new E2eDropdownHandler();
const e2eRng = new E2eRandomTools();
describe('CTV dpr', () => {
  let page: CtvDprPage;
  // afterEach(() => {
  //   page.validateNoConsoleLogs();
  // });

  describe('should not fail without data', () => {
    beforeEach(() => {
      page = new CtvDprPage();
      return page.navigateToEmpty();
    });

    it('and not redirect', async () => {
      expect(await page.getUrl()).toMatch('reports/dpr;mmsi');
    });

    it('and display no data message', async () => {
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

    it('Should load a map', async () => {
      expect(await page.getMap().isPresent()).toBe(true);
    });

    // Check if route is drawn
    // Check if turbines are drawn
    // Check if zoom is ok
  });

  describe('Should generate print preview', () => {
    beforeEach(() => {
      page = new CtvDprPage();
      return page.navigateTo();
    });

    it('Should have working print all button', async () => {
      const printButton = await page.getPrintFullButton();
      const result = await page.clickPrintButton(printButton);
      expect(result).toBe(true);
    });
  });

  describe('Should switch dates', () => {
    beforeEach(() => {
      page = new CtvDprPage();
      return page.navigateTo();
    });

    it('Should not redirect', async () => {
      expect(await page.getUrl()).toMatch('reports/dpr;mmsi');
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
    });

    it('Should save fuel consumption', async () => {
      let fuelConsumed = page.getFuelInput();
      const oldFuel = e2eRng.getRandomInt(500, 1000);

      expect(await fuelConsumed.isDisplayed()).toBe(true);
      await fuelConsumed.clear();
      await fuelConsumed.sendKeys(oldFuel);
      const saveBtn = page.getStatsSaveBtn();
      await saveBtn.click();
      await page.navigateTo();
      fuelConsumed = page.getFuelInput();
      expect(await fuelConsumed.getValue()).toBe(oldFuel.toString());
    });

    it('Should save waste oil consumption', async () => {
      let wasteOilLanded = page.getWasteoilInput();
      const oldFuel = e2eRng.getRandomInt(0, 100);

      expect(await wasteOilLanded.isDisplayed()).toBe(true);
      await wasteOilLanded.clear();
      await wasteOilLanded.sendKeys(oldFuel);
      const saveBtn = page.getStatsSaveBtn();
      await saveBtn.click();
      await page.navigateTo();
      wasteOilLanded = page.getWasteoilInput();
      expect(await wasteOilLanded.getValue()).toBe(oldFuel.toString());
    });

    it('Should save garbage landed', async () => {
      let garbageLanded = page.getGarbagelandedInput();
      const landed = e2eRng.getRandomNumber(0, 0.5);

      expect(await garbageLanded.isDisplayed()).toBe(true, 'Garbage input did not load');
      await garbageLanded.clear();
      await garbageLanded.sendKeys(landed);
      const saveBtn = page.getStatsSaveBtn();
      await saveBtn.click();
      await page.navigateTo();
      garbageLanded = page.getGarbagelandedInput();
      expect(await garbageLanded.getValue()).toBe(landed.toString());
    });

  });

  describe('Should generate dockings', () => {
    let dockingRow: ElementFinder;
    let saveBtn: ElementFinder;

    beforeEach(async () => {
      page = new CtvDprPage();
      await page.navigateTo();
      dockingRow = await page.getFirstDockingEntry();
      saveBtn = await page.getSaveButtonFromDockingRow(dockingRow);
    });

    it('should have loaded correctly', async () => {
      expect(await dockingRow.isPresent()).toBe(true, 'Docking row should be present')
      expect(await saveBtn.isPresent()).toBe(true, 'Docking row should be present')
      await page.validateNoConsoleErrors()
    })

    it('should have multiple dockings', () => {
      const dockings = page.getAllDockings();
      expect(dockings.count()).toBeGreaterThan(0);
    });

    it('should set normal values for docking table', async () => {
      expect(await dockingRow.isPresent()).toBe(true, 'Page should contain docking row');
      const elt = await page.getEltInDockingRow(dockingRow, 0);
      expect(await elt.getText()).toBe('1');

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
      await page.validateNoConsoleErrors()
    });

    it('and allow users to input pax in / out', async () => {
      // Init pax in/out
      expect(await saveBtn.isEnabled()).toBe(false, 'Save button should only enable on input change');
      let paxInInput = page.getPaxInputFromDockingRow(dockingRow);
      let paxOutInput = page.getPaxOutputFromDockingRow(dockingRow);
      await paxInInput.clear(); await paxInInput.sendKeys(1);
      await paxOutInput.clear(); await paxOutInput.sendKeys(2);
      let cargoInput = page.getCargoInputFromDockingRow(dockingRow);
      let cargoOutput = page.getCargoOutputFromDockingRow(dockingRow);
      await cargoInput.clear(); await cargoInput.sendKeys(3);
      await cargoOutput.clear(); await cargoOutput.sendKeys(4);
      await saveBtn.click();

      // Save
      await page.navigateTo();
      paxInInput = page.getPaxInputFromDockingRow(dockingRow);
      expect(await paxInInput.getValue()).toBe('1');
      paxOutInput = page.getPaxOutputFromDockingRow(dockingRow);
      expect(await paxOutInput.getValue()).toBe('2');
      await paxInInput.clear(); await paxInInput.sendKeys(0);
      await paxOutInput.clear(); await paxOutInput.sendKeys(0);
      cargoInput = page.getCargoInputFromDockingRow(dockingRow);
      expect(await cargoInput.getValue()).toBe('3');
      cargoOutput = page.getCargoOutputFromDockingRow(dockingRow);
      expect(await cargoOutput.getValue()).toBe('4');
      await cargoInput.clear(); await cargoInput.sendKeys(0);
      await cargoOutput.clear(); await cargoOutput.sendKeys(0);

      await saveBtn.click();

      // Check if we were not seeing old values
      await page.navigateTo();
      paxInInput = page.getPaxInputFromDockingRow(dockingRow);
      expect(await paxInInput.getValue()).toBe('0');
      paxOutInput = page.getPaxOutputFromDockingRow(dockingRow);
      expect(await paxOutInput.getValue()).toBe('0');
      cargoInput = page.getCargoInputFromDockingRow(dockingRow);
      expect(await cargoInput.getValue()).toBe('0');
      cargoOutput = page.getCargoOutputFromDockingRow(dockingRow);
      expect(await cargoOutput.getValue()).toBe('0');
      await page.validateNoConsoleErrors()
    });

    it('should save default comments', async () => {
      let commentBtn = page.getCommentButtonFromDockingRow(dockingRow);
      expect(await dropdownHandler.getValue(commentBtn)).toMatch(/\w+/, 'Comment should be formatted');
      expect(await dropdownHandler.getNumOptions(commentBtn)).toBeGreaterThan(1);

      await dropdownHandler.setValueByIndex(commentBtn, 1);
      let oldValue = await dropdownHandler.getValue(commentBtn);

      await saveBtn.click();

      commentBtn = page.getCommentButtonFromDockingRow(dockingRow);
      expect(await dropdownHandler.getValue(commentBtn)).toBe(oldValue);

      await dropdownHandler.setValueByIndex(commentBtn, 0);
      oldValue = await dropdownHandler.getValue(commentBtn);
      await saveBtn.click();

      commentBtn = page.getCommentButtonFromDockingRow(dockingRow);
      expect(await dropdownHandler.getValue(commentBtn)).toBe(oldValue);
    });

    it('should save other comments', async () => {
      const commentBtn = page.getCommentButtonFromDockingRow(dockingRow);
      await dropdownHandler.setValue(commentBtn, 'Other');
      let otherInput = page.getOtherCommentInputFromDockingRow(dockingRow);
      expect(await otherInput.isDisplayed()).toBe(true);

      const str = e2eRng.getRandomString();
      await otherInput.clear();
      await otherInput.sendKeys(str);
      await saveBtn.click();

      await page.navigateTo();
      dockingRow = await page.getFirstDockingEntry();
      otherInput = page.getOtherCommentInputFromDockingRow(dockingRow);
      expect(await otherInput.isDisplayed()).toBe(true);
      expect(await otherInput.getAttribute('value')).toBe(str);
      await page.validateNoConsoleErrors()
    });

  });


  describe('should not be able to manage video requests', () => {
    let dockingRow: ElementFinder;
    let saveBtn: ElementFinder;

    beforeEach(async () => {
      page = new CtvDprPage();
      await page.navigateTo();
      dockingRow = page.getFirstDockingEntry();
      saveBtn = page.getSaveButtonFromDockingRow(dockingRow);
    });

    it('and video request should not be displayed', async () => {
      const videoRequest = element(by.name('videoRequest'))
      expect(await videoRequest.isPresent()).toBe(false);
    });
  });


  describe('should create slip graphs', () => {
    beforeEach(() => {
      page = new CtvDprPage();
      return page.navigateTo();
    });

    it('and have loaded slip graphs', async () => {
      expect(await page.getSlipGraphs().count()).toBeGreaterThan(0);
      const slip = page.getSlipGraph(0);
      expect(await slip.isDisplayed()).toBe(true);
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
});
