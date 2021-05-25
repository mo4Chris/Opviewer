import { browser, element, by, ExpectedConditions, ElementFinder, ElementArrayFinder, Key } from 'protractor';
import { SovDprPage, E2eDprInputTableElt } from './sovdpr.po';
import { E2eSelectHandler } from '../SupportFunctions/e2eDropdown.support';

describe('Sov dpr', () => {
  let page: SovDprPage;
  // afterEach(() => {
  //   page.validateNoConsoleLogs();
  // });

  describe('in case of no data', () => {
    beforeEach(() => {
      page = new SovDprPage();
      return page.navigateToEmpty();
    });

    it('should not redirect', async () => {
      expect(await page.getUrl()).toMatch('reports/dpr;mmsi');
      await page.validateNoConsoleErrors();
    });
    it('should display the no data message', async () => {
      const noDataMsg = element(by.tagName('h3'));
      expect(await noDataMsg.isDisplayed()).toBe(true);
      expect(await noDataMsg.getText()).toMatch('There is no map available for the selected day and vessel.');
    });
    it('should disable the summary tab', async () => {
      await page.clickTabByName('Transfers');
      const tab = page.getTabByName('Workability');
      expect(await page.tabIsEnabled(tab)).toBe(false, 'Summary tab holds no usefull information w/out data');
    });
  });

  describe('should always', () => {
    beforeEach(() => {
      page = new SovDprPage();
      return page.navigateTo();
    });

    it('default to DPR input tab', async () => {
      expect(await page.getActiveTab().getText()).toMatch('DPR input');
    })
    it('load a map', async () => {
      expect(await page.getMap().isPresent()).toBe(true);
    });
    // Check if route is drawn
    // Check if turbines are drawn
    // Check if zoom is ok
    it('have a working print all button', async () => {
      const printButton = page.getPrintFullButton();
      expect(await printButton.isPresent()).toBe(true);
      const result = page.clickPrintButton(printButton);
      expect(await result).toBe(true);
    });
    it('not redirect', async () => {
      expect(await page.getUrl()).toMatch('reports/dpr;mmsi');
      await page.validateNoConsoleErrors();
    });
    it('have a valid date switch interface', async () => {
      expect(await page.getPrevDayButton().isPresent()).toBe(true);
      expect(await page.getNextDayButton().isPresent()).toBe(true);
      expect(await page.getDatePickerbtn().isPresent()).toBe(true);
      expect(await page.getCurrentDateField().isPresent()).toBe(true);
      expect(await page.getDatePickerString()).toMatch(/\d{4}-\d{2}-\d{2}/);
    });
    it('switch dates via buttons', async () => {
      const prevDayBtn = page.getPrevDayButton();
      const nextDayBtn = page.getNextDayButton();
      const oriDate = await page.getDatePickerString();
      await prevDayBtn.click();
      await browser.waitForAngular();
      expect(await page.getDatePickerString()).not.toBe(oriDate);
      await nextDayBtn.click();
      await browser.waitForAngular();
      expect(await page.getDatePickerString()).toBe(oriDate);
    });
    it('should switch dates via date picker', async () => {
      await page.switchDate({
        year: 2019,
        month: 10,
        day: 3
      });
      await browser.waitForAngular();
      const changed_date_string = await page.getDatePickerString()
      expect(changed_date_string).toBe('2019-10-03');
    });
    it('should have vessel switch dropdown disabled', async () => {
      const vesselDropdown = page.getVesselDropdown();
      expect(await vesselDropdown.isEnabled()).toBe(false);
      expect(await vesselDropdown.getText()).toBe('SOV example');
    });
  });

  describe('Workability (old summary) tab', () => {
    beforeEach(() => {
      page = new SovDprPage();
      return page.navigateTo('Workability');
    });

    it('should be selected on intialization', async () => {
      expect(await page.getActiveTab().getText()).toMatch('Workability');
      const tab = page.getTabByName('Workability');
      expect(await page.tabIsEnabled(tab)).toBe(true);
    });
    it('should not show NaNs', async () => {
      expect(await page.getNanCount()).toBe(0);
      await page.validateNoConsoleErrors();
    });
    it('should render daily stats', async () => {
      expect(await page.getContainerByTitle('Daily Summary').isDisplayed()).toBe(true);
      expect(await page.getValueByCellKey('Distance sailed').getText()).toMatch(/\d+/);
      expect(await page.getValueByCellKey('Number of gangway connections').getText()).toMatch(/\d+/);
      const avgDockingTime = page.getValueByCellKey('Number of CTV vessel to vessel transfers');
      expect(await avgDockingTime.getText()).toMatch(/\d+/);

      const cell = page.getCellByKey('Number of CTV vessel to vessel transfers');
      expect(await cell.isDisplayed()).toBe(true);
      const tooltip = await page.getTooltipForElt(cell);
      expect(await tooltip.isPresent()).toBe(true, 'Tooltip should render');
      expect(await tooltip.getText()).toMatch(/\w+ \w+/, 'Tooltip should render');
    });
    it('should render charts', async () => {
      expect(await page.summary.getOperationActivityChart().isDisplayed()).toBe(true);
      expect(await page.summary.getGangwayLimitationChart().isDisplayed()).toBe(true);
    });
    it('should render weather overview', async () => {
      expect(await page.getContainerByTitle('Weather overview').isDisplayed()).toBe(true);
      const weatherChart = page.summary.getWeatherOverviewChart()
      expect(await weatherChart.isPresent()).toBeTruthy();
    });
  });

  describe('transfers tab', () => {
    beforeEach(() => {
      page = new SovDprPage();
      return page.navigateTo('Transfers');
    });

    it('should have switched tab', async () => {
      expect(await page.getActiveTab().getText()).toMatch('Transfers');
      expect(await page.getContainerByTitle('Daily Summery').isPresent())
        .toBe(false, 'Summary info should no longer be present');
    });
    it('should not show NaNs', async () => {
      expect(await page.getNanCount()).toBe(0);
      await page.validateNoConsoleErrors();
    });
    it('should have a proper DC table', async () => {
      const dcTable = page.transfer.getDcTable();
      expect(await dcTable.isPresent()).toBe(true, 'DC table must be loaded');
      const addMissedTransferBtn = dcTable.element(by.buttonText('Add missed transfer'));
      expect(await addMissedTransferBtn.isPresent()).toBe(true);
      const removeLastMissedTransferBtn = dcTable.element(by.buttonText('Remove last transfer'));
      expect(await removeLastMissedTransferBtn.isPresent()).toBe(true);

      expect(await page.transfer.getDcSaveBtn().isPresent()).toBe(false);
      await removeLastMissedTransferBtn.click();
      page.getInputByPlaceholder('turbine', dcTable).sendKeys('Test turbine');
      expect(await page.transfer.getDcSaveBtn().isDisplayed()).toBe(true);
      // ToDo: add save / load test
    });
    it('should have a proper Rov ops table', async () => {
      const opsTable = page.transfer.getRovTable();
      expect(await opsTable.isPresent()).toBe(true, 'Rov ops table must be loaded');
      const addMissedTransferBtn = opsTable.element(by.buttonText('add line'));
      expect(await addMissedTransferBtn.isPresent()).toBe(true, 'Must have add line btn');
      const removeLastMissedTransferBtn = opsTable.element(by.buttonText('remove last'));
      expect(await removeLastMissedTransferBtn.isPresent()).toBe(true, 'Must have remove last line btn');

      await removeLastMissedTransferBtn.click();
      await addMissedTransferBtn.click();
      const LocationInput = page.getInputByPlaceholder('Location', opsTable);
      expect(await LocationInput.isPresent()).toBe(true, 'Location input must be present');
      await LocationInput.sendKeys('Test turbine');
      expect(await page.transfer.getRovSaveBtn().isPresent()).toBe(true, 'Save btn should be enabled');
      // ToDo: add save / load test
    });

    describe('turbine table', () => {
      let table: ElementFinder;
      beforeEach(() => {
        table = page.transfer.getTurbineTable();
      });

      it('should load properly', async () => {
        const turb = page.transfer;
        expect(await table.isPresent()).toBe(true);
        expect(await turb.getPlatformTable().isPresent()).toBe(false);
        const row = turb.getRows(table);
        expect(await row.count()).toBeGreaterThan(0);
      });
      it('should allow save pax in/out', async () => {
        const turb = page.transfer;
        const row = turb.getRows(table).get(0);
        const rndPaxCargo = turb.getRndpaxCargo();
        const rowCnt = await turb.getRows(table).count();
        await turb.setPaxCargo(row, rndPaxCargo);
        await turb.saveTurbineTransfers();

        await page.navigateTo('Transfers');
        expect(await turb.getRows(table).count()).toBe(rowCnt);
        const newPax = await turb.getPaxCargo(row);
        expect(newPax.paxIn).toBe(rndPaxCargo.paxIn);
        expect(newPax.paxOut).toBe(rndPaxCargo.paxOut);
        expect(newPax.cargoIn).toBe(rndPaxCargo.cargoIn);
        expect(newPax.cargoOut).toBe(rndPaxCargo.cargoOut);
      });
      it('should allow adding heli transfers', async () => {
        const turb = page.transfer;
        const helirows = turb.getHeliRows(table);
        await page.asyncForEach(await helirows, async (_, index) => {
          if (index > 0 ) {
            await helirows.first().element(by.buttonText('remove last transfer')).click();
          }
        })
        expect(await helirows.count()).toBeGreaterThan(0);
        await helirows.first().element(by.buttonText('add helicopter transfer')).click();
        const rndPaxCargo = turb.getRndpaxCargo();
        await turb.setPaxCargo(helirows.last(), rndPaxCargo);
        await turb.saveTurbineTransfers();

        await page.navigateTo('Transfers');
        expect(await helirows.count()).toBe(2);
        const hrow = helirows.get(1);
        const newPax = await turb.getPaxCargo(hrow);
        expect(newPax.paxIn).toBe(rndPaxCargo.paxIn);
        expect(newPax.paxOut).toBe(rndPaxCargo.paxOut);
        expect(newPax.cargoIn).toBe(rndPaxCargo.cargoIn);
        expect(newPax.cargoOut).toBe(rndPaxCargo.cargoOut);
      });
      it('should allow adding missed transfers', async () => {
        const turb = page.transfer;
        const rows = turb.getMissedTransferRows(table);
        await rows.each((_, index) => {
          if (index > 0 ) {
            rows.first().element(by.buttonText('remove last transfer')).click();
          }
        });
        expect(await rows.count()).toBeGreaterThan(0);
        await rows.first().element(by.buttonText('add missed transfer')).click();
        const rndPaxCargo = turb.getRndpaxCargo();
        await turb.setPaxCargo(rows.last(), rndPaxCargo);
        const rndLoc = page.rng.getRandomString();
        await rows.last().all(by.tagName('input')).get(0).clear();
        await rows.last().all(by.tagName('input')).get(0).sendKeys(rndLoc);
        await turb.saveTurbineTransfers();

        await page.navigateTo('Transfers');
        expect(rows.count()).toBe(2);
        const hrow = rows.get(1);
        const newLoc = await hrow.all(by.tagName('input')).get(0).getAttribute('value');
        expect(newLoc).toBe(rndLoc);
        const newPax = await turb.getPaxCargo(hrow);
        expect(newPax.paxIn).toBe(rndPaxCargo.paxIn);
        expect(newPax.paxOut).toBe(rndPaxCargo.paxOut);
        expect(newPax.cargoIn).toBe(rndPaxCargo.cargoIn);
        expect(newPax.cargoOut).toBe(rndPaxCargo.cargoOut);
      });
    });
  });

  describe('platform table', () => {
    let table: ElementFinder;
    beforeEach(async () => {
      page = new SovDprPage();
      table = page.transfer.getPlatformTable();
      await page.navigateToPlatform('Transfers');
    });

    it('should load properly', async () => {
      const turb = page.transfer;
      expect(await page.getNanCount()).toBe(0, 'Nans detected');
      expect(await table.isDisplayed()).toBe(true);
      expect(await turb.getTurbineTable().isPresent()).toBe(false);
      const row = turb.getRows(table);
      expect(await row.count()).toBeGreaterThan(0, 'Turbine rows');
    });
    it('should allow save pax in/out', async () => {
      const turb = page.transfer;
      const row = turb.getRows(table).get(0);
      const rndPaxCargo = turb.getRndpaxCargo();
      const rowCnt = await turb.getRows(table).count();
      await turb.setPaxCargo(row, rndPaxCargo);
      await turb.savePlatformTransfers();

      await page.navigateToPlatform('Transfers');
      expect(await turb.getRows(table).count()).toBe(rowCnt);
      const newPax = await turb.getPaxCargo(row);
      expect(newPax.paxIn).toBe(rndPaxCargo.paxIn);
      expect(newPax.paxOut).toBe(rndPaxCargo.paxOut);
      expect(newPax.cargoIn).toBe(rndPaxCargo.cargoIn);
      expect(newPax.cargoOut).toBe(rndPaxCargo.cargoOut);
    });
    it('should allow adding heli transfers', async () => {
      const turb = page.transfer;
      const helirows = turb.getHeliRows(table);
      await helirows.each(async (_, index) => {
        if (index > 0 ) {
          await helirows.first().element(by.buttonText('remove last transfer')).click();
        }
      });
      expect(await helirows.count()).toBeGreaterThan(0);
      await helirows.first().element(by.buttonText('add helicopter transfer')).click();
      const rndPaxCargo = turb.getRndpaxCargo();
      await turb.setPaxCargo(helirows.last(), rndPaxCargo);
      await turb.savePlatformTransfers();

      await page.navigateToPlatform('Transfers');
      expect(await helirows.count()).toBe(2);
      const hrow = helirows.get(1);
      const newPax = await turb.getPaxCargo(hrow);
      expect(newPax.paxIn).toBe(rndPaxCargo.paxIn);
      expect(newPax.paxOut).toBe(rndPaxCargo.paxOut);
      expect(newPax.cargoIn).toBe(rndPaxCargo.cargoIn);
      expect(newPax.cargoOut).toBe(rndPaxCargo.cargoOut);
    });
    it('should allow adding missed transfers', async () => {
      const turb = page.transfer;
      const rows = turb.getMissedTransferRows(table);
      await rows.each(async (_, index) => {
        if (index > 0 ) {
          await rows.first().element(by.buttonText('remove last transfer')).click();
        }
      });
      expect(rows.count()).toBeGreaterThan(0);
      await rows.first().element(by.buttonText('add missed transfer')).click();
      const rndPaxCargo = turb.getRndpaxCargo();
      await turb.setPaxCargo(rows.last(), rndPaxCargo);
      const rndLoc = page.rng.getRandomString();
      await rows.last().all(by.tagName('input')).get(0).clear();
      await rows.last().all(by.tagName('input')).get(0).sendKeys(rndLoc);
      await turb.savePlatformTransfers();

      await page.navigateToPlatform('Transfers');
      expect(await rows.count()).toBe(2);
      const hrow = rows.get(1);
      const newLoc = await hrow.all(by.tagName('input')).get(0).getAttribute('value');
      expect(newLoc).toBe(rndLoc);
      const newPax = await turb.getPaxCargo(hrow);
      expect(newPax.paxIn).toBe(rndPaxCargo.paxIn);
      expect(newPax.paxOut).toBe(rndPaxCargo.paxOut);
      expect(newPax.cargoIn).toBe(rndPaxCargo.cargoIn);
      expect(newPax.cargoOut).toBe(rndPaxCargo.cargoOut);
    });
  });

  describe('DPR input tab', () => {
    beforeEach(() => {
      page = new SovDprPage();
      return page.navigateToEmpty('DPR input');
    });

    it('should load both tables', async () => {
      const io = page.dprinput;
      expect(await io.dprInput.isDisplayed()).toBe(true);
      expect(await io.hseInput.isDisplayed()).toBe(true);
      await page.validateNoConsoleErrors();
    });
    it('should correctly enter the first table', async () => {
      const io = page.dprinput;
      const selectHelper = new E2eSelectHandler();
      const clearArray = async (elt: {rows: ElementArrayFinder, addline: ElementFinder}) => {
        page.asyncForEach(await elt.rows, async _ => await io.removeLine(elt.addline));
      };
      const standby = io.getStandby();
      const techdt = io.getTechnicalDowntime();
      const weatherdt = io.getWeatherDowntime();
      const accessDayType = io.getAccessDayType();
      await clearArray(standby);
      await clearArray(techdt);
      await clearArray(weatherdt);
      expect(await standby.rows.count()).toBe(0);
      expect(await techdt.rows.count()).toBe(0);
      expect(await weatherdt.rows.count()).toBe(0);
      expect(await accessDayType.isPresent()).toBe(true);
      await io.addLine(standby.addline);
      await io.addLine(techdt.addline);
      await io.addLine(weatherdt.addline);

      await browser.waitForAngular();
      expect(await standby.rows.count()).toBe(1);
      expect(await techdt.rows.count()).toBe(1);
      expect(await weatherdt.rows.count()).toBe(1);

      const standbyTimes = await io.setRandomTime(standby.rows.first());
      const techTimes = await io.setRandomTime(techdt.rows.first());
      const weatherTimes = await io.setRandomTime(weatherdt.rows.first());
      const selectedAccessType = await selectHelper.setNewOption(accessDayType);
      await io.dprInput.click(); // Required to trigger change detection on closing the window
      await browser.waitForAngular();
      await io.saveDprTableByIndex(0);
      await browser.waitForAngular();

      await page.navigateToEmpty('DPR input');
      expect(await standby.rows.count()).toBe(1);
      expect(await techdt.rows.count()).toBe(1);
      expect(await weatherdt.rows.count()).toBe(1);
      await io.checkRowTimes(standby.rows.first(), standbyTimes);
      await io.checkRowTimes(techdt.rows.first(), techTimes);
      await io.checkRowTimes(weatherdt.rows.first(), weatherTimes);
      const newDayType = await selectHelper.getValue(accessDayType)
      expect(newDayType).toBe(selectedAccessType);
    }, 60000);
    it('should have a functioning reports & toolbox talks table', async () => {
      const io = page.dprinput;
      const socCards = await io.getSocCards();
      page.asyncForEach(socCards, () => io.rmSocCard());
      const tbTalks = await io.getToolboxTalks()
      page.asyncForEach(tbTalks, async () => await io.rmToolboxTalk());
      expect(await io.getSocCards().count()).toBe(0);
      expect(await io.getToolboxTalks().count()).toBe(0);
      await io.addSocCard();
      await io.addToolboxTalk();
      const socText = page.rng.getRandomString();
      const tbText = page.rng.getRandomString();
      const socArea = io.getSocCards().first().element(by.tagName('textarea'));
      expect(await socArea.isPresent()).toBe(true);
      await socArea.sendKeys(socText);
      const tbArea = io.getToolboxTalks().first().element(by.tagName('textarea'));
      expect(await tbArea.isPresent()).toBe(true);
      await tbArea.sendKeys(tbText);
      await io.saveSocToolbox();

      await page.navigateToEmpty('DPR input');
      expect(await io.getSocCards().count()).toBe(1);
      expect(await io.getToolboxTalks().count()).toBe(1);
      expect(await socArea.getAttribute('value')).toBe(socText);
      expect(await tbArea.getAttribute('value')).toBe(tbText);
    });
    it('should have a functioning fuel input', async () => {
      const io = page.dprinput;
      const index = page.rng.getRandomInt(0, 15);
      const fuelTable = io.getDprInputTable(2);
      const fuelIn = fuelTable.all(by.tagName('input')).get(index);
      const rndFuel = page.rng.getRandomInt(20, 1000).toString();
      await fuelIn.clear();
      await fuelIn.sendKeys(rndFuel);
      await fuelIn.sendKeys(Key.TAB);
      await fuelTable.element(by.buttonText('Save')).click();
      await browser.waitForAngular();

      await page.navigateToEmpty('DPR input');
      expect(await fuelIn.getAttribute('value')).toBe(rndFuel);
    });
    it('should have a functioning catering', async () => {
      const io = page.dprinput;
      const table = io.getDprInputTable(3);
      const rndMeals = page.rng.getRandomInt(1, 100).toString();
      const cateringInput = table.all(by.tagName('input')).get(2);
      await cateringInput.clear();
      await cateringInput.sendKeys(rndMeals);
      await table.element(by.buttonText('Save')).click();
      await browser.waitForAngular();

      await page.navigateToEmpty('DPR input');
      expect(await cateringInput.getAttribute('value')).toBe(rndMeals);
    });
    it('should have a functioning dp usage', async () => {
      const io = page.dprinput;
      const rng = page.rng;
      const table = io.getDprInputTable(4);

      const lines = table.all(by.name('dpRow'));
      const addLine = table.element(by.buttonText('add line'));
      const rmLine = table.element(by.buttonText('remove last'));
      await page.asyncForEach(await lines, async () => await rmLine.click())
      expect(await lines.count()).toBe(0);
      await addLine.click();
      expect(await lines.count()).toBe(1);

      const start = rng.getRandomInt(11, 15);
      const stop = rng.getRandomInt(16, 23);
      const inputs = lines.first().all(by.tagName('select'));
      // Technically these are select elements - might break
      await inputs.get(0).sendKeys(start);
      await inputs.get(2).sendKeys(stop);
      await table.element(by.buttonText('Save')).click();
      await browser.waitForAngular();
      await page.validateNoConsoleErrors();

      await page.navigateToEmpty('DPR input');
      expect(await lines.count()).toBe(1);
      expect(await inputs.get(0).getAttribute('value')).toBe(start.toString());
      expect(await inputs.get(2).getAttribute('value')).toBe(stop.toString());
      await page.validateNoConsoleErrors();
    });
    it('should have proper remarks', async () => {
      const io = page.dprinput;
      const table = io.getDprInputTable(5);
      const remark = page.rng.getRandomString();
      const remarkField = table.element(by.tagName('textarea'));
      await remarkField.clear();
      await remarkField.sendKeys(remark);
      await table.element(by.buttonText('Save remarks')).click();
      await browser.waitForAngular();

      await page.navigateToEmpty('DPR input');
      const new_remark = await remarkField.getAttribute('value')
      expect(new_remark).toBe(remark);
    });
    it('should save at least 1 hse input value', async () => {
      const hse = page.dprinput.hseInput;
      expect(await hse.isDisplayed()).toBe(true);
      const testFieldIndex = page.rng.getRandomInt(0, 21);
      const cnt = hse.all(by.tagName('input')).get(testFieldIndex);
      const txt = hse.all(by.tagName('textarea')).get(testFieldIndex);
      const rndTxt = page.rng.getRandomString();
      const rndCnt = page.rng.getRandomInt(1, 20);
      await cnt.clear();
      await cnt.sendKeys(rndCnt);
      await txt.clear();
      await txt.sendKeys(rndTxt);
      await hse.element(by.buttonText('Save HSE input')).click();
      await browser.waitForAngular();

      await page.navigateToEmpty('DPR input');
      const newCnt = await cnt.getAttribute('value');
      const newTxt = await txt.getAttribute('value');
      expect(newCnt).toBe(rndCnt.toString(), 'Count does not match');
      expect(newTxt).toBe(rndTxt, 'Text does not match');
    });
  });

  describe('Commercial overview tab', () => {
    beforeEach(() => {
      page = new SovDprPage();
      return page.navigateTo('Commercial overview');
    });

    it('should have proper data', async () => {
      const io = page.dprinput;
      expect(await io.getStandby().rows.count()).toBeGreaterThan(0);
      expect(await io.getTechnicalDowntime().rows.count()).toBeGreaterThan(0);
      expect(await io.getWeatherDowntime().rows.count()).toBeGreaterThan(0);
      await page.validateNoConsoleErrors();
    });
  });

  describe('HSE overview', () => {
    beforeEach(() => {
      page = new SovDprPage();
      return page.navigateTo('HSE overview');
    });

    it('Should have proper data', async () => {
      expect(await page.getNanCount()).toBe(0);
      await page.validateNoConsoleErrors();
    });
  });
});

const log = (elt: ElementFinder) => {
  elt.getText().then(e => {
    console.log(e);
  });
  return elt;
};

const sleep = (timeout: number) => {
  browser.sleep(timeout);
};
