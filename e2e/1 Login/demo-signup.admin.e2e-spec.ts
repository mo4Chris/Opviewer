import { by } from 'protractor';
import { E2eSelectHandler } from '../SupportFunctions/e2eDropdown.support';
import { DemoSignupPage } from './demo-signup.po';

describe('Demo signup page', () => {
  let page: DemoSignupPage;
  const selectHelper = new E2eSelectHandler();

  const testUser = {
    mail: 'test@test.nl',
    pass: 'password123',
    fullName: 'Tester',
    company: 'McTestable',
    title: 'tester',
    phone: '06123456789'
  }

  beforeEach(() => {
    page = new DemoSignupPage();
    return page.navigateTo();
  });

  it('should return to dashboard when canceling', async () => {
    const cancelBtn = page.getCancelButton();
    await cancelBtn.click();
    expect(await page.getUrl()).toMatch('login')
  })
  it('should register a demo account', async () => {
    await page.getEmailInput().sendKeys(testUser.mail);
    await page.getPasswordInput().sendKeys(testUser.pass);
    await page.getConfirmPasswordInput().sendKeys(testUser.pass);
    await page.getFullNameInput().sendKeys(testUser.fullName);
    await page.getCompanyInput().sendKeys(testUser.company);
    await page.getJobTitleInput().sendKeys(testUser.title);
    await page.getPhoneNumberInput().sendKeys(testUser.phone);
    await page.getPolicyConcent().click();
    // await page.getConfirmButton().click();
    // expect(await page.getUrl()).toMatch('login');
    await page.validateNoConsoleErrors();
  })

})





function removeTestUser() {

}
