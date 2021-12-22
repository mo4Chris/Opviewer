import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { CommonService } from '@app/common.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Client } from '../client-overview.component';

import { LicenceTypeDialogComponent } from './licence-type-dialog.component';

describe('LicenceTypeDialogComponent', () => {
  let component: LicenceTypeDialogComponent;
  let fixture: ComponentFixture<LicenceTypeDialogComponent>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    const commonServiceMock = jasmine.createSpy('commonServiceMock')
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [LicenceTypeDialogComponent],
      providers: [
        { provide: NgbActiveModal, useValue: {} },
        { provide: CommonService, useValue: commonServiceMock }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LicenceTypeDialogComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
  });

  it('should create', () => {
    component.fromParent = {} as Client;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should set initial form value to NO_LICENCE', () => {
    component.fromParent = {
      client_id: 1,
      forecast_client_id: 6,
      name: 'lalala company',
      client_permissions: {
        licenceType: 'NO_LICENCE'
      }
    };
    fixture.detectChanges();
    const actual = component.radioGroupForm.value
    const expected = { model: 'NO_LICENCE' };
    expect(actual).toEqual(expected);
  });

  it('should set initial form value to LIGHT', () => {
    component.fromParent = {
      client_id: 1,
      forecast_client_id: 6,
      name: 'lalala company',
      client_permissions: {
        licenceType: 'LIGHT'
      }
    };
    fixture.detectChanges();
    const actual = component.radioGroupForm.value
    const expected = { model: 'LIGHT' };
    expect(actual).toEqual(expected);
  });
 
  it('should set initial form value to PRO', () => {
    component.fromParent = {
      client_id: 1,
      forecast_client_id: 6,
      name: 'lalala company',
      client_permissions: {
        licenceType: 'PRO'
      }
    };
    fixture.detectChanges();
    const actual = component.radioGroupForm.value
    const expected = { model: 'PRO' };
    expect(actual).toEqual(expected);
  });

  it('should set initial form value when licenceType is undefined to NO_LICENCE', () => {
    component.fromParent = {
      client_id: 1,
      forecast_client_id: 6,
      name: 'lalala company',
      client_permissions: {
        licenceType: undefined,
      }
    };
    fixture.detectChanges();
    const actual = component.radioGroupForm.value
    const expected = { model: 'NO_LICENCE' };
    expect(actual).toEqual(expected);
  });
  
  it('should change form value to PRO after clicking PRO option', fakeAsync(() => {
    component.fromParent = {
      client_id: 1,
      forecast_client_id: 6,
      name: 'lalala company',
      client_permissions: {
        licenceType: 'NO_LICENCE',
      }
    };
    fixture.detectChanges();

    const proInputField = debugElement.nativeElement.querySelector('input')
    proInputField.click();
    tick();

    const actual = component.radioGroupForm.value
    const expected = { model: 'PRO' };

    expect(actual).toEqual(expected);
  }));
});
