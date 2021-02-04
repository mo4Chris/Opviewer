import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

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

    loginUser(user): Observable<any> {
        return this.httpClient.post<any>(this._loginurl, user, httpOptions);
    }

    getToken() {
        return localStorage.getItem('token');
    }

    registerUser(user): Observable<any> {
        return this.httpClient.post(this._registerurl, user, httpOptions);
    }

    getUserByToken(token): Observable<any> {
        return this.httpClient.post(this._getUserByTokenUrl, token, httpOptions);
    }

    setUserPassword(passwords): Observable<any> {
        return this.httpClient.post(this._setPasswordUrl, passwords, httpOptions);
    }
}
