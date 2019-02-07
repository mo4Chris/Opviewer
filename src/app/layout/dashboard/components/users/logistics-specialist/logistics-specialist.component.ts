import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonService } from '../../../../../common.service';

@Component({
  selector: 'app-logistics-specialist',
  templateUrl: './logistics-specialist.component.html',
  styleUrls: ['./logistics-specialist.component.scss']
})
export class LogisticsSpecialistComponent implements OnInit {

  @Input() tokenInfo;
  @Output() locationData: EventEmitter<any[]> = new EventEmitter<any[]>();
  
  constructor(private newService: CommonService) { }

  ngOnInit() {

  }

  GetLocations() {
    this.newService.GetLatestBoatLocationForCompany(this.tokenInfo.userCompany).subscribe( boatLocationData => {
      this.locationData.emit(boatLocationData);
    });
  }
}
