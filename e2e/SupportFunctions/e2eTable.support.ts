import { by, element, ElementArrayFinder, ElementFinder, promise } from 'protractor';
import { protractor } from 'protractor/built/ptor';


export class E2eTableHandler {
  getRowElementByIndex(row: ElementFinder, index: number): ElementFinder {
    return row.all(by.tagName('td')).get(index);
  }

  async getElementInRowByTitle(table: ElementFinder, row: ElementFinder, key: string): Promise<ElementFinder> {
    const headers = table.all(by.xpath('thead/tr/th'));
    expect(await headers.count()).toBeGreaterThan(0, 'Table must have headers');

    const titles = await headers.getText()  as unknown as string[];
    const index = titles.findIndex(t => {
      const match = t.match(key);
      return match ? match.length > 0 : false;
    });

    if (index >= 0) return this.getRowElementByIndex(row, index);
    throw new Error('No cell found matching header "' + key + '"');
  }

  getRowCount(table: ElementFinder) {
    return table.all(by.css('tr')).count();
  }
  getHeaderCount(table: ElementFinder) {
    return table.all(by.css('th')).count();
  }
}

function log(elt: ElementFinder | ElementArrayFinder) {
  console.log('Registered async log event');
  elt.getText().then(t => {
    if (Array.isArray(t)) {
      console.log('Logging array:');
      console.log(t);
    } else {
      console.log('Logging item');
      console.log(t);
    }
  });
}
