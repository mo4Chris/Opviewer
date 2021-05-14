import { browser } from 'protractor';
import { CtvLtmPage, LtmDatePicker } from './ctvltm.po';


fdescribe('Ctv longterm module', () => {
  let page: CtvLtmPage;
  beforeEach(async () => {
    page = new CtvLtmPage();
    await page.navigateTo();
    await browser.waitForAngular();
  });

  describe('LTM for vessel masters', () => {
    it('should redirect to dashboard', async () => {
      const new_url = await page.getUrl();
      expect(new_url).not.toMatch('/reports/longterm');
    });
  });
});
