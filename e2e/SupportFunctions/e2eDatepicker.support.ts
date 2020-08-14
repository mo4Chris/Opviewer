import { ElementFinder, by, browser } from "protractor";

export class E2eDatePicker {
    y: ElementFinder;
    m: ElementFinder;

    constructor(
        public picker: ElementFinder
    ) {
        this.y = this.picker.element(by.xpath('//select[@title="Select year"]'));
        this.m = this.picker.element(by.xpath('//select[@title="Select month"]'));
    }

    getYear() {
        return log(getValue(this.y));
    }
    setYear(year: number) {
        this.y.click();
        let btn = this.y.element(by.xpath('//option[@value=' + year + ']'));
        btn.click();
    }
    getMonth() {
        return log(getValue(this.m));
    }
    setMonth(month: number) {
        this.m.click();
        let btn = this.m.element(by.xpath('//option[@value=' + month + ']'));
        btn.click();
    }
    getDay() {

    }
    setDay(day: number) {
        // Warning: this will cause the datepicker to close and start navigation
        this.getDayCell(day).click();
        browser.waitForAngular();
    }

    getDayCell(day: number) {
        return this.picker.element(by.xpath('//div[@role="gridcell"]/div[contains(text(),"' + day + '")]'))
    }

    getDate() {
        return {
            year: this.getYear(),
            month: this.getMonth(),
            day: this.getDay(),
        }
    }
    setDate(date: {year: number, month: number, day: number}) {
        // Warning: this will cause the datepicker to close and start navigation
        this.setYear(date.year);
        this.setMonth(date.month);
        this.setDay(date.day);
    }
}

let log = (elt) => {
    elt.then(t => {
        console.log('Logged entry:')
        console.log(t)
    });
    return elt;
}

let getValue = (elt: ElementFinder) => {
    return elt.getAttribute('value');
}