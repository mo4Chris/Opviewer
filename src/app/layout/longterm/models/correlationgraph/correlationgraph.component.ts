import { CalculationService } from '../../../../supportModules/calculation.service';
import * as Chart from 'chart.js';
import { DatetimeService } from '../../../../supportModules/datetime.service';
import { CommonService } from '../../../../common.service';







export class CorrelationGraph {
    constructor(
        options: {
            vesselname ?: string,
            mmsi: number,
            matlabDates: number[],
            predictors: Dataset[],
            response ?: Dataset,
            dataType ?: string,
        },
        private calcService: CalculationService,
        private dateService: DatetimeService,
        private commonService: CommonService
    ) {
        Object.keys(options).forEach((key) => {
            this[key] = options[key];
        });
    }

    vesselname = 'Unnamed vessel';
    mmsi: number;
    private matlabDates: number[];
    dataType: 'transfer' | 'transit' = 'transfer';
    predictors: Dataset[];
    response: Dataset = {name: 'score', label: 'score'};

    private dataIsLoaded = false;
    private data;
    private chartHandle: Chart.Chart;

    load() {
        // Loads the data to draw the graph
        if (this.isLoaded()) {
            return;
        }

        this.data = this.commonService.getTransfersForVesselByRange({
            mmsi: [this.mmsi],
            dateMin: this.matlabDates[0],
            dateMax: this.matlabDates[1],
            reqFields: ['Hs', 'startTime'], //  this.predictors.map(elt => elt.name).push(this.response.name),
        });
        this.dataIsLoaded = true;
    }

    reload() {
        // Same as load but updates the already existing graph
        console.error('TODO');
    }

    isLoaded() {
        return this.dataIsLoaded;
    }

    setDate(dates: number[], reload: boolean = true) {
        this.matlabDates = dates;
        if (reload && this.isLoaded ) {
            this.reload();
        } else {
            this.dataIsLoaded = false; // Data no longer corresponds to the correct date
        }
    }

    info() {
        console.log(this);
        console.log(this.data);
        this.data.forEach(elt => {
            console.log(elt)
        });
    }

    draw(graphName: string) {
        this.load();

        this.chartHandle = new Chart(graphName, {
            type: 'scatter',
            data: this.data,
            labels: this.predictors.map(elt => elt.label).push(this.response.label),
            options: {
                title: {
                    display: true,
                    fontSize: 20,
                    text: 'Correlation graph',
                    position: 'top'
                },
                // tooltips: {
                //     callbacks: {
                //         beforeLabel: function (tooltipItem, data) {
                //             return data.datasets[tooltipItem.datasetIndex].label;
                //         },
                //         label: function (tooltipItem, data) {
                //             switch (args.axisType.x) {
                //                 case 'date':
                //                     return dateService.jsDateToMDHMString(data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].x);
                //                 case 'numeric':
                //                     return 'Value: ' + Math.round(tooltipItem.xLabel * 100) / 100;
                //                 default:
                //                     return '';
                //             }
                //         },
                //         afterLabel: function (tooltipItem, data) {
                //             if (args.axisType.y === 'date') {
                //                 return dateService.jsDateToMDHMString(data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].y);
                //             } else {
                //                 return 'Value: ' + Math.round(tooltipItem.yLabel * 100) / 100;
                //             }
                //         },
                //         title: function (tooltipItem, data) {
                //             // Prevents a bug from showing up in the bar chart tooltip
                //         }
                //     }
                // },
                scaleShowVerticalLines: false,
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                    display: true,
                    labels: {
                        defaultFontSize: 24,
                        defaultFontStyle: 'bold'
                    },
                },
                pointHoverRadius: 2,
                animation: {
                    duration: 0,
                },
                hover: {
                    animationDuration: 0,
                },
                responsiveAnimationDuration: 0,
            },
        });
        return this.chartHandle;
    }
}

interface Dataset {
    name: string;
    label: string;
}
