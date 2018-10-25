import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import * as jwt_decode from 'jwt-decode';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
    routerValue = '';
    pushRightClass = 'push-right';
    modalReference: NgbModalRef;
    feedbackForm: FormGroup;
    pages = ['dashboard', 'tables', 'vesselreport', 'scatterplot', 'users', 'signup', 'login' ];
    tokenInfo = this.getDecodedAccessToken(localStorage.getItem('token'));
    userCreatePermission = this.tokenInfo.userPermission === 'admin' || this.tokenInfo.userPermission === 'Logistics specialist';

    getDecodedAccessToken(token: string): any {
        try {
            return jwt_decode(token);
        } catch (Error) {
            return null;
        }
      }

    constructor(private translate: TranslateService, public router: Router, private formBuilder: FormBuilder, private modalService: NgbModal) {

        this.translate.addLangs(['en', 'fr', 'ur', 'es', 'it', 'fa', 'de', 'zh-CHS']);
        this.translate.setDefaultLang('en');
        const browserLang = this.translate.getBrowserLang();
        this.translate.use(browserLang.match(/en|fr|ur|es|it|fa|de|zh-CHS/) ? browserLang : 'en');

        this.router.events.subscribe(val => {
            if (
                val instanceof NavigationEnd &&
                window.innerWidth <= 992 &&
                this.isToggled()
            ) {
                this.toggleSidebar();
            }
        });
    }

    ngOnInit() {
    }

    openModal(content) {

        if (this.router.url.includes(';')){
            const mySubString = this.router.url.substring(
                this.router.url.lastIndexOf('/') + 1,
                this.router.url.lastIndexOf(';')
            );
            this.routerValue = mySubString;
        } else {
            this.routerValue = this.router.url.replace('/', '');
        }

        this.feedbackForm = this.formBuilder.group({
            pageControl: [this.routerValue]
        });

        this.modalReference = this.modalService.open(content);
     }

    closeModal() {
        this.modalReference.close();
    }

    isToggled(): boolean {
        const dom: Element = document.querySelector('body');
        return dom.classList.contains(this.pushRightClass);
    }

    toggleSidebar() {
        const dom: any = document.querySelector('body');
        dom.classList.toggle(this.pushRightClass);
    }

    rltAndLtr() {
        const dom: any = document.querySelector('body');
        dom.classList.toggle('rtl');
    }

    onLoggedout() {
        localStorage.removeItem('token');
    }

    changeLang(language: string) {
        this.translate.use(language);
    }
}
