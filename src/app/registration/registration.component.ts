import { Component, OnInit } from '@angular/core';
import { Client, CommonService } from '@app/common.service';
import { routerTransition } from '@app/router.animations';
import { AuthService } from '@app/auth.service';
import { UserService } from '@app/shared/services/user.service';
import { PermissionService } from '@app/shared/permissions/permission.service';
import { AlertService } from '@app/supportModules/alert.service';
import { UserType } from '@app/shared/enums/UserType';
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
    function: '',
    phoneNumber: ''
  };
  modalReference: NgbModalRef;

  dataPolicy = dataPolicyText;

  

  businessNames: string[]; // Loaded if admin
  clients: Client[] = [];
  createPermissions: UserType[] = [
    'Vessel master',
    'Logistics specialist',
    'Marine controller',
    'Client representative',
    'Qhse specialist'
  ];

  constructor(
    private routerService: RouterService,
    private _auth: AuthService,
    private newService: CommonService,
    private userService: UserService,
    public permission: PermissionService,
    public alert: AlertService,
    private modalService: NgbModal,
  ) {}

  ngOnInit() {

    console.log(dataPolicyText);
    if (!this.permission.admin && !this.permission.userCreate) {
      this.routerService.routeToAccessDenied();
    } else {
      this.createPermissions = this.createPermissions.concat(['admin', 'Logistics specialist']);
      this.newService.getCompanies().subscribe(clients => {
        this.clients = clients;
        this.businessNames = clients.map(client => client.client_name);
      });
    }
  }

  openModal(content) {
    this.modalReference = this.modalService.open(content, {size: 'xl'});
   }

  closeModal() {
    this.modalReference.close();
  }

  onRegistration(): void {
    const tokenInfo = this.userService.getDecodedAccessToken(localStorage.getItem('token'));
    if (this.registerUserData.email.length == 0) return this.alert.sendAlert({ text: 'Please enter email', type: 'danger' })
    if (this.registerUserData.password.length == 0) return this.alert.sendAlert({ text: 'Please enter password', type: 'danger' })
    if (this.registerUserData.confirmPassword.length == 0) return this.alert.sendAlert({ text: 'Please confirm your password', type: 'danger' })
    if (this.registerUserData.password !== this.registerUserData.confirmPassword) return this.alert.sendAlert({ text: 'Your passwords are not the same', type: 'danger' })
    if (this.registerUserData.name.length == 0) return this.alert.sendAlert({ text: 'Please enter your full name', type: 'danger' })
    if (this.registerUserData.company.length == 0) return this.alert.sendAlert({ text: 'Please enter company name', type: 'danger' })
    if (this.registerUserData.function.length == 0) return this.alert.sendAlert({ text: 'Please enter your function within your company', type: 'danger' })
    
    this._auth.registerDemoUser({
      client_id: 1,
      username: this.registerUserData.email,
      user_type: 'demo',
      requires2fa: false,
      vessel_ids: [],
      password: this.registerUserData.password, 
      company: this.registerUserData.company, 
      fullName: this.registerUserData.name, 
      function: this.registerUserData.function,
      phoneNumber: this.registerUserData.phoneNumber,
    }).subscribe( res => {
      this.alert.sendAlert({ type: 'success', text: res.data });
      this.routerService.route(['login', {status: 'success', message: res.data}]);
    }, err => {
      if (err.status === 401) {
        this.alert.sendAlert({ type: 'danger', text: err.error, timeout: null });
      } else {
        this.alert.sendAlert({ type: 'danger', text: 'Something is wrong, please contact MO4' });
      }
    });
  }
}
