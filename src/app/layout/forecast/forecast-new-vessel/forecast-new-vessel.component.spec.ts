import { CommonModule } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { SupportModelModule } from '@app/models/support-model.module';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MockComponents } from 'ng-mocks';
import { NgxUploaderDirectiveModule } from 'ngx-uploader-directive';
import { FileUploadComponent } from '../models/file-upload/file-upload.component';
import { ForecastNewVesselComponent } from './forecast-new-vessel.component';

fdescribe('ForecastNewVesselComponent', () => {
  let component: ForecastNewVesselComponent;
  let fixture: ComponentFixture<ForecastNewVesselComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        NgbModule,
        FormsModule,
        NgxUploaderDirectiveModule,
        RouterTestingModule,
      ],
      declarations: [ 
        ForecastNewVesselComponent,
        FileUploadComponent,
      ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForecastNewVesselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
