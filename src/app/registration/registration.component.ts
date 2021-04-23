import { Component, OnInit } from '@angular/core';
import { routerTransition } from '@app/router.animations';
import { AuthService } from '@app/auth.service';
import { AlertService } from '@app/supportModules/alert.service';
import { RouterService } from '@app/supportModules/router.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { dataPolicyText } from './MO4-data-policy';


@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  animations: [routerTransition()]
})
export class RegistrationComponent implements OnInit {
  registerUserData = {
    client: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    company: '',
    job_title: '',
    phoneNumber: '',
    agreeDataPolicy: false
  };
  modalReference: NgbModalRef;

  dataPolicy = dataPolicyText;



  constructor(
    private routerService: RouterService,
    private _auth: AuthService,
    public alert: AlertService,
    private modalService: NgbModal,
  ) {}

  ngOnInit() {

  }

  openModal(content) {
    this.modalReference = this.modalService.open(content, {size: 'xl'});
   }

  closeModal() {
    this.modalReference.close();
  }

  onRegistration(): void {
    if (this.registerUserData.email.length === 0) return this.alert.sendAlert({ text: 'Please enter email', type: 'danger' });
    if (this.registerUserData.password.length === 0) return this.alert.sendAlert({ text: 'Please enter password', type: 'danger' });
    if (this.registerUserData.confirmPassword.length === 0) return this.alert.sendAlert({ text: 'Please confirm your password', type: 'danger' });
    if (this.registerUserData.password !== this.registerUserData.confirmPassword) return this.alert.sendAlert({ text: 'Your passwords are not the same', type: 'danger' });
    if (this.registerUserData.name.length === 0) return this.alert.sendAlert({ text: 'Please enter your full name', type: 'danger' });
    if (this.registerUserData.company.length === 0) return this.alert.sendAlert({ text: 'Please enter company name', type: 'danger' });
    if (this.registerUserData.job_title.length === 0) return this.alert.sendAlert({ text: 'Please enter your job title within your company', type: 'danger' });
    if (this.registerUserData.agreeDataPolicy === false) return this.alert.sendAlert({ text: 'You have to agree with the Data Policy to create your account', type: 'danger'});

    this._auth.registerDemoUser({
      client_id: 1,
      username: this.registerUserData.email,
      user_type: 'demo',
      requires2fa: false,
      vessel_ids: [],
      password: this.registerUserData.password,
      company: this.registerUserData.company,
      full_name: this.registerUserData.name,
      job_title: this.registerUserData.job_title,
      phoneNumber: this.registerUserData.phoneNumber,
    }).subscribe( res => {
      this.alert.sendAlert({ type: 'success', text: res.data });
      this.routerService.route(['login', {status: 'success', message: res.data}]);
    }, err => {
      if (err.status === 400 || err.status === 401) {
        this.alert.sendAlert({ type: 'danger', text: err.error, timeout: null });
      } else {
        this.alert.sendAlert({ type: 'danger', text: 'Something is wrong, please contact MO4' });
      }
    });
  }
}
