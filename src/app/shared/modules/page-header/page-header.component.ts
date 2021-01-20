import { Component, OnInit, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-page-header',
    templateUrl: './page-header.component.html',
    styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent implements OnInit {
    @Input() heading: string;
    @Input() icon: string;
    @Input() title: string;
    constructor() { }

    ngOnInit() {
        if (this.title) {
            this.title = this.heading + ' ' + this.title;
        } else {
            this.title = this.heading;
        }
    }
}
