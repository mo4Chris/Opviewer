import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
// tslint:disable-next-line:import-blacklist
import { Observable } from 'rxjs';
import { UserType } from './shared/enums/UserType';
import { CommonService } from './common.service';
import { map } from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
    'Authorization': '' + localStorage.getItem('token')
  })
  };

@Injectable()
export class AuthService {
  private _getUserByTokenUrl = environment.DB_IP + '/api/getRegistrationInformation/';
  private _setPasswordUrl = environment.DB_IP + '/api/setPassword/';
  private _loginurl = environment.DB_IP + '/api/login/';
  private _registerurl = environment.DB_IP + '/api/createUser/';
  private _registerDemourl = environment.DB_IP + '/api/createDemoUser/';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService,
  ) { }

  loginUser(user: UserLoginData): Observable<{token: string}> {
    return this.httpClient.post<{token: string}>(this._loginurl, user, httpOptions).pipe(
      map((tokenObj) => {
        this.commonService.updateAuthorizationToken(tokenObj.token);
        return tokenObj;
      })
    );
  }

  getToken() {
    return localStorage.getItem('token');
  }

  registerUser(user: UserCreationData): Observable<{ data: string, status: number }> {
    // Create a new account using an account that is already active
    return this.httpClient.post<{ data: string, status: number }>(this._registerurl, user, httpOptions);
  }

  registerDemoUser(user: UserDemoData): Observable<{ data: string, status: number }> {
    // Create a new account using an account that is already active
    return this.httpClient.post<{ data: string, status: number }>(this._registerDemourl, user, httpOptions);
  }

  getRegistrationInformation(token: {registration_token: string, user: string}): Observable<SetPasswordData> {
    return this.httpClient.post<SetPasswordData>(this._getUserByTokenUrl, token, httpOptions);
  }

  setUserPassword(passwords: PasswordInfo): Observable<{token: string}>  {
    // Set password and 2fa using an account which is created but does not yet have a valid password
    return this.httpClient.post<{token: string}>(this._setPasswordUrl, passwords, httpOptions);
  }
}

export interface UserObject {
  username: string;
  client_name: string;
  requires2fa: boolean;
  permission: {
    admin: boolean,
    user_type: UserType;
  };
}

export interface UserLoginData {
    username: string;
    password: string;
    confirm2fa: string;
}

interface PasswordInfo {
  passwordToken: string;
  password: string;
  confirmPassword: string;
  secret2fa: string;
}

interface SetPasswordData {
  username: string;
  requires2fa:boolean;
  secret2fa: string;
}

interface UserCreationData {
  username: string;
  client_id: number;
  user_type: string;
  requires2fa: boolean;
  vessel_ids: number[];
}

interface UserDemoData {
  username: string;
  password: string;
  client_id: number;
  company: string;
  full_name: string;
  job_title: string;
  phoneNumber: string;
  user_type: string;
  requires2fa: boolean;
  vessel_ids: number[];
}
