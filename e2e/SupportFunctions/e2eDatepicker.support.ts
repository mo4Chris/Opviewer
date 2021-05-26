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

    static async open() {
        // Finds the datepicker button on the website, opens the picker, and returns instance of E2eDatePicker
        const pickerBtn = element(by.id('datePickBtn'));
        await pickerBtn.click();
        const picker = element(by.tagName('ngb-datepicker'));
        return new E2eDatePicker(picker);
    }
    getYear() {
        return getValue(this.y);
    }
    async setYear(year: number) {
        await this.y.click();
        const btn = this.y.element(by.xpath('./option[@value=' + year + ']'));
        await btn.click();
    }
    getMonth() {
        return getValue(this.m);
    }
    async setMonth(month: number) {
        await this.m.click();
        const btn = this.m.element(by.xpath('./option[@value=' + month + ']'));
        await btn.click();
    }
    getDay() {
        const btn = this.picker.element(by.className('ngb-dp-day ng-star-inserted'));
        // return getValue(btn);
        return btn.getText();
    }
    async setDay(day: number) {
        // Warning: this will cause the datepicker to close and start navigation
        await this.getDayCell(day).click();
        await browser.waitForAngular();
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
    async setDate(date: {year: number, month: number, day: number}) {
        // Warning: this will cause the datepicker to close and start navigation
        await this.setYear(date.year);
        await this.setMonth(date.month);
        await this.setDay(date.day); // Triggers navigation
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
