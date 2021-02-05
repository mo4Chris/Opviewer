import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';
import { TokenModel } from './models/tokenModel';

const httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json',
      Authorization: localStorage.getItem('token')
    })
  };

@Injectable()
export class AuthService {
    private _getUserByTokenUrl = environment.DB_IP + '/api/getUserByToken/';
    private _setPasswordUrl = environment.DB_IP + '/api/setPassword/';
    private _loginurl = environment.DB_IP + '/api/login/';
    private _registerurl = environment.DB_IP + '/api/registerUser/';

    constructor(private httpClient: HttpClient) { }

    loginUser(user): Observable<TokenModel> {
        return this.httpClient.post<TokenModel>(this._loginurl, user, httpOptions);
    }

    getToken() {
        return localStorage.getItem('token');
    }

    registerUser(user): Observable<Object> {
        return this.httpClient.post(this._registerurl, user, httpOptions);
    }

    getUserByToken(token): Observable<Object>  {
        return this.httpClient.post(this._getUserByTokenUrl, token, httpOptions);
    }

    setUserPassword(passwords): Observable<Object>  {
        return this.httpClient.post(this._setPasswordUrl, passwords, httpOptions);
    }
}
