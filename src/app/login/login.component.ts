import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { routerTransition } from '../router.animations';
import { AuthService } from '../auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from '@app/supportModules/alert.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    animations: [routerTransition()]
})
export class LoginComponent implements OnInit {
  loginUserData = {
    username: '',
    password: '',
    confirm2fa: ''
  };

  constructor(
    public router: Router,
    private _auth: AuthService,
    public alert: AlertService,
  ) {}


  ngOnInit() {}

  onLoggedin() {
    this._auth.loginUser(this.loginUserData).subscribe(
      res => {
        localStorage.setItem('token', res.token);
        this.router.navigate(['/dashboard']);
      },
      err => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            console.log(err);
            this.alert.sendAlert({
              text: err.error,
              type: 'danger'
            });
            this.router.navigate(['/login']);
          }
        } else {
          console.log(err);
          this.alert.sendAlert({
            text: 'Something is wrong, contact BMO Offshore',
            type: 'danger'
          });
        }
      }
    );
  }
}
