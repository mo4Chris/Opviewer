
import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

import { Observable } from 'rxjs';

@Injectable()
export class CommonService {

  constructor(private http: Http) { }

  loginUser(user) {
    return this.http.post('http://localhost:8080/api/login/', user).pipe(
            map((response: Response) => response.json()));
  }

  registerUser(user) {
    return this.http.post('http://localhost:8080/api/registerUser/', user).pipe(
            map((response: Response) => response.json()));
  }

  saveVessel(vessel) {
    return this.http.post('http://localhost:8080/api/SaveVessel/', vessel).pipe(
            map((response: Response) => response.json()));
  }

  GetVessel() {
    return this.http.get('http://localhost:8080/api/getVessel/').pipe(
            map((response: Response) => response.json()));
  }

  GetVesselsForCompany(client) {
    return this.http.post('http://localhost:8080/api/getVesselsForCompany/', client).pipe(
            map((response: Response) => response.json()));
  }

  GetScatter(test) {
    return this.http.post('http://localhost:8080/api/getScatter/', test).pipe(
            map((response: Response) => response.json()));
  }

  GetCompanies() {
    return this.http.get('http://localhost:8080/api/getCompanies/').pipe(
            map((response: Response) => response.json()));
  }

  GetDistinctFieldnames(transferdata) {
    return this.http.post('http://localhost:8080/api/getDistinctFieldnames/', transferdata).pipe(
            map((response: Response) => response.json()));
  }

  GetLatLon() {
    return this.http.get('http://localhost:8080/api/getLatLon/').pipe(
            map((response: Response) => response.json()));
  }

   GetLatestBoatLocation() {
    return this.http.get('http://localhost:8080/api/getLatestBoatLocation/').pipe(
            map((response: Response) => response.json()));
  }

  GetSpecificPark(park) {
    return this.http.post('http://localhost:8080/api/GetSpecificPark/', park).pipe(
            map((response: Response) => response.json()));
  }

  GetLatestBoatLocationForCompany(company) {
    return this.http.post('http://localhost:8080/api/getLatestBoatLocationForCompany/', company).pipe(
            map((response: Response) => response.json()));
  }

  GetTransfersForVessel (vessel) {
    return this.http.post('http://localhost:8080/api/GetTransfersForVessel/', vessel).pipe(
            map((response: Response) => response.json()));
  }

  getRouteForBoat(vessel) {
    return this.http.post('http://localhost:8080/api/getRouteForBoat/', vessel).pipe(
            map((response: Response) => response.json()));
  }

  getDatesWithValues(vessel) {
    return this.http.post('http://localhost:8080/api/getDatesWithValues/', vessel).pipe(
            map((response: Response) => response.json()));
  }

}

