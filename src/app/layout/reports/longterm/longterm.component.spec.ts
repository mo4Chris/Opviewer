import { LongtermComponent } from './longterm.component';
import { ComponentFixture, async, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { MockedCommonServiceProvider } from '@app/supportModules/mocked.common.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgbModule, NgbDatepickerModule, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { LongtermCTVComponent } from './ctv/longtermCTV.component';
import { MockComponents } from 'ng-mocks';
import { LongtermSOVComponent } from './sov/longtermSOV.component';
import { RouterTestingModule } from '@angular/router/testing';
import {ActivatedRoute} from '@angular/router';
import { MockedUserServiceProvider } from '@app/shared/services/test.user.service';
import { CtvslipgraphComponent } from '../dpr/ctv/models/ctvslipgraph/ctvslipgraph.component';
import { VesselinfoComponent } from './ctv/models/vesselinfo/vesselinfo.component';
import { DeploymentGraphComponent } from './ctv/models/deploymentgraph/deploymentGraph.component';
import { LongtermScatterGraphComponent } from './models/longterm-scatter-graph/longterm-scatter-graph.component';
import { LongtermBarGraphComponent } from './models/longterm-bar-graph/longterm-bar-graph.component';
import { LongtermPrintHeaderComponent } from './models/longterm-print-header/longterm-print-header.component';
import { LongtermPrintHeaderbarComponent } from './models/longterm-print-headerbar/longterm-print-headerbar.component';
import { LongtermTrendGraphComponent } from './models/longterm-trend-graph/longterm-trend-graph.component';
import { SiemensKpiOverviewComponent } from './sov/models/siemens-kpi-overview/siemens-kpi-overview.component';
import { UtilizationGraphComponent } from './sov/models/longterm_utilization/utilizationGraph.component';
import { mockedObservable } from '@app/models/testObservable';
import { EngineOverviewComponent } from './ctv/models/engine-overview/engine-overview.component';
import { CtvUtilizationGraphComponent } from './ctv/models/longterm_utilization/utilizationGraph.component';
import { CtvLongtermUtilSubGraphComponent } from './ctv/models/longterm_utilization/longterm-util-sub-graph/longterm-util-sub-graph.component';
import { HttpClientModule } from '@angular/common/http';

describe('LongtermComponent', () => {
    let component: LongtermComponent;
    let fixture: ComponentFixture<LongtermComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                CommonModule,
                NgbModule,
                FormsModule,
                NgbDatepickerModule,
                NgMultiSelectDropDownModule,
                RouterTestingModule,
                HttpClientModule,
            ],
            declarations: [
                LongtermComponent,
                LongtermCTVComponent,
                LongtermSOVComponent,
                LongtermPrintHeaderComponent,
                LongtermPrintHeaderbarComponent,
                MockComponents(
                    CtvslipgraphComponent,
                    VesselinfoComponent,
                    DeploymentGraphComponent,
                    LongtermScatterGraphComponent,
                    LongtermBarGraphComponent,
                    LongtermTrendGraphComponent,
                    SiemensKpiOverviewComponent,
                    UtilizationGraphComponent,
                    EngineOverviewComponent,
                    CtvUtilizationGraphComponent,
                    CtvLongtermUtilSubGraphComponent,
                ),
            ],
            providers: [
                MockedCommonServiceProvider,
                MockedUserServiceProvider,
                {
                    provide: ActivatedRoute,
                    useValue: {
                      params: mockedObservable({mmsi: 123456789, vesselName: 'Test vessel'}),
                    },
                }
            ],
        });

        fixture = TestBed.createComponent(LongtermComponent);
        component = fixture.componentInstance;
        component.vesselObject = {
            dateMax: 737740,
            dateMin: 737700,
            dateNormalMin: 'Min date',
            dateNormalMax: 'Max date',
            mmsi: [123456789],
            vesselName: ['Test vessel']
        };
        component.multiSelectSettings = {
            idField: 'mmsi',
            textField: 'nicename',
            allowSearchFilter: true,
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            singleSelection: false,
        }
        component.fieldSelectSettings = {
            allowSearchFilter: true,
            singleSelection: true,
            closeDropDownOnSelection: true,
            textFields: 'text',
            idField: '_id',
          };
        component.fromDate = new NgbDate(2020, 6, 1);
        component.toDate = new NgbDate(2020, 7, 10);
        component.dropdownValues = [{
            mmsi: component.vesselObject.mmsi[0],
            nicename: component.vesselObject.vesselName[0],
        }];

        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
        component.buildPageWithCurrentInformation();
        expect(component).toBeTruthy();
    });

    it('Should update on changed date', () => {
        const childChangeDetector = spyOn(LongtermCTVComponent.prototype, 'ngOnChanges').and.callThrough();

        component.searchTransfersByNewSpecificDate();
        fixture.detectChanges();
        expect(component.fromDate).toEqual(new NgbDate(2020, 6, 1));
        expect(component.toDate).toEqual(new NgbDate(2020, 7, 10));

        component.switchMonthBackwards();
        fixture.detectChanges();
        expect(component.fromDate).toEqual(new NgbDate(2020, 5, 1));
        expect(component.toDate).toEqual(new NgbDate(2020, 6, 1));

        component.switchMonthForward();
        fixture.detectChanges();
        expect(component.fromDate).toEqual(new NgbDate(2020, 6, 1));
        expect(component.toDate).toEqual(new NgbDate(2020, 7, 1));

        expect(childChangeDetector).toHaveBeenCalledTimes(3);
    });

    it('Should update on changed names', () => {
        const childChangeDetector = spyOn(LongtermCTVComponent.prototype, 'ngOnChanges').and.callThrough();

        component.dropdownValues = [{mmsi: 111111111, nicename: 'New test CTV'}];
        component.onSelectVessel();
        fixture.detectChanges();
        expect(component).toBeTruthy();

        expect(childChangeDetector).toHaveBeenCalledTimes(1);
    });

});
