import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonService } from '../../../../../common.service';
import * as moment from 'moment';
import { AisMarkerModel } from '../../../dashboard.component';
import { DatetimeService } from '../../../../../supportModules/datetime.service';
import { CalculationService } from '../../../../../supportModules/calculation.service';
import { TokenModel } from '../../../../../models/tokenModel';
import { VesselModel } from '../../../../../models/vesselModel';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  @Input() tokenInfo: TokenModel;
  @Output() locationData: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output() zoominfo: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private newService: CommonService,
    private dateService: DatetimeService,
    private calcService: CalculationService
    ) { }
  numberActiveSessions = 'Currently not recorded';
  activeUsers = [{user: '', client: ''}];

  last_TWA_Update: string = 'N/A';
  last_AIS_update: 'N/A' | number = 'N/A';
  num_active_accounts = 0;
  currentMatlabDate = this.dateService.getMatlabDateYesterday() + 1;

  noActivityVessels: GeneralStatsInfo[] = [];
  vesselInfo = [];

  ngOnInit() {
    this.getActiveSessions();
    this.getLatestTwaUpdate();
    this.getActiveAccounts();
    this.getNoDataVessels();
    setTimeout(() => {
      this.setZoomLevel();
  });
  }

  parseRawTimestamp(locationData: AisMarkerModel): moment.Moment {
    // Parses the raw AIS timestamps
    return moment.utc(locationData.TIMESTAMP, 'YYYY-MM-DDThh:mm:ss');
  }

  getLocations() {
    this.newService.getLatestBoatLocation().subscribe( (boatLocationData: AisMarkerModel[]) => {
      this.locationData.emit(boatLocationData);
      const timeStamps = <moment.Moment[]> boatLocationData.map(locData => this.parseRawTimestamp(locData));
      this.last_AIS_update = timeStamps.map(timeStamp => {
        return moment().diff(timeStamp, 'minutes');
      }).reduce((prev, curr) => {
        return Math.min(prev, curr);
      });
    });
  }

  getActiveSessions() {
    this.newService.getActiveConnections().subscribe(users => {
      this.activeUsers = users;
    });
  }

  getLatestTwaUpdate() {
    this.newService.getLatestTwaUpdate().subscribe(lastUpdate => {
      const latestMatlabUpdate = this.dateService.daysSinceMatlabDate(lastUpdate) * 24;
      this.last_TWA_Update = this.calcService.roundNumber(latestMatlabUpdate, 10, ' hour(s)');
    });
  }

  setZoomLevel() {
    const zoominfo = {
      latitude: 55,
      longitude: 0.1,
      zoomlvl: 5.5
    };
    this.zoominfo.emit(zoominfo);
  }

  getNoDataVessels() {
    this.newService.getVessel().subscribe((vessels: VesselModel[]) => {
      this.vesselInfo = vessels;
      this.newService.getLatestGeneral().subscribe(genStatInfos => {
        genStatInfos.forEach(genInfo => {
          const vesselInfo: VesselModel = this.vesselInfo.find((vessel) => vessel.mmsi === genInfo._id);
          const isOnHire = vesselInfo !== undefined && vesselInfo.onHire;
          if (isOnHire && genInfo.date <= this.currentMatlabDate - 2) {
            this.noActivityVessels.push({
              matlabDate: genInfo.date,
              name: genInfo.vesselname,
              client: vesselInfo.client[0],
              lastActive: this.dateService.MatlabDateToJSDateYMD(genInfo.date),
              lastActiveDays: this.calcService.roundNumber(this.currentMatlabDate - genInfo.date, 1),
              type: vesselInfo.operationsClass,
            });
          }
        });
        this.noActivityVessels.sort((a, b) => {
          return a.matlabDate < b.matlabDate ? 1 : a.matlabDate === b.matlabDate ? 0 : -1;
        });
      });
    });
  }

  getActiveAccounts() {
    this.newService.getUsers().subscribe(users => {
       users.forEach(user => {
        if (user.active) {
          this.num_active_accounts++;
        }
      });
    });
  }
}

interface GeneralStatsInfo {
  matlabDate: number;
  name: string;
  client: string;
  lastActive: string;
  lastActiveDays: string;
  type: string;
}
