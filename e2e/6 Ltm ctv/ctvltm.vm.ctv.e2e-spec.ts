import { CtvLtmPage, LtmDatePicker } from './ctvltm.po';


describe('Ctv longterm module', () => {
  let page: CtvLtmPage;
  beforeEach(async () => {
    page = new CtvLtmPage();
    await page.navigateTo();
  });

  describe('LTM for vessel masters', () => {
    it('should redirect to dashboard', () => {
      const new_url = page.getUrl();
      return expect(new_url).not.toMatch('/reports/longterm');
    });
  });
});
