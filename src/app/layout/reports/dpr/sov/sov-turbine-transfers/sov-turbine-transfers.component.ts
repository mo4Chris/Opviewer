import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-sov-turbine-transfers',
  templateUrl: './sov-turbine-transfers.component.html',
  styleUrls: ['./sov-turbine-transfers.component.scss']
})
export class SovTurbineTransfersComponent implements OnInit {
  @Input() turbineTransfers;

  constructor() { }

  ngOnInit() {
  }

}
