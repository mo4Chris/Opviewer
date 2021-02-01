import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Http, Headers, Response } from '@angular/http';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable()
export class AuthService {
    private _getUserByTokenUrl = environment.DB_IP + '/api/getUserByToken/';
    private _setPasswordUrl = environment.DB_IP + '/api/setPassword/';
    private _loginurl = environment.DB_IP + '/api/login/';
    private _registerurl = environment.DB_IP + '/api/registerUser/';

    constructor(
        private http: Http,
        private httpClient: HttpClient
    ) { }

    loginUser(user) {
        return this.httpClient.post<any>(this._loginurl, user);
    }

    getToken() {
        return localStorage.getItem('token');
    }

    registerUser(user) {
        const headers = new Headers();
        headers.append('authorization', localStorage.getItem('token'));
        return this.http.post(this._registerurl, user, { headers: headers }).pipe(
            map((response: Response) => response.json()));
    }

    getUserByToken(token) {
        return this.http.post(this._getUserByTokenUrl, token).pipe(
            map((response: Response) => response.json()));
    }

    setUserPassword(passwords) {
        return this.http.post(this._setPasswordUrl, passwords).pipe(
            map((response: Response) => response.json()));
    }
}
