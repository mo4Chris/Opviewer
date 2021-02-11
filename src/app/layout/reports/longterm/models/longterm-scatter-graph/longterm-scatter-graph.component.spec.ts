import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LongtermScatterGraphComponent } from './longterm-scatter-graph.component';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { Component } from '@angular/core';
import { ComprisonArrayElt, LongtermDataFilter } from '../scatterInterface';
import { LongtermComponent, LongtermVesselObjectModel } from '../../longterm.component';
import { HttpClientModule } from '@angular/common/http';

@Component({
  template: `
    <div width=400 height=400>
      <app-longterm-scatter-graph [data]="data" [fromDate]="fromDate" [toDate]="toDate" [vesselObject]="vesselObject"
        [vesselType]="vesselType" [filters]="filters" [vesselLabels]="vesselLabels">
      </app-longterm-scatter-graph>
    </div>`
})
class LongtermScatterGraphTestComponent {
  data: ComprisonArrayElt;
  fromDate: NgbDate;
  toDate: NgbDate;
  vesselObject: LongtermVesselObjectModel;
  vesselLabels: string[] = ['Placeholder A', 'Placeholder B', 'Placeholder C'];
  vesselType: 'CTV' | 'SOV' | 'OSV' = 'CTV';
  showHiddenAsOutlier = true;
  filters: LongtermDataFilter[] = [];
}

describe('LongtermScatterGraphComponent', () => {
  let testComponent: LongtermScatterGraphTestComponent;
  let component: LongtermScatterGraphComponent;
  let fixture: ComponentFixture<LongtermScatterGraphTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        LongtermScatterGraphComponent,
        LongtermScatterGraphTestComponent
      ],
      providers: [
        MockedCommonServiceProvider,
        MockedUserServiceProvider,
      ], imports: [
        HttpClientModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LongtermScatterGraphTestComponent);
    testComponent = fixture.componentInstance;
    testComponent.data  = {
      x: 'Hs',
      y: 'score',
      xLabel: 'Hs',
      yLabel: 'Score',
      graph: 'trend',
      info: 'Hello!',
      dataType: 'transfer',
    };
    testComponent.fromDate = new NgbDate(2020, 1, 1);
    testComponent.toDate =  new NgbDate(2020, 2, 1);
    testComponent.vesselType = 'CTV';
    testComponent.vesselObject = {
      mmsi: [123456789, 123456788],
      vesselName: ['Test CTV', 'Test CTV 2'],
      dateMin: 737791,
      dateMax: 737822,
      dateNormalMin: '2020-01-01',
      dateNormalMax: '2020-02-01',
    };
    fixture.detectChanges();
    component = fixture.nativeElement.querySelector('app-longterm-scatter-graph');
  });

  it('should create', () => {
    expect(testComponent).toBeTruthy();
    expect(component).toBeTruthy();
  });

  it('should support filters', () => {
    testComponent.filters.push({
      name: 'test callback',
      filter: (x, y, mmsi) => x < y
    });
    fixture.detectChanges();
    expect(testComponent).toBeTruthy();
    expect(component).toBeTruthy();
  });
});
