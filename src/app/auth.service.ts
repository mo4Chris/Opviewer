import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
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
    private _getUserByTokenUrl = environment.DB_IP + '/api/getUserByToken/';
    private _setPasswordUrl = environment.DB_IP + '/api/setPassword/';
    private _loginurl = environment.DB_IP + '/api/mo4admin/login';
    //private _loginurl = environment.DB_IP + '/api/login/';
    private _registerurl = environment.DB_IP + '/api/registerUser/';

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
        )
    }

    getToken() {
        return localStorage.getItem('token');
    }

    registerUser(user): Observable<{ data: string, status: number }> {
        return this.httpClient.post<{ data: string, status: number }>(this._registerurl, user, httpOptions);
    }

    getUserByToken(token): Observable<UserObject>  {
        return this.httpClient.post<UserObject>(this._getUserByTokenUrl, token, httpOptions);
    }

    setUserPassword(passwords): Observable<{token: string}>  {
        return this.httpClient.post<{token: string}>(this._setPasswordUrl, passwords, httpOptions);
    }
}

export interface UserObject {
    username: string;
    userCompany: string;
    permissions: UserType;
}

export interface UserLoginData {
    username: string;
    password: string;
    confirm2fa: string;
};