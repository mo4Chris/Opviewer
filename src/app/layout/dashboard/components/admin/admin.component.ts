import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment-timezone';
import { CommonService } from '@app/common.service';
import { AisMarkerModel } from '../../dashboard.component';
import { DatetimeService } from '@app/supportModules/datetime.service';
import { TokenModel } from '@app/models/tokenModel';
import { CalculationService } from '@app/supportModules/calculation.service';
import { VesselModel } from '@app/models/vesselModel';

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
    ) {}
  numberActiveSessions = 'Currently not recorded';
  activeUsers = [{user: '', client: ''}];

  last_TWA_Update = '>3 days ago';
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
      this.activeUsers = <any> users; // ToDo: fix this assignment once we can do actual tracking
    });
  }

  getLatestTwaUpdate() {
    this.newService.getLatestTwaUpdate().subscribe(lastUpdate => {
      if (lastUpdate > 0) {
        const latestMatlabUpdate = this.dateService.getDaysSinceMatlabDatenum(lastUpdate);
        if (lastUpdate < 2) {
          this.last_TWA_Update = this.calcService.roundNumber(latestMatlabUpdate * 24, 10, ' hour(s)');
        } else {
          this.last_TWA_Update = this.calcService.roundNumber(latestMatlabUpdate, 10, ' days');
        }
      }
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
          const vesselInfo: VesselModel = this.vesselInfo.find(vessel => vessel.mmsi === genInfo._id);
          const isOnHire = vesselInfo !== undefined && vesselInfo.active;
          if (isOnHire && genInfo.date <= this.currentMatlabDate - 2) {
            this.noActivityVessels.push({
              matlabDate: genInfo.date,
              name: genInfo.vesselname.split('_').join(' '),
              client: vesselInfo.client[0],
              lastActive: this.dateService.matlabDatenumToYmdString(genInfo.date),
              lastActiveDays: this.calcService.roundNumber(this.currentMatlabDate - genInfo.date, 1),
              type: vesselInfo.operations_class,
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
