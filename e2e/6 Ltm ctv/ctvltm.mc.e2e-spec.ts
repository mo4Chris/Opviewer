import { CtvLtmPage, LtmDatePicker } from './ctvltm.po';


describe('Ctv longterm module', () => {
  let page: CtvLtmPage;
  beforeEach(() => {
    page = new CtvLtmPage();
    page.navigateTo();
  });

  describe('LTM for marine controllers', () => {
    it('should not redirect', async () => {
      expect(page.getUrl()).toMatch('/reports/longterm');
      await page.validateNoConsoleErrors();
    });
  });
});
