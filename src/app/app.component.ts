import { Component, OnInit } from '@angular/core';
import { ViewChild } from '@angular/core';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    constructor() {}

    ngOnInit() {

        window.onbeforeprint = (evt) => {
            // Only update size of the container: the graphs will auto rescale
            const containers = <HTMLCollection> document.getElementsByClassName('chartContainer');
            for (let _i = 0; _i < containers.length; _i++) {
                const container = <HTMLDivElement> containers[_i];
                container.style.width = '225mm';
            }
        };
        window.onafterprint = (evt) => {
            // Only update size of the container: the graphs will auto rescale
            const containers = <HTMLCollection> document.getElementsByClassName('chartContainer');
            for (let _i = 0; _i < containers.length; _i++) {
                const container = <HTMLDivElement> containers[_i];
                container.style.width = '100%';
            }
        };
    }
}
