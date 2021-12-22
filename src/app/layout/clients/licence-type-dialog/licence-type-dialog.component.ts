import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '@app/common.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Client } from '../client-overview.component';

@Component({
  selector: 'app-licence-type-dialog',
  templateUrl: './licence-type-dialog.component.html',
  styleUrls: ['./licence-type-dialog.component.scss']
})
export class LicenceTypeDialogComponent implements OnInit {
  public radioGroupForm: FormGroup;

  @Input() fromParent: Client;

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
  ) { }

  ngOnInit() {
    const clientPermission = this.fromParent.client_permissions
    const initialValue = clientPermission?.licenceType ? clientPermission.licenceType : 'NO_LICENCE'
    this.radioGroupForm = this.formBuilder.group({
      model: [initialValue, Validators.required]
    });
  }


  onSubmit(client) {
    if (this.radioGroupForm.valid) {
      this.commonService.updateClientLicence({ value: this.radioGroupForm.value.model, client_id: client.client_id }).subscribe({
        next: (res) => {
          this.activeModal.close({ type: 'succes', message: res.data });
        },
        error: (res) => {
          this.activeModal.close({ type: 'error', message: res.error });
        }
      })
    }
  }

}
