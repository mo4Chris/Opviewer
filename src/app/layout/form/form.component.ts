import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { FormGroup, FormControl, Validators, FormsModule, } from '@angular/forms';
import { CommonService } from '../../common.service';

import { Http, Response, Headers, RequestOptions } from '@angular/http';

@Component({
    selector: 'app-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.scss'],
    animations: [routerTransition()]
})
export class FormComponent implements OnInit {
    constructor(private newService: CommonService ) { }
    Locdata;
    errData;

    ngOnInit() {
        this.newService.getLatestBoatLocation().subscribe(data => this.Locdata = data, err => this.errData = err);
    }

}
