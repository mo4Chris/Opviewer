import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonService } from '../../../common.service';


import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { NgbDate, NgbCalendar, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../../../shared/services/user.service';
import * as Chart from 'chart.js';
import * as ChartAnnotation from 'chartjs-plugin-annotation';
import { DatetimeService } from '../../../supportModules/datetime.service';
import { CalculationService } from '../../../supportModules/calculation.service';
import { ScatterplotComponent } from '../models/scatterplot/scatterplot.component'

@Component({
selector: 'app-longtermSOV',
templateUrl: './longtermSOV.component.html',
styleUrls: ['./longtermSOV.component.scss']
})

export class LongtermSOVComponent {
    constructor(
        private newService: CommonService,
        private route: ActivatedRoute,
        private modalService: NgbModal,
        private userService: UserService,
        private calculationService: CalculationService,
        private dateTimeService: DatetimeService,
        private scatterPlot: ScatterplotComponent,
        ) {
    }

    @Input() vesselObject;
    @Input() tokenInfo;
    //   @Input() hoveredDate: NgbDate;
    @Input() fromDate: NgbDate;
    @Input() toDate: NgbDate;
    //   @Input() modalReference: NgbModalRef;
    @Output() showContent: EventEmitter<boolean> = new EventEmitter<boolean>();
}