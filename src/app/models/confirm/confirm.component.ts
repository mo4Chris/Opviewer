import { Component, OnInit, Input, Output, ElementRef, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

// To use, include the code below in your html
// <ng-template #confirmSignoffModal let-modal>
//   <app-confirm title="Sign off DPR?" body="This will make it impossible to make further changes
//     to the DPR Input table for the rest of the day." [modal]="modal"></app-confirm>
// </ng-template>

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent implements OnInit {
  constructor() {}

  @Input() modal: NgbActiveModal;
  @Input() body: string;
  @Input() title: string;
  @Input() confirmTag: string = 'Confirm';
  @Input() cancelTag: string = 'Cancel';
  @Input() feedback: string = ''; // If provided, enables feedback box
  @Output() onConfirm = new EventEmitter();
  @Output() onCancel = new EventEmitter();

  text: string;

  ngOnInit() {
    if (this.modal === undefined || this.modal === null) {
      console.error('Invalid modal template provided!')
    }
  }

  confirm() {
    this.onConfirm.emit({
      mode: 'succes',
      feedback: this.text
    });
    this.modal.dismiss('Cross click');
  }

  cancel() {
    this.onCancel.emit({
      mode: 'cancel',
      feedback: this.text
    });
    this.modal.dismiss('Cross click');
  }
}
