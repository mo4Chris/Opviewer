import { AppPage } from './app.po';

describe('Admin login page', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('BMO Dataviewer');
  });

  it('should login to website', () => {
    page.setPasswordText();
    page.setUsernameText();
    page.clickLoginButton();
  });

  it('Should display dashboard', () => {
    page.pageRedirectsDashboard();
  });

  it('Should display dasboard data', () => {
    expect(page.checkDashboardHeader()).toContain('Dashboard');
    expect(page.checkDashboardMapExists()).toBe(true);
  }); 

});
