import { ElementFinder, by, promise } from 'protractor';

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
