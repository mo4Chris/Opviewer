import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../../../common.service';

import { UserService } from '../../../shared/services/user.service';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { AlertService } from '@app/supportModules/alert.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  routerValue = '';
  pushRightClass = 'push-right';
  modalReference: NgbModalRef;
  pages = ['dashboard', 'vesselsandreports', 'vesselreport', 'scatterplot', 'users', 'signup', 'user-settings', 'login', 'longterm', 'forecast'];
  tokenInfo = this.userService.getDecodedAccessToken(localStorage.getItem('token'));
  userCreatePermission;
  feedback: { message: string, page: string };

  @ViewChild('content') private _feedbackModal;

  constructor(
    private translate: TranslateService,
    public router: Router,
    private newService: CommonService,
    private modalService: NgbModal,
    private userService: UserService,
    public permission: PermissionService,
    public alert: AlertService,
  ) {
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
    this.userCreatePermission = this.permission.userCreate;
    this.feedback = { message: '', page: '' };
  }

  openRequestFullAccessAccountModal(content) {
    this.modalReference = this.modalService.open(content);
  }

  openFeedbackModal() {
    this.openModal(this._feedbackModal);
  }

  openModal(content) {
    if (this.router.url.includes(';')) {
      const mySubString = this.router.url.substring(
        this.router.url.lastIndexOf('/') + 1,
        this.router.url.lastIndexOf(';')
      );
      this.routerValue = mySubString;
    } else {
      this.routerValue = this.router.url.replace('/', '');
    }

    this.feedback.page = this.routerValue;

    this.modalReference = this.modalService.open(content);
  }

  sendFeedback() {
    this.newService.sendFeedback(this.feedback).subscribe(data => {
      if (data.status === 200) {
        this.alert.sendAlert({
          text: 'Feedback sent!',
          type: 'success'
        });
      } else {
        this.alert.sendAlert({
          text: 'Feedback has not been sent, please try again later',
          type: 'danger'
        });
      }
    });

    this.closeModal();
  }

  requestFullAccount() {
    if (!this.permission?.demo) {
      this.alert.sendAlert({
        text: 'Request has not been sent, you already have a full account',
        type: 'warning'
      });
    } else {
      this.newService.requestFullAccount().subscribe(data => {
        if (data.status === 200) {
          this.alert.sendAlert({
            text: 'Full account requested!',
            type: 'success'
          });
        } else {
          this.alert.sendAlert({
            text: 'Request has not been sent, please try again later',
            type: 'danger'
          });
        }
      });
    }
    this.closeModal();
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
    this.userService.logout();
  }

  changeLang(language: string) {
    this.translate.use(language);
  }
}
