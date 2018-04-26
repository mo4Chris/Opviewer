import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { FormGroup, FormControl, Validators, FormsModule, } from '@angular/forms';
import { CommonService } from '../../common.service';

import { Http, Response, Headers, RequestOptions } from '@angular/http';

@Component({
    selector: 'app-tables',
    templateUrl: './tables.component.html',
    styleUrls: ['./tables.component.scss'],
    animations: [routerTransition()]
})
export class TablesComponent implements OnInit {
    constructor(private newService: CommonService ) { }
    Repdata;
    valbutton = "Save";


    ngOnInit() {
        this.newService.GetVessel().subscribe(data => this.Repdata = data)
    }

    onSave = function (vessel, isValid: boolean) {
        vessel.mode = this.valbutton;
        this.newService.saveVessel(vessel)
            .subscribe(data => {
                alert(data.data);

                this.ngOnInit();
            }
                , error => this.errorMessage = error)
    }
    edit = function (kk) {
        this.id = kk._id;
        this.name = kk.name;
        this.address = kk.address;
        this.valbutton = "Update";
    }
}
