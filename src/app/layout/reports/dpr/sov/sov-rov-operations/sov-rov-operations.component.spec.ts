import { SovRovOperationsComponent } from './sov-rov-operations.component';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { SharedPipesModule } from '@app/shared';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { MockedUserServiceProvider, UserTestService } from '@app/shared/services/test.user.service';
import { HttpClientModule } from '@angular/common/http';




describe('Sov Rov transfer component', () => {
    let component: SovRovOperationsComponent;
    let fixture: ComponentFixture<SovRovOperationsComponent>;


    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [
          NgbModule,
          CommonModule,
          FormsModule,
          NgMultiSelectDropDownModule,
          SharedPipesModule,
          HttpClientModule,
        ],
        declarations: [ SovRovOperationsComponent ],
        providers: [
          MockedCommonServiceProvider,
          MockedUserServiceProvider,
        ]
      })
      .compileComponents();

      fixture = TestBed.createComponent(SovRovOperationsComponent);
      component = fixture.componentInstance;
      component.rovOperations = [];
      component.vesselObject = {
        date: 737700,
        mmsi: 987654321,
        vesselType: 'OSV',
        vesselName: 'TEST SOV'
      };
      fixture.detectChanges();
    }));


  it('Should instantiate', () => {
    expect(component).toBeTruthy();
  });
});
