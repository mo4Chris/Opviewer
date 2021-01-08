import { CtvLtmPage, LtmDatePicker } from './ctvltm.po';


describe('Ctv longterm module', () => {
  let page: CtvLtmPage;
  beforeEach(() => {
    page = new CtvLtmPage();
    page.navigateTo();
  });
  afterEach(() => {
    page.validateNoConsoleLogs();
  });

  describe('LTM for vessel masters', () => {
    it('should not redirect', () => {
      expect(page.getUrl()).toMatch('/reports/longterm')
    })
  })
});
