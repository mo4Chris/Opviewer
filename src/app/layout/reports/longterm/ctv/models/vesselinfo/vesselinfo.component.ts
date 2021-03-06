import { Component, OnInit, ɵConsole, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonService } from '@app/common.service';
import { TokenModel } from '@app/models/tokenModel';
import { VesselModel } from '@app/models/vesselModel';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { UserService } from '@app/shared/services/user.service';

@Component({
  selector: 'app-vesselinfo',
  templateUrl: './vesselinfo.component.html',
  styleUrls: ['./vesselinfo.component.scss']
})
export class VesselinfoComponent implements OnChanges, OnInit {
  @Input() mmsi: number[];
  @Output() navigateToVesselreport: EventEmitter<{mmsi: number, matlabDate: number}> = new EventEmitter<{mmsi: number, matlabDate: number}>();

  vesselStore: VesselModel[];
  vessels: VesselInfoModel[] = [];

  constructor(
    private newService: CommonService,
    private permission: PermissionService,
    private userService: UserService
  ) {}

  ngOnInit() {
    if (this.permission.admin) {
      this.newService.getVessel().subscribe(_vessels => {
        this.vesselStore = _vessels;
        if (this.mmsi) {
          this.loadInfos();
        }
      });
    } else {
      const token = TokenModel.load(this.userService);
      this.newService.getVessel().subscribe(_vessels => {
        this.vesselStore = _vessels;
        if (this.mmsi) {
          this.loadInfos();
        }
      });
    }
  }

  ngOnChanges() {
    if (this.vesselStore) {
      this.loadInfos();
    }
  }

  loadInfos() {
    this.vessels = [];
    this.mmsi.forEach(_mmsi => {
      this.vesselStore.forEach(vessel => {
        if (vessel.mmsi === _mmsi) {
          this.vessels.push({
            mmsi: vessel.mmsi,
            Name: assertString(vessel.nicename),
            Length: assertNumber(vessel.vessel_length, 'm'),
            Displacement: assertNumber(vessel.displacement, 'ton', 1 / 1000),
            Operator: assertString(vessel.Operator),
            PropType: assertString(vessel.Propulsion_type),
          });
        }
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

function assertNumber(num, support_string = '', scalar?: number): string {
  if (typeof(num) === 'number') {
    if (scalar) {
      num = num * scalar;
    }
    return num.toFixed(0) + ' ' + support_string;
  } else {
    return '-';
  }
}
