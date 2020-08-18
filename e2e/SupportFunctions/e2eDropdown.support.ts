import { ElementFinder, by, promise, $$, browser } from "protractor";
import { filter } from "rxjs/operators";

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
        this._getButton(elt).click();
    }
    setValue(elt: ElementFinder, s: string) {
        this.open(elt);
        this.getOptions(elt).then(_opts => {
            let idx = _opts.findIndex(_s => _s == s);
            if (idx >= 0) {
                this._getOptions(elt).get(idx).click();
            } else {
                fail('Could not select dropdown option "' + s + '" - it does not exist')
            }
        })

    }
    setValueByIndex(elt: ElementFinder, idx: number) {
        this.open(elt);
        this._getOptions(elt).get(idx).click();
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
        elt.click();
    }
    setValue(elt: ElementFinder, s: string) {
        this.open(elt);
        // this.getOptions(elt).then(opts => console.log(opts))
        this.getOptions(elt).then(_opts => {
            let idx = _opts.findIndex(_s => _s == s);
            if (idx >= 0) {
                this._getOptions(elt).get(idx).click();
            } else {
                fail('Could not select dropdown option "' + s + '" - it does not exist')
            }
        })
    }
    setValueByIndex(elt: ElementFinder, idx: number) {
        this.open(elt);
        this._getOptions(elt).get(idx).click();
    }
    setNewOption(elt: ElementFinder) {
        let opt = this.AsyncSetNewOption(elt);
        browser.wait(opt, 2000).catch(() => {
            console.error('Failed to select new option - reached 2s timeout')
        });
        return opt;
    }

    private _getButton(elt: ElementFinder) {
        return elt.$$("option").filter(function (_option) {
            return _option.isSelected();
        }).first();
    }
    private _getOptions(elt: ElementFinder) {
        return elt.all(by.tagName('option'));
    }
    private async AsyncSetNewOption(elt: ElementFinder) {
        this.open(elt);
        let nonSelectedOptions = elt.$$("option")
            .filter(e => e.getAttribute('value').then(v => v !== 'undefined'))
            // .filter(o => o.isSelected().then(tf => !tf)); // This breaks the function...
        return await nonSelectedOptions.count().then(async c => {
            let rnd = Math.floor( c * Math.random());
            // let newOpt = log(nonSelectedOptions.get(rnd));
            let newOpt = nonSelectedOptions.get(rnd);
            await newOpt.click();
            return newOpt.getText();
        })
    }
}

let log = (e: ElementFinder) => {
    e.getText().then(t => {
        console.log('Logger cb in e2eDropdown.support')
        console.log(t)
    })
    return e;
}