import { browser, element, by, ElementFinder } from 'protractor';
import { env } from 'process';
import { E2eDropdownHandler } from '../SupportFunctions/e2eDropdown.support';
import { E2ePageObject } from '../SupportFunctions/e2epage.support';
import { E2eTableHandler } from '../SupportFunctions/e2eTable.support';

const dropdownHandler = new E2eDropdownHandler();
const tableHandler = new E2eTableHandler();
export class CtvDprPage extends E2ePageObject {
  navigateTo() {
    return browser.get('/reports/dpr;mmsi=123456789;date=737700');
  }
  navigateToEmpty() {
    return browser.get('/reports/dpr;mmsi=123456789;date=737701');
  }
  navigateToLatest() {
    return browser.get('/reports/dpr;mmsi=123456789');
  }

  getMap() {
    return element(by.css('agm-map'));
  }
  getDate() {
    throw new Error(('To be done!'));
  }
  getPrintFullButton() {
    return element(by.buttonText('Print DPR Full'));
  }
  getCurrentPrintMode() {
    // return element(by.binding('printMode')).getText();
  }

  getEltsWithText(txt: string) {
    return element.all(by.xpath('//*[contains(text(),\'' + txt + '\')]'));
  }

  getFuelInput() {
    return this.addGetValue(element(by.id('fuelConsumedInput')));
  }
  getWasteoilInput() {
    return this.addGetValue(element(by.id('wasteOilInput')));
  }
  getGarbagelandedInput() {
    return this.addGetValue(element(by.id('garbageLandedInput')));
  }

  getStatsSaveBtn(index = 0) {
    return element.all(by.buttonText('Save general stats')).get(index);
  }
  clickPrintButton(printButton: ElementFinder) {
    const printIsClicked = browser.executeAsyncScript(function (elm, callback) {
      function listener() {
        callback(true);
      }
      window.print = listener;
      elm.click();
    }, printButton.getWebElement());
    return printIsClicked;
  }

  getAllDockings() {
    return element.all(by.xpath('//app-ctv-turbine-transfer/table/tbody/tr'));
  }
  getFirstDockingEntry() {
    return this.getAllDockings().first();
  }
  getEltInDockingRow(row: ElementFinder, index: number) {
    return tableHandler.getRowElementByIndex(row, index);
  }
  getElementInDockingRowByTitle(row: ElementFinder, title: string) {
    const table = element(by.xpath('//app-ctv-turbine-transfer/table'));
    expect(table.isPresent()).toBeTruthy('CTV turbine table must be present');
    return tableHandler.getElementInRowByTitle(table, row, title);
  }

  getPaxInputFromDockingRow(row: ElementFinder) {
    const paxIndex = 8;
    return this.addGetValue(this.getEltInDockingRow(row, paxIndex).all(by.tagName('input')).first());
  }
  getPaxOutputFromDockingRow(row: ElementFinder) {
    const paxIndex = 8;
    return this.addGetValue(this.getEltInDockingRow(row, paxIndex).all(by.tagName('input')).last());
  }
  getCargoInputFromDockingRow(row: ElementFinder) {
    const cargoIndex = 9;
    return this.addGetValue(this.getEltInDockingRow(row, cargoIndex).all(by.tagName('input')).first());
  }
  getCargoOutputFromDockingRow(row: ElementFinder) {
    const cargoIndex = 9;
    return this.addGetValue(this.getEltInDockingRow(row, cargoIndex).all(by.tagName('input')).last());
  }
  getCommentButtonFromDockingRow(row: ElementFinder) {
    return row.element(by.name('dockingComment'));
  }
  getVideoRequestButtonFromDockingRow(row: ElementFinder) {
    return row.element(by.name('videoRequest'));
  }
  getSaveButtonFromDockingRow(row: ElementFinder) {
    return row.element(by.buttonText('Save'));
  }
  getOtherCommentInputFromDockingRow(row: ElementFinder) {
    return row.element(by.name('otherComment'));
  }

  selectDropdownbyNum(element: ElementFinder, optionNum: number): void {
    dropdownHandler.setValueByIndex(element, optionNum);
  }
  getDropdownValue(dropdown: ElementFinder) {
    return dropdownHandler.getValue(dropdown);
  }


  getSlipGraphs() {
    return element.all(by.xpath('//app-ctvslipgraph/div'));
  }
  getSlipGraph(index: number) {
    return this.getSlipGraphs().get(index);
  }
  getTitleFromSlipGraph(graph: ElementFinder) {
    return graph.element(by.tagName('h3'));
  }
  getCanvasFromSlipGraph(graph: ElementFinder) {
    return graph.element(by.tagName('canvas'));
  }

  private addGetValue(btn: ElementFinder) {
    // We add getValue as function to the returned promise
    btn.getValue = () => btn.getAttribute('value');
    return btn;
  }
}
