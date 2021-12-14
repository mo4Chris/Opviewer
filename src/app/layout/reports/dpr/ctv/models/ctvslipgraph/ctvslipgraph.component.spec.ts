import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { CtvslipgraphComponent } from './ctvslipgraph.component';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';

describe('CtvslipgraphComponent', () => {
  let component: CtvslipgraphComponent;
  let fixture: ComponentFixture<CtvslipgraphComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CtvslipgraphComponent ],
      providers: [
        MockedUserServiceProvider,
        MockedCommonServiceProvider,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CtvslipgraphComponent);
    component = fixture.componentInstance;
    component.index = 0;
    component.transfer = {
      slipGraph: {
        slipX: [0, 0.2, 0.4],
        slipY: [1, 2, 1],
        transferPossible: [true, false, true],
        yLimits: [0, 2],
        slipLimit: 1.5
      },
      score: 7,
      location: 'The wharf'
    };
    component.vesselUtcOffset = 0;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
