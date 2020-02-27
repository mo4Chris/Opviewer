import { Component, OnInit, Input, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { SovType } from '../models/SovType';
import * as Chart from 'chart.js';
import { SummaryModel } from '../models/Summary';
import { SovModel } from '../models/SovModel';
import { CalculationService } from '@app/supportModules/calculation.service';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { SettingsService } from '@app/supportModules/settings.service';

@Component({
  selector: 'app-sov-summary',
  templateUrl: './sov-summary.component.html',
  styleUrls: ['./sov-summary.component.scss',
    '../sovreport.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SovSummaryComponent implements OnChanges {
  @Input() sovModel: SovModel;
  @Input() backgroundColors: any[];
  @Input() fieldName: string;

  // Summary
  summary: SummaryModel;
  hasSummaryData = true;

  // Some dependency
  SovTypeEnum = SovType;

  // Ops chart
  operationsChart: Chart;
  operationalChartCalculated = false;

  // Gangway chart
  gangwayLimitationsChart: Chart;
  sovHasLimiters = false;

  summaryInfo = {
    departureFromHarbour: 'N/a',
    arrivalAtHarbour: 'N/a',
    distance: 'N/a',
  };

  constructor(
    private calculationService: CalculationService,
    private datetimeService: DatetimeService,
    private settings: SettingsService
  ) { }

  ngOnChanges() {
    this.hasSummaryData = this.sovModel.sovInfo.mmsi > 0;
    this.CalculateDailySummary();
    this.summary = this.calculationService.ReplaceEmptyColumnValues(this.summary);
    this.createOperationalStatsChart();
    this.createGangwayLimitationsChart();
  }


  CalculateDailySummary() {
    let _summary = new SummaryModel();

    // Average time vessel docking
    let totalVesselDockingDuration = 0;
    let nmrVesselTransfers = 0;
    this.sovModel.vessel2vessels.forEach(vessel2vessel => {
      let totalDockingDurationOfVessel2vessel = 0;
      vessel2vessel.transfers.forEach(transfer => {
        if (transfer) {
          if (typeof (transfer.duration) !== 'string') {
              totalDockingDurationOfVessel2vessel = totalDockingDurationOfVessel2vessel + transfer.duration;
              nmrVesselTransfers += 1;
          }
        }
      });
      const averageDockingDurationOfVessel2vessel = totalDockingDurationOfVessel2vessel / nmrVesselTransfers;
      totalVesselDockingDuration = totalVesselDockingDuration + averageDockingDurationOfVessel2vessel;
    });
    _summary.NrOfVesselTransfers = nmrVesselTransfers;
    _summary.AvgTimeVesselDocking = this.datetimeService.MatlabDurationToMinutes(totalVesselDockingDuration / this.sovModel.vessel2vessels.length);

    _summary.NrOfDaughterCraftLaunches = 0;
    _summary.NrOfHelicopterVisits = 0;

    if (this.sovModel.sovType === SovType.Platform && this.sovModel.platformTransfers.length > 0) {
        const transfers = this.sovModel.platformTransfers;
        const avgTimeInWaitingZone = this.calculationService.getNanMean(transfers.map(x => x.timeInWaitingZone));
        _summary.AvgTimeInWaitingZone = this.datetimeService.MatlabDurationToMinutes(avgTimeInWaitingZone);
        const avgTimeInExclusionZone = this.calculationService.getNanMean(transfers.map(x => x.visitDuration));
        _summary.AvgTimeInExclusionZone = this.datetimeService.MatlabDurationToMinutes(avgTimeInExclusionZone);
        const avgTimeDocking = this.calculationService.getNanMean(transfers.map(x => parseFloat(<any> x.totalDuration)));
        _summary.AvgTimeDocking = this.datetimeService.MatlabDurationToMinutes(avgTimeDocking);
        const avgTimeTravelingToPlatforms = this.calculationService.getNanMean(transfers.map(x => x.approachTime));
        _summary.AvgTimeTravelingToPlatforms = this.datetimeService.MatlabDurationToMinutes(avgTimeTravelingToPlatforms);
        _summary = this.GetDailySummary(_summary, transfers);
    } else if (this.sovModel.turbineTransfers.length > 0 && this.sovModel.sovType === SovType.Turbine) {
        const turbineTransfers = this.sovModel.turbineTransfers;
        const avgTimeDocking = this.calculationService.getNanMean(turbineTransfers.map(x => +x.duration));
        _summary.AvgTimeDocking = this.datetimeService.MatlabDurationToMinutes(avgTimeDocking);
        _summary = this.GetDailySummary(_summary, turbineTransfers);
    } else {
      _summary = this.GetDailySummary(_summary, []);
    }
    this.summary = _summary;
}

// ToDo: Common used by platform and turbine
  private GetDailySummary(model: SummaryModel, transfers: any[]) {
    const maxHs = this.calculationService.getNanMax(transfers.map(_t => parseFloat(<any> _t.Hs)));
    model.maxSignificantWaveHeightdDuringOperations = this.calculationService.GetDecimalValueForNumber(maxHs, ' m');
    const maxWindspeed = this.calculationService.getNanMax(transfers.map(_t => parseFloat(<any> _t.peakWindGust)));
    model.maxWindSpeedDuringOperations = this.switchUnit(maxWindspeed, 'km/h', this.settings.unit_speed);

    const info = this.sovModel.sovInfo;
    model.TotalSailDistance = this.switchUnit(info.distancekm, 'km', this.settings.unit_distance);
    model.departureFromHarbour = this.datetimeService.MatlabDateToJSTime(<any> info.departureFromHarbour);
    model.arrivalAtHarbour = this.datetimeService.MatlabDateToJSTime(<any> info.arrivalAtHarbour);
    return model;
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
                            pointHoverRadius: 6,
                            animation: {
                              duration: 300,
                            },
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
        if (Object.keys(counter).some((key) => counter[key] > 0)) {
            this.sovHasLimiters = true;
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
                        pointHoverRadius: 6,
                        animation: {
                          duration: 300,
                        },
                    }
                });
            }, 500);
        }
    }


    private switchUnit(value: number | string, oldUnit: string, newUnit: string) {
      return this.calculationService.switchUnitAndMakeString(value, oldUnit, newUnit);
  }

}
