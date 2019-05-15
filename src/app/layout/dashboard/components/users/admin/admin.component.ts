import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonService } from '../../../../../common.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  @Input() tokenInfo;
  @Output() locationData: EventEmitter<any[]> = new EventEmitter<any[]>();

  constructor(private newService: CommonService) { }
  numberActiveUsers = 0
  activeUsers = [{user: '', client: ''}]

  ngOnInit() {
    this.getActiveUsers();
  }

  getLocations() {
    this.newService.getLatestBoatLocation().subscribe( boatLocationData => {
      this.locationData.emit(boatLocationData);
    });
  }

  getActiveUsers(){
    this.numberActiveUsers = 1;
  }
}
