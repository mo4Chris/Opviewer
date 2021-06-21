import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MockedCommonService, MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { mockedObservable } from '@app/models/testObservable';

fdescribe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        NgbModule,
        RouterTestingModule,
        TranslateModule.forRoot()
      ],
      declarations: [
        HeaderComponent
      ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    component.permission.demo = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly open modal and request full account', async () => {
    const saveSpy = spyOn(MockedCommonService.prototype, 'requestFullAccount')
    .and.returnValue(mockedObservable({ data: 'Full account has been requested', status: 200 }));
    
    const modalLink = locate('#requestFullAccountModal') as HTMLAnchorElement;
    expect(modalLink).toBeTruthy();
    await modalLink.click();

    fixture.detectChanges();
    await fixture.whenStable();
    
    let modalButtonConfirm = await document.querySelector('#requestFullAccountButton') as HTMLButtonElement;
    expect(modalButtonConfirm).toBeTruthy();

    modalButtonConfirm.click();
    expect(saveSpy).toHaveBeenCalled();

    fixture.detectChanges();
    await fixture.whenStable();
    
    modalButtonConfirm = await document.querySelector('#requestFullAccountButton') as HTMLButtonElement;
    expect(modalButtonConfirm).toBeFalsy();
  })
  
  it('should not display request full account button', async () => {
    component.permission.demo = false;
    fixture.detectChanges(); 

    const modalLink = locate('#requestFullAccountModal') as HTMLAnchorElement;
    expect(modalLink).toBeFalsy();
  })

  function locate(locator: string) {
    const nativeElt = <HTMLElement> fixture.nativeElement;
    return nativeElt.querySelector(locator);
  }
});
