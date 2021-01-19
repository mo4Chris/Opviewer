import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { CtvUtilizationGraphComponent } from '../utilizationGraph.component';
import { CtvLongtermUtilSubGraphComponent } from './longterm-util-sub-graph.component';

describe('CtvLongtermUtilSubGraphComponent', () => {
  let component: CtvLongtermUtilSubGraphComponent;
  let fixture: ComponentFixture<CtvLongtermUtilSubGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [
        CtvLongtermUtilSubGraphComponent,
        CtvUtilizationGraphComponent,
      ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
      ],
    })
    .compileComponents();
  }));

  
  beforeEach(() => {
    fixture = TestBed.createComponent(CtvLongtermUtilSubGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  

  it('should create first vessel', () => {

    component.dateMin = 738126;
    component.dateMax = 738169;
    component.dset = {
      labels : [
        'Tue Dec 01 2020 01:00:00 GMT+0100 (Central European Standard Time)',
        'Wed Dec 02 2020 01:00:00 GMT+0100 (Central European Standard Time)'
      ],
      isFirst: true,
      datasets :[{
        stack: ''
      }]
    };
    expect(component).toBeTruthy();
  });

  it('should create not-first vessel', () => {

    component.dateMin = 738126;
    component.dateMax = 738169;
    component.dset = {
      labels : [
        'Tue Dec 01 2020 01:00:00 GMT+0100 (Central European Standard Time)',
        'Wed Dec 02 2020 01:00:00 GMT+0100 (Central European Standard Time)'
      ],
      isFirst: false,
      datasets :[{
        stack: ''
      }]
    };
    expect(component).toBeTruthy();
  });

  it('should create without data', () => {
    expect(component.hasData).toBe(false);
    expect(component).toBeTruthy();
  });

});
