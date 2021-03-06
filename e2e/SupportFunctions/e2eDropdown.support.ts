import { ElementFinder, by, promise, $$, browser } from 'protractor';
import { filter } from 'rxjs/operators';

// Support functions for e2e tests with ngbDropdown. Input for any
// functions below should be the dropdown container.
export class E2eDropdownHandler {
    getValue(elt: ElementFinder) {
        return this._getButton(elt).getText();
    }
    getNumOptions(elt: ElementFinder) {
        return this._getOptions(elt).count();
    }
    getOptions(elt: ElementFinder) { // Possibly broken!
        return this._getOptions(elt).getText() as unknown as promise.Promise<string[]>;
    }
    open(elt: ElementFinder) {
        return this._getButton(elt).click();
    }
    async setValue(elt: ElementFinder, s: string) {
        await this.open(elt);
        const opts = await this.getOptions(elt)

        const idx = opts.findIndex(_s => _s === s);
        if (idx >= 0) {
            await this._getOptions(elt).get(idx).click();
        } else {
            fail('Could not select dropdown option "' + s + '" - it does not exist');
        }

    }
    async setValueByIndex(elt: ElementFinder, idx: number) {
        await this.open(elt);
        await this._getOptions(elt).get(idx).click();
    }

    private _getButton(elt: ElementFinder) {
        return elt.element(by.className('dropdown-toggle'));
    }
    private _getOptions(elt: ElementFinder) {
        return elt.all(by.className('dropdown-item'));
    }
}

export class E2eSelectHandler {
    getValue(elt: ElementFinder) {
        return this._getButton(elt).getText();
    }
    getIndex(elt: ElementFinder) {
        return elt.getAttribute('value');
    }
    getNumOptions(elt: ElementFinder) {
        return this._getOptions(elt).count();
    }
    getOptions(elt: ElementFinder) { // Possibly broken!
        return this._getOptions(elt).getText() as unknown as promise.Promise<string[]>;
    }
    open(elt: ElementFinder) {
        // this._getButton(elt).click();
        return elt.click();
    }
    setValue(elt: ElementFinder, s: string) {
        this.open(elt);
        // this.getOptions(elt).then(opts => console.log(opts))
        this.getOptions(elt).then(_opts => {
            const idx = _opts.findIndex(_s => _s === s);
            if (idx >= 0) {
                this._getOptions(elt).get(idx).click();
            } else {
                fail('Could not select dropdown option "' + s + '" - it does not exist');
            }
        });
    }
    async setValueByIndex(elt: ElementFinder, idx: number) {
        await this.open(elt);
        await this._getOptions(elt).get(idx).click();
    }
    setNewOption(elt: ElementFinder) {
        this.open(elt);
        const opt = this.AsyncSetNewOption(elt);
        browser.wait(opt, 2000).catch(() => {
            console.error('Failed to select new option - reached 2s timeout');
        });
        return opt;
    }

    private _getButton(elt: ElementFinder) {
        return elt.$$('option').filter(function (_option) {
            return _option.isSelected();
        }).first();
    }
    private _getOptions(elt: ElementFinder) {
        return elt.all(by.tagName('option'));
    }
    private async AsyncSetNewOption(elt: ElementFinder) {
        const nonSelectedOptions: ElementFinder[] = await elt.$$('option')
            .filter(e => e.getAttribute('value').then(v => v !== 'undefined'));
            // .filter(o => o.isSelected().then(tf => !tf)); // This breaks the function...
        const len = nonSelectedOptions.length;
        const rnd = Math.floor( len * Math.random());
        // let newOpt = log(nonSelectedOptions.get(rnd));
        const newOpt = nonSelectedOptions[rnd];
        newOpt.click();
        return newOpt.getText();
    }
}

const log = (e: ElementFinder) => {
    e.getText().then(t => {
        console.log('Logger cb in e2eDropdown.support');
        console.log(t);
    });
    return e;
};
