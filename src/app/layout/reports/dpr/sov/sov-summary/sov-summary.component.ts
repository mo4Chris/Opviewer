import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { SovType } from '../models/SovType';
import * as Chart from 'chart.js';

@Component({
  selector: 'app-sov-summary',
  templateUrl: './sov-summary.component.html',
  styleUrls: ['./sov-summary.component.scss',
    '../sovreport.component.scss']
})
export class SovSummaryComponent implements OnChanges {
  @Input() sovModel;
  @Input() backgroundColors: any[];
  @Input() fieldName: string;


  SovTypeEnum = SovType;

  // Ops chart
  operationsChart;
  operationalChartCalculated = false;

  // Gangway chart
  gangwayLimitationsChart;
  sovHasLimiters = false;

  constructor() { }

  ngOnChanges() {
    this.createOperationalStatsChart();
    this.createGangwayLimitationsChart();
  }

    createOperationalStatsChart() {
        const timeBreakdown = this.sovModel.sovInfo.timeBreakdown;
        if (timeBreakdown !== undefined) {
            const sailingDuration = timeBreakdown.hoursSailing !== undefined ? timeBreakdown.hoursSailing.toFixed(1) : 0;
            const waitingDuration = timeBreakdown.hoursWaiting !== undefined ? timeBreakdown.hoursWaiting.toFixed(1) : 0;
            const CTVopsDuration = timeBreakdown.hoursOfCTVops !== undefined ? timeBreakdown.hoursOfCTVops.toFixed(1) : 0;
            const platformDuration = timeBreakdown.hoursAtPlatform !== undefined ? timeBreakdown.hoursAtPlatform.toFixed(1) : 0;
            const turbineDuration = timeBreakdown.hoursAtTurbine !== undefined ? timeBreakdown.hoursAtTurbine.toFixed(1) : 0;
            const exclusionZone = platformDuration + turbineDuration;
            if (sailingDuration > 0 || waitingDuration > 0) {
                this.operationalChartCalculated = true;
                setTimeout(() => {
                    this.operationsChart = new Chart('operationalStats', {
                        type: 'pie',
                        data: {
                            datasets: [
                                {
                                    data: [sailingDuration, waitingDuration, exclusionZone, CTVopsDuration],
                                    backgroundColor: this.backgroundColors,
                                    radius: 8,
                                    pointHoverRadius: 10,
                                    borderWidth: 1
                                }
                            ],
                            labels: ['Sailing', 'Waiting', 'Exclusion zone', 'CTV operations duration']
                        },
                        options: {
                            title: {
                                display: true,
                                position: 'top',
                                text: 'Operational activity',
                                fontSize: 25
                            },
                            responsive: true,
                            radius: 6,
                            pointHoverRadius: 6
                        }
                    });
                });
            }
        }
    }

    createGangwayLimitationsChart() {
        const getCounter = (limiter: string) => {
            return this.sovModel.turbineTransfers.filter((transfer) => transfer.gangwayUtilisationLimiter === limiter).length +
                this.sovModel.platformTransfers.filter((transfer) => transfer.gangwayUtilisationLimiter === limiter).length;
        };
        const counter = {
            stroke: getCounter('stroke'),
            boomAngle: getCounter('boom angle'),
            telescope: getCounter('telescope')
        };
        console.log(counter);
        if (Object.keys(counter).some((key) => counter[key] > 0)) {
            this.sovHasLimiters = true;
            console.log('Limiters found');
            setTimeout(() => {
                this.gangwayLimitationsChart = new Chart('gangwayLimitations', {
                    type: 'pie',
                    data: {
                        datasets: [
                            {
                                data: [counter.stroke, counter.boomAngle, counter.telescope],
                                backgroundColor: this.backgroundColors,
                                radius: 8,
                                pointHoverRadius: 10,
                                borderWidth: 1
                            }
                        ],
                        labels: ['Stroke limited', 'Boom angle limited', 'Telescopic angle limited']
                    },
                    options: {
                        title: {
                            display: true,
                            position: 'top',
                            text: 'Gangway Limitations',
                            fontSize: 25
                        },
                        responsive: true,
                        radius: 6,
                        pointHoverRadius: 6
                    }
                });
            }, 500);
        }
    }

}
