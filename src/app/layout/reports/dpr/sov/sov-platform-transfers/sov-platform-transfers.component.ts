import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-sov-platform-transfers',
  templateUrl: './sov-platform-transfers.component.html',
  styleUrls: ['./sov-platform-transfers.component.scss']
})
export class SovPlatformTransfersComponent implements OnInit {
  @Input() platformTransfers;

  constructor() { }

  ngOnInit() {
  }

}
