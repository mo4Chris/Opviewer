import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { PortalSidebarItemComponent } from './portal-sidebar-item.component';


describe('PortalSidebarItemComponent', () => {
  let component: PortalSidebarItemComponent;
  let fixture: ComponentFixture<PortalSidebarItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PortalSidebarItemComponent],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader
          }
        })
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PortalSidebarItemComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
