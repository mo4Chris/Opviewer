import { by } from 'protractor';
import { E2eSelectHandler } from '../SupportFunctions/e2eDropdown.support';
import { SignupPage } from './signup.po';

describe('Admin - signup page', () => {
  let page: SignupPage;
  const selectHelper = new E2eSelectHandler();

  const testUser = {
    mail: 'test@test.nl',
    pass: 'password123'
  }

  beforeEach(() => {
    page = new SignupPage();
    return page.navigateTo();
  });

  it('should return to dashboard when canceling', async () => {
    const cancelBtn = page.getCancelButton();
    await cancelBtn.click();
    expect(await page.getUrl()).toMatch('dashboard')
  })
  it('should register a new user via the signup page', async () => {
    const username = page.getEmailInput();
    await username.sendKeys('test@test.nl')
    const usertype_select = page.getUserSelect();
    const opts = usertype_select.all(by.css('option'));
    await opts.get(2).click();
    // const usertype = await usertype_select.getText();
    const usertype = await selectHelper.getValue(usertype_select)
    expect(usertype).toMatch('Marine Controller')

    const client_select = page.getClientSelect();
    const c_opts = client_select.all(by.css('option'));
    await c_opts.first().click();
    // const selected_client = await client_select.getText();
    const selected_client = await selectHelper.getValue(client_select);
    expect(selected_client).toMatch('MO4')

    const confirmBtn = page.getConfirmButton();
    // confirmBtn.click();
    // expect(await page.getUrl()).toMatch('dashboard')

    await page.validateNoConsoleErrors();
  })


})





function removeTestUser() {

}
