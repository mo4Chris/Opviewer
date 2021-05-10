import { by, element, ElementArrayFinder, ElementFinder, promise } from 'protractor';
import { protractor } from 'protractor/built/ptor';


export class E2eTableHandler {
  getRowElementByIndex(row: ElementFinder, index: number): ElementFinder {
    return row.all(by.tagName('td')).get(index);
  }

  getElementInRowByTitle(table: ElementFinder, row: ElementFinder, key: string): promise.Promise<ElementFinder> {
    const headers = table.all(by.xpath('thead/tr/th'));
    expect(headers.count()).toBeGreaterThan(0, 'Table must have headers');

    const titles = headers.getText()  as unknown as promise.Promise<string[]>;

    const combined: promise.Deferred<ElementFinder> = protractor.promise.defer();
    titles.then(texts => {
      const index = texts.findIndex(t => {
        const match = t.match(key);
        return match ? match.length > 0 : false;
      });
      if (index >= 0) {
        combined.fulfill(this.getRowElementByIndex(row, index));
      } else {
        combined.reject('No cell found matching header "' + key + '"');
      }
    });
    return combined.promise;
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
