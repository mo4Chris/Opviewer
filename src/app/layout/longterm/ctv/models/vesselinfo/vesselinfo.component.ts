import { Component, OnInit, ɵConsole, Input, Output, EventEmitter } from '@angular/core';
import { TokenModel } from '../../../../../models/tokenModel';
import { CommonService } from '../../../../../common.service';

@Component({
  selector: 'app-vesselinfo',
  templateUrl: './vesselinfo.component.html',
  styleUrls: ['./vesselinfo.component.scss']
})
export class VesselinfoComponent implements OnInit {
  constructor() {}

  @Input() vesselObject: {dateMin: number, dateMax: number, dateNormalMin: string, dateNormalMax: string, mmsi: number[]};
  @Input() tokenInfo: TokenModel;
  @Input() newService: CommonService;
  @Output() navigateToVesselreport: EventEmitter<{mmsi: number, matlabDate: number}> = new EventEmitter<{mmsi: number, matlabDate: number}>();

  vessels: VesselInfoModel[] = [];


  ngOnInit() {
  }

  loadInfos() {
    this.vessels = [];
    this.newService.getVessel().subscribe(_vessels => {
      this.vesselObject.mmsi.forEach(_mmsi => {
        _vessels.forEach(vessel => {
          if (vessel.mmsi === _mmsi) {
            console.log(vessel)
            this.vessels.push({
              mmsi: vessel.mmsi,
              Name: assertString(vessel.nicename),
              Length: assertNumber(vessel.vessel_length, 'm'),
              Displacement: assertNumber(vessel.displacement / 1000, 'ton'),
              Operator: assertString(vessel.Operator),
              PropType: assertString(vessel.Propulsion_type),
            });
          }
        });
      });
    });
  }

  update() {
    this.loadInfos();
  }
}

interface VesselInfoModel {
  mmsi: number;
  Name: string;
  Length: string;
  Displacement: string;
  Operator: string;
  PropType: string;
}

function assertString(str) {
  if (typeof(str) === 'string') {
    return str;
  } else {
    return '-';
  }
}

function assertNumber(num, support_string = ''): string {
  if (typeof(num) === 'number') {
    return num.toFixed(0) + ' ' + support_string;
  } else {
    return '-';
  }
}
