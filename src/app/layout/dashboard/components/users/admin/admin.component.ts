import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonService } from '../../../../../common.service';
import * as moment from 'moment';
import { AisMarkerModel } from '../../../dashboard.component';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  @Input() tokenInfo;
  @Output() locationData: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output() zoominfo: EventEmitter<any> = new EventEmitter<any>();

  constructor(private newService: CommonService) { }
  numberActiveUsers = 'This is currently not recordedz';
  activeUsers = [{user: '', client: ''}];
  last_TWA_Update: 'N/A' | number = 'N/A';
  last_AIS_update: 'N/A' | number = 'N/A';

  ngOnInit() {
    this.getActiveUsers();
    this.getLatestTwaUpdate();
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

  getActiveUsers() {
    this.newService.getActiveConnections().subscribe(users => {
      console.log(users);
    });
  }

  getLatestTwaUpdate() {
    this.newService.getLatestTwaUpdate().subscribe(lastUpdate => {
      this.last_TWA_Update = lastUpdate;
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
}
