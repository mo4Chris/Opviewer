import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonService } from '../../../../../common.service';
import * as moment from 'moment';
import { AisMarkerModel } from '../../../dashboard.component';
import { DatetimeService } from '../../../../../supportModules/datetime.service';
import { CalculationService } from '../../../../../supportModules/calculation.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  @Input() tokenInfo;
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

  ngOnInit() {
    this.getActiveSessions();
    this.getLatestTwaUpdate();
    this.getActiveAccounts();
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
