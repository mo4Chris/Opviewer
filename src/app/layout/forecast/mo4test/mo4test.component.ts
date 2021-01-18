import { Component, OnInit } from '@angular/core';
import { CommonService } from '@app/common.service';

@Component({
  selector: 'app-mo4test',
  templateUrl: './mo4test.component.html',
  styleUrls: ['./mo4test.component.scss']
})
export class Mo4testComponent implements OnInit {

  constructor(
    private newService: CommonService,
  ) {
    console.log('INIT MO4 LIGHT TEST COMPONENT')
  }

  ngOnInit() {
    this.newService.getForecastConnectionTest().subscribe(test => {
      console.log(test)
      
    })
  }

}
