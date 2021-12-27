import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PortalSidebarComponent } from './portal-sidebar.component';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { PortalSidebarService } from './portal-sidebar.service';


describe('PortalSidebarComponent', () => {
  let component: PortalSidebarComponent;
  let fixture: ComponentFixture<PortalSidebarComponent>;
  let permissionServiceMock;
  let sidebar;

  beforeEach(async () => {
    permissionServiceMock = jasmine.createSpyObj('permissionService', ['getDecodedAccessToken']);

    await TestBed.configureTestingModule({
      declarations: [PortalSidebarComponent],
      providers: [
        { provide: PermissionService, useValue: permissionServiceMock },
        { provide: PortalSidebarService },
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PortalSidebarComponent);
    component = fixture.componentInstance;
    sidebar = fixture.debugElement.query(By.css('.portal-sidebar'));
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should be collapsed by default', () => {
    fixture.detectChanges();
    const classList = Object.keys(sidebar.classes);
    expect(
      classList.includes('portal-sidebar--hide')
    ).toBe(true);
  });

  describe('handleClickItem', () => {
    it('should collapse once an item has been clicked', () => {
      component.handleClickItem();
      fixture.detectChanges();

      const classList = Object.keys(sidebar.classes);
      expect(
        classList.includes('portal-sidebar--hide')
      ).toBe(true);
    });
  });

  describe('toggleExpanded', () => {
    it('should show the sidebar once toggle has been clicked', () => {
      component.toggleExpanded();
      fixture.detectChanges();

      const classList = Object.keys(sidebar.classes);
      expect(
        classList.includes('portal-sidebar--hide')
      ).toBe(false);
    });

    it('should toggle between closed and open sidebar', () => {
      component.toggleExpanded();
      fixture.detectChanges();
      component.toggleExpanded();
      fixture.detectChanges();

      const classList = Object.keys(sidebar.classes);
      expect(
        classList.includes('portal-sidebar--hide')
      ).toBe(true);
    });
  });
});
