import { ElementFinder, by, browser, element } from 'protractor';

export class E2eDatePicker {
    y: ElementFinder;
    m: ElementFinder;

    constructor(
        public picker: ElementFinder
    ) {
        this.y = this.picker.element(by.xpath('//select[@title="Select year"]'));
        this.m = this.picker.element(by.xpath('//select[@title="Select month"]'));
    }

    static open() {
        // Finds the datepicker button on the website, opens the picker, and returns instance of E2eDatePicker
        const pickerBtn = element(by.id('datePickBtn'));
        pickerBtn.click();
        const picker = element(by.tagName('ngb-datepicker'));
        return new E2eDatePicker(picker);
    }
    getYear() {
        return getValue(this.y);
    }
    setYear(year: number) {
        this.y.click();
        const btn = this.y.element(by.xpath('./option[@value=' + year + ']'));
        btn.click();
    }
    getMonth() {
        return getValue(this.m);
    }
    setMonth(month: number) {
        this.m.click();
        const btn = this.m.element(by.xpath('./option[@value=' + month + ']'));
        btn.click();
    }
    getDay() {
        const btn = this.picker.element(by.className('ngb-dp-day ng-star-inserted'));
        // return getValue(btn);
        return btn.getText();
    }
    setDay(day: number) {
        // Warning: this will cause the datepicker to close and start navigation
        this.getDayCell(day).click();
        browser.waitForAngular();
    }

    getDayCell(day: number) {
        return this.picker.element(by.xpath('.//div[@role="gridcell"]/div[text()=" ' + day + ' "]'));
    }

    getDate() {
        return {
            year: this.getYear(),
            month: this.getMonth(),
            day: this.getDay(),
        };
    }
    setDate(date: {year: number, month: number, day: number}) {
        // Warning: this will cause the datepicker to close and start navigation
        this.setYear(date.year);
        this.setMonth(date.month);
        this.setDay(date.day); // Triggers navigation
    }
}

const log = (elt) => {
    elt.then(t => {
        console.log('Logged entry:');
        console.log(t);
    });
    return elt;
};

const getValue = (elt: ElementFinder) => {
    return elt.getAttribute('value');
};
