import { by, element, ElementFinder, promise } from "protractor";
import { map } from "rxjs/operators";


export class E2eTableHandler {
  getRowElementByIndex(row: ElementFinder, index: number) {
    return row.all(by.tagName('td')).get(index);
  }

  getElementInRowByTitle(table: ElementFinder, row: ElementFinder, key: string): ElementFinder {
    const headers = table.all(by.xpath('thead/tr/th'));
    expect(headers.isPresent()).toBe(true, 'Table must have headers')
    let titles = headers.getText()  as unknown as promise.Promise<string[]>;
    let out: ElementFinder;
    headers.count().then(c => console.log('#headers = ' + c))
    console.log("HEADERS:")
    titles.then(texts => {
      console.log(texts)
      texts.forEach(t=> console.log(t))
      let index = texts.findIndex(t => t.match(key).length > 0);
      out = this.getRowElementByIndex(row, index);
    });
    return out;
  }
}
