import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AuthService {
	private _loginurl = "http://localhost:8080/api/login/";
	private _registerurl = "http://localhost:8080/api/registerUser/";

	constructor(private http: HttpClient){ }

	loginUser(user){
		return this.http.post<any>(this._loginurl, user)
	}

	getToken(){
		return localStorage.getItem('token')
	}

	registerUser(user){
		return this.http.post<any>(this._registerurl, user)
	}

}