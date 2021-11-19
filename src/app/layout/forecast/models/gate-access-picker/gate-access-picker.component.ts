import { Component, Input, OnChanges, Output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-gate-access-picker',
  templateUrl: './gate-access-picker.component.html',
  styleUrls: ['./gate-access-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GateAccessPickerComponent implements OnChanges {
  @Input() heading = 0;

  public data: Plotly.Data[];
  public loaded = false;
  public PlotLayout: Partial<Plotly.Layout> = {
    // General settings for the graph
    height: 400,
    width: 400,
    margin: {
      l: 40,
      r: 20,
      b: 0,
      t: 0,
      pad: 4
    },
    polar: {
      radialaxis: {
        visible: false,
        range: [-70, 100],
        tickvals: [0, 100],
        ticktext: ['', '']
      },
      angularaxis: {
        tickmode: 'array',
        tickvals: [0, 45, 90, 135, 180, 225, 270, 315],
        ticktext: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
        direction: 'clockwise',
        tickfont: {
          size: 10
        },
        gridcolor: 'white'
      } as any
    },
    images: [
      {
        x: 0.5,
        y: 0.5,
        sizex: 0.35,
        sizey: 0.35,
        source: "assets/images/WTG.png",
        xanchor: "center",
        yanchor: "middle",
      }
    ],
  };

  public config = {
    staticPlot: false,
    displayModeBar: false
  };

  gateLocations = [
    { name: "gate A", heading: 0 },
    { name: 'gate B', heading: 150 },
    { name: 'gate C', heading: 230 },
  ];
  approachMargin = 20;

  accessibilityPer10Degrees = [
    { startDegreeRange: 0, endDegreeRange: 10, workabilityLimit: 75 },
    { startDegreeRange: 10, endDegreeRange: 20, workabilityLimit: 80 },
    { startDegreeRange: 20, endDegreeRange: 30, workabilityLimit: 85 },
    { startDegreeRange: 30, endDegreeRange: 40, workabilityLimit: 20 },
    { startDegreeRange: 40, endDegreeRange: 50, workabilityLimit: 75 },
    { startDegreeRange: 50, endDegreeRange: 60, workabilityLimit: 80 },
    { startDegreeRange: 60, endDegreeRange: 70, workabilityLimit: 85 },
    { startDegreeRange: 70, endDegreeRange: 80, workabilityLimit: 50 },
    { startDegreeRange: 80, endDegreeRange: 90, workabilityLimit: 75 },
    { startDegreeRange: 90, endDegreeRange: 100, workabilityLimit: 80 },

    { startDegreeRange: 100, endDegreeRange: 110, workabilityLimit: 85 },
    { startDegreeRange: 110, endDegreeRange: 120, workabilityLimit: 180 },
    { startDegreeRange: 120, endDegreeRange: 130, workabilityLimit: 75 },
    { startDegreeRange: 130, endDegreeRange: 140, workabilityLimit: 85 },
    { startDegreeRange: 140, endDegreeRange: 150, workabilityLimit: 80 },
    { startDegreeRange: 150, endDegreeRange: 160, workabilityLimit: 75 },
    { startDegreeRange: 160, endDegreeRange: 170, workabilityLimit: 80 },
    { startDegreeRange: 170, endDegreeRange: 180, workabilityLimit: 45 },
    { startDegreeRange: 180, endDegreeRange: 190, workabilityLimit: 80 },
    { startDegreeRange: 190, endDegreeRange: 200, workabilityLimit: 75 },

    { startDegreeRange: 200, endDegreeRange: 210, workabilityLimit: 80 },
    { startDegreeRange: 210, endDegreeRange: 220, workabilityLimit: 85 },
    { startDegreeRange: 220, endDegreeRange: 230, workabilityLimit: 80 },
    { startDegreeRange: 230, endDegreeRange: 240, workabilityLimit: 175 },
    { startDegreeRange: 240, endDegreeRange: 250, workabilityLimit: 80 },
    { startDegreeRange: 250, endDegreeRange: 260, workabilityLimit: 85 },
    { startDegreeRange: 260, endDegreeRange: 270, workabilityLimit: 80 },
    { startDegreeRange: 270, endDegreeRange: 280, workabilityLimit: 75 },
    { startDegreeRange: 280, endDegreeRange: 290, workabilityLimit: 60 },
    { startDegreeRange: 290, endDegreeRange: 300, workabilityLimit: 85 },

    { startDegreeRange: 300, endDegreeRange: 310, workabilityLimit: 80 },
    { startDegreeRange: 310, endDegreeRange: 320, workabilityLimit: 80 },
    { startDegreeRange: 320, endDegreeRange: 330, workabilityLimit: 80 },
    { startDegreeRange: 330, endDegreeRange: 340, workabilityLimit: 80 },
    { startDegreeRange: 340, endDegreeRange: 350, workabilityLimit: 80 },
    { startDegreeRange: 350, endDegreeRange: 360, workabilityLimit: 80 },

  ]

  constructor() { }

  ngOnChanges() {
    this.updatePolarPlot();
  }

  updatePolarPlot() {
    this.data = [];

    this.createGateAccessBarriers();

    this.addRelevantHeadingValues();

    this.addDriftOff();
    this.addBlowOn();

  }

  createGateAccessBarriers() {
    this.gateLocations?.forEach(element => {
      const headingStart = this.calculateHeadingStart(element.heading, this.approachMargin);
      const headingEnd = this.calculateHeadingEnd(element.heading, this.approachMargin);

      this.data.push({
        name: element.name,
        type: "scatterpolar",
        mode: "lines",
        showlegend: true,
        r: [-70, 200, 200, -70],
        theta: [headingStart, headingStart, headingEnd, headingEnd],
        line: {
          color: 'rgba(0,0,0,1)'
        }
      });
    });
  }

  addDriftOff() {
    this.data.push({
      name: 'Drift-off',
      type: "scatterpolar",
      mode: "lines",
      showlegend: true,
      r: [-70, 200, 200, -70],
      theta: [45, 45, 135, 135],
      fill: "toself",
      fillcolor: 'rgba(0,0,200,0.05)',
      line: {
        color: 'rgba(0,0,200,0.05)'
      }
    });
  }

  addBlowOn() {
    this.data.push({
      name: 'Blow-on',
      type: "scatterpolar",
      mode: "lines",
      showlegend: true,
      r: [-70, 200, 200, -70],
      theta: [230, 230, 315, 315],
      fill: "toself",
      fillcolor: 'rgba(0,0,0,0.05)',
      line: {
        color: 'rgba(0,0,0,0.05)'
      }
    });
  }

  addRelevantHeadingValues() {

    this.gateLocations?.forEach(element => {
      const headingStart = this.calculateHeadingStart(element.heading, this.approachMargin);
      const headingEnd = this.calculateHeadingEnd(element.heading, this.approachMargin);


      const leadingAccessIndex = this.getLeadingAccessRangeIndex(headingStart);
      const trailingAccessIndex = this.getTrailingAccessRangeIndex(headingEnd);

      if ( leadingAccessIndex > trailingAccessIndex ) {
        this.generateAccessLimitPer10DegreesWhenLeadingIsLargerThanTrailing(leadingAccessIndex, trailingAccessIndex);
      } else { 
        this.generateAccessLimitPer10Degrees(leadingAccessIndex, trailingAccessIndex);
      }
      
    })
  }

  generateAccessLimitPer10DegreesWhenLeadingIsLargerThanTrailing(leadingAccessIndex, trailingAccessIndex) {
    for (let index = leadingAccessIndex; index < this.accessibilityPer10Degrees.length; index++) {
      let isGray = false;
      if (index == leadingAccessIndex || index == trailingAccessIndex -1) isGray = true;
      this.createBarPer10Degrees(index, isGray);
    }

    for (let index = 0; index < trailingAccessIndex; index++) {
      let isGray = false;
      if (index == leadingAccessIndex || index == trailingAccessIndex -1) isGray = true;
      this.createBarPer10Degrees(index, isGray);
    }
  }
  

  generateAccessLimitPer10Degrees(leadingAccessIndex, trailingAccessIndex) {
    for (let index = leadingAccessIndex; index < trailingAccessIndex; index++) {
      let isGray = false;
      if (index == leadingAccessIndex || index == trailingAccessIndex -1) isGray = true;
      this.createBarPer10Degrees(index, isGray);
    }
  }

  createBarPer10Degrees(index, isFirstOrLast) {
    const utilizationLimit = 100 - this.accessibilityPer10Degrees[index].workabilityLimit;
    const degreeRangeStart = this.accessibilityPer10Degrees[index].startDegreeRange + 1;
    const degreeRangeEnd = this.accessibilityPer10Degrees[index].endDegreeRange - 1;

    let rangeAccessColor = this.getColorForAccesibility(this.accessibilityPer10Degrees[index].workabilityLimit);

    if (isFirstOrLast) rangeAccessColor = 'grey';

    this.data.push({
      type: "scatterpolar",
      mode: "lines",
      r: [100, utilizationLimit, utilizationLimit, 100],
      theta: [degreeRangeStart, degreeRangeStart, degreeRangeEnd, degreeRangeEnd],
      fill: "toself",
      fillcolor: rangeAccessColor,
      showlegend: false,
      line: {
        color: rangeAccessColor
      }
    })
  }

  getLeadingAccessRangeIndex(value) {
    const result = this.accessibilityPer10Degrees.findIndex(accessArea => accessArea.endDegreeRange == value || (accessArea.endDegreeRange > value && accessArea.startDegreeRange < value));
    return result;

  }

  getTrailingAccessRangeIndex(value) {
    const result = this.accessibilityPer10Degrees.findIndex(accessArea => accessArea.startDegreeRange == value || (accessArea.endDegreeRange > value && accessArea.startDegreeRange < value));
    return result + 1;
  }

  calculateHeadingStart(headingLocation, variation) {
    if (headingLocation - variation < 0) {
      return 360 + (headingLocation - variation);
    }

    return headingLocation - variation;
  }

  calculateHeadingEnd(headingLocation, variation) {
    if (headingLocation + variation > 360) {
      return (headingLocation + variation) - 360;
    }

    return headingLocation + variation;
  }

  getColorForAccesibility(value) {
    if (value > 0 && value < 80) return 'Green';
    if (value >= 80 && value < 100) return 'Orange';
    if (value >= 100) return 'Red';

  }

  onPlotlyInit() {
    this.loaded = true;
  }

}
