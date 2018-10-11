import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Http, Headers, Response } from '@angular/http';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable()
export class AuthService {
    private _loginurl = 'http://' + environment.DB_IP + '/api/login/';
    private _registerurl = 'http://' + environment.DB_IP + '/api/registerUser/';

    constructor(private http: Http, private httpClient: HttpClient) { }

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
}
