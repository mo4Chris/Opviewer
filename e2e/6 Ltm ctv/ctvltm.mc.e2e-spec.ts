import { CtvLtmPage, LtmDatePicker } from './ctvltm.po';


describe('Ctv longterm module', () => {
  let page: CtvLtmPage;
  beforeEach(() => {
    page = new CtvLtmPage();
    return page.navigateTo();
  });

  describe('LTM for marine controllers', () => {
    xit('should not redirect', async () => { // Currently LTM is disabled for MC
      expect(await page.getUrl()).toMatch('/reports/longterm');
      await page.validateNoConsoleErrors();
    });
  });
});
