import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { environment } from '../environments/environment';

@Injectable()
export class CommonService {

  constructor(private http: Http) { }

  saveVessel(vessel) {
    return this.post(environment.DB_IP + '/api/saveVessel/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  saveTransfer(transfer) {
    return this.post(environment.DB_IP + '/api/saveTransfer/', transfer).pipe(
      map((response: Response) => response.json()));
  }

  getVessel() {
    return this.get(environment.DB_IP + '/api/getVessel/').pipe(
      map((response: Response) => response.json()));
  }

  getSov(mmsi, date) {
    return this.get(environment.DB_IP + '/api/getSov/' + mmsi + '/' + date).pipe(
      map((response: Response) => response.json()));
  }

  getTransitsForSov(mmsi, date) {
    return this.get(environment.DB_IP + '/api/getTransitsForSov/' + mmsi + '/' + date).pipe(
      map((response: Response) => response.json()));
  }

  getVessel2vesselsForSov(mmsi, date) {
    return this.get(environment.DB_IP + '/api/getVessel2vesselForSov/' + mmsi + '/' + date).pipe(
      map((response: Response) => response.json()));
  }

  getCycleTimesForSov(mmsi, date) {
    return this.get(environment.DB_IP + '/api/getCycleTimesForSov/' + mmsi + '/' + date).pipe(
      map((response: Response) => response.json()));
  }

  getPlatformTransfers(mmsi, date) {
    return this.get(environment.DB_IP + '/api/getPlatformTransfers/' + mmsi + '/' + date).pipe(
      map((response: Response) => response.json()));
  }

  getTurbineTransfers(mmsi, date) {
    return this.get(environment.DB_IP + '/api/getTurbineTransfers/' + mmsi + '/' + date).pipe(
      map((response: Response) => response.json()));
  }

  getVesselsForCompany(client) {
    return this.post(environment.DB_IP + '/api/getVesselsForCompany/', client).pipe(
      map((response: Response) => response.json()));
  }

  getCompanies() {
    return this.get(environment.DB_IP + '/api/getCompanies/').pipe(
      map((response: Response) => response.json()));
  }

  getDistinctFieldnames(transferdata) {
    return this.post(environment.DB_IP + '/api/getDistinctFieldnames/', transferdata).pipe(
      map((response: Response) => response.json()));
  }

  getSovDistinctFieldnames(mmsi, date) {
    return this.get(environment.DB_IP + '/api/getSovDistinctFieldnames/' + mmsi + '/' + date).pipe(
      map((response: Response) => response.json()));
  }

  getLatestBoatLocation() {
    return this.get(environment.DB_IP + '/api/getLatestBoatLocation/').pipe(
      map((response: Response) => response.json()));
  }

  getSpecificPark(park) {
    return this.post(environment.DB_IP + '/api/getSpecificPark/', park).pipe(
      map((response: Response) => response.json()));
  }

  getLatestBoatLocationForCompany(company) {
    return this.get(environment.DB_IP + '/api/getLatestBoatLocationForCompany/' + company).pipe(
      map((response: Response) => response.json()));
  }

  getTransfersForVessel(mmsi, date) {
    return this.get(environment.DB_IP + '/api/getTransfersForVessel/' + mmsi + '/' + date).pipe(
      map((response: Response) => response.json()));
  }

  getTransfersForVesselByRange(vessel) {
    return this.post(environment.DB_IP + '/api/getTransfersForVesselByRange/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getRouteForBoat(vessel) {
    return this.post(environment.DB_IP + '/api/getRouteForBoat/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getCrewRouteForBoat(vessel) {
    return this.post(environment.DB_IP + '/api/getCrewRouteForBoat/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getTransitsRouteForBoat(vessel) {
    return this.post(environment.DB_IP + '/api/getTransitsRouteForBoat/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getDatesWithValues(vessel) {
    return this.post(environment.DB_IP + '/api/getDatesWithValues/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getDatesShipHasSailedForSov(mmsi) {
    return this.get(environment.DB_IP + '/api/getDatesShipHasSailedForSov/' + mmsi).pipe(
      map((response: Response) => response.json()));
  }

  getCommentsForVessel(vessel) {
    return this.post(environment.DB_IP + '/api/getCommentsForVessel/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getUsers() {
    return this.get(environment.DB_IP + '/api/getUsers/').pipe(
      map((response: Response) => response.json()));
  }

  getUsersForCompany(client) {
    return this.post(environment.DB_IP + '/api/getUsersForCompany/', client).pipe(
      map((response: Response) => response.json()));
  }

  getUserByUsername(username) {
    return this.post(environment.DB_IP + '/api/getUserByUsername/', username).pipe(
      map((response: Response) => response.json()));
  }

  getUserClientById(user, client) {
    return this.get(environment.DB_IP + '/api/getUserClientById/' + user + '/' + client).pipe(
      map((response: Response) => response.json()));
  }

  saveUserBoats(user) {
    return this.post(environment.DB_IP + '/api/saveUserBoats/', user).pipe(
      map((response: Response) => response.json()));
  }

  sendFeedback(feedback) {
    return this.post(environment.DB_IP + '/api/sendFeedback/', feedback).pipe(
      map((response: Response) => response.json()));
  }

  get(url) {
    const headers = new Headers();
    this.createAuthorizationHeader(headers);
    return this.http.get(url, {
      headers: headers
    });
  }

  post(url, data) {
    const headers = new Headers();
    this.createAuthorizationHeader(headers);
    return this.http.post(url, data, {
      headers: headers
    });
  }

  createAuthorizationHeader(headers: Headers) {
    headers.append('authorization', localStorage.getItem('token'));
  }

  validatePermissionToViewData(vessel) {
    return this.post(environment.DB_IP + '/api/validatePermissionToViewData/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  resetPassword(user) {
    return this.post(environment.DB_IP + '/api/resetPassword/', user).pipe(
      map((response: Response) => response.json()));
  }

  getVideoRequests(vessel) {
    return this.post(environment.DB_IP + '/api/getVideoRequests/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  saveVideoRequest(transfer) {
    return this.post(environment.DB_IP + '/api/saveVideoRequest/', transfer).pipe(
      map((response: Response) => response.json()));
  }

  getVideoBudgetByMmsi(mmsi) {
    return this.post(environment.DB_IP + '/api/getVideoBudgetByMmsi/', mmsi).pipe(
      map((response: Response) => response.json()));
  }

  getGeneral(vessel) {
    return this.post(environment.DB_IP + '/api/getGeneral/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getTurbineWarranty() {
    return this.get(environment.DB_IP + '/api/getTurbineWarranty/').pipe(
      map((response: Response) => response.json()));
  }

  getTurbineWarrantyForCompany(client) {
    return this.post(environment.DB_IP + '/api/getTurbineWarrantyForCompany/', client).pipe(
      map((response: Response) => response.json()));
  }

  getTurbineWarrantyOne(warrenty) {
    return this.post(environment.DB_IP + '/api/getTurbineWarrantyOne/', warrenty).pipe(
      map((response: Response) => response.json()));
  }

  setSaildays(warrenty) {
    return this.post(environment.DB_IP + '/api/setSaildays/', warrenty).pipe(
      map((response: Response) => response.json()));
  }

  addVesselToFleet(vessel) {
    return this.post(environment.DB_IP + '/api/addVesselToFleet/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getActiveListingsForFleet(fleetID, client, stopDate) {
    return this.get(environment.DB_IP + '/api/getActiveListingsForFleet/' + fleetID + '/' + client + '/' + stopDate).pipe(
      map((response: Response) => response.json()));
  }

  getAllActiveListingsForFleet(fleetID) {
    return this.get(environment.DB_IP + '/api/getAllActiveListingsForFleet/' + fleetID).pipe(
      map((response: Response) => response.json()));
  }

  setActiveListings(listings) {
    return this.post(environment.DB_IP + '/api/setActiveListings/', listings).pipe(
      map((response: Response) => response.json()));
  }

  getVesselsToAddToFleet(fleet) {
    return this.post(environment.DB_IP + '/api/getVesselsToAddToFleet/', fleet).pipe(
      map((response: Response) => response.json()));
  }

  get2faExistence(user) {
    return this.post(environment.DB_IP + '/api/get2faExistence', user).pipe(
      map((response: Response) => response.json()));
  }

  saveFleetRequest(request) {
    return this.post(environment.DB_IP + '/api/saveFleetRequest', request).pipe(
      map((response: Response) => response.json()));
  }
}

