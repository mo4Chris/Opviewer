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

  getSov(mmsi: number, date: number) {
    return this.get(environment.DB_IP + '/api/getSov/' + mmsi + '/' + date).pipe(
      map((response: Response) => response.json()));
  }

  getTransitsForSov(mmsi: number, date: number) {
    return this.get(environment.DB_IP + '/api/getTransitsForSov/' + mmsi + '/' + date).pipe(
      map((response: Response) => response.json()));
  }

  getVessel2vesselsForSov(mmsi: number, date: number) {
    return this.get(environment.DB_IP + '/api/getVessel2vesselForSov/' + mmsi + '/' + date).pipe(
      map((response: Response) => response.json()));
  }

  getCycleTimesForSov(mmsi: number, date: number) {
    return this.get(environment.DB_IP + '/api/getCycleTimesForSov/' + mmsi + '/' + date).pipe(
      map((response: Response) => response.json()));
  }

  getPlatformTransfers(mmsi: number, date: number) {
    return this.get(environment.DB_IP + '/api/getPlatformTransfers/' + mmsi + '/' + date).pipe(
      map((response: Response) => response.json()));
  }

  getTurbineTransfers(mmsi: number, date: number) {
    return this.get(environment.DB_IP + '/api/getTurbineTransfers/' + mmsi + '/' + date).pipe(
      map((response: Response) => response.json()));
  }

  getVesselsForCompany(client: { client: string, notHired?: number}[]) {
    return this.post(environment.DB_IP + '/api/getVesselsForCompany/', client).pipe(
      map((response: Response) => response.json()));
  }

  getCompanies() {
    return this.get(environment.DB_IP + '/api/getCompanies/').pipe(
      map((response: Response) => response.json()));
  }

  getHarbourLocations() {
    return this.get(environment.DB_IP + '/api/getHarbourLocations/').pipe(
      map((response: Response) => response.json()));
  }

  getDistinctFieldnames(transferdata: {mmsi: number, date: number}) {
    return this.post(environment.DB_IP + '/api/getDistinctFieldnames/', transferdata).pipe(
      map((response: Response) => response.json()));
  }

  getSovDistinctFieldnames(mmsi: number, date: number) {
    return this.get(environment.DB_IP + '/api/getSovDistinctFieldnames/' + mmsi + '/' + date).pipe(
      map((response: Response) => response.json()));
  }

  getLatestBoatLocation() {
    return this.get(environment.DB_IP + '/api/getLatestBoatLocation/').pipe(
      map((response: Response) => response.json()));
  }

  getSpecificPark(park: {park: string[]}) {
    return this.post(environment.DB_IP + '/api/getSpecificPark/', park).pipe(
      map((response: Response) => response.json()));
  }

  getParkLocations() {
    return this.get(environment.DB_IP + '/api/getParkLocations').pipe(
      map((response: Response) => response.json()));
  }

  getParkLocationForCompany(company: string) {
    company = company.replace(' ', '--_--');
    return this.get(environment.DB_IP + '/api/getParkLocationForCompany/' + company).pipe(
      map((response: Response) => response.json()));
  }

  getPlatformLocations(src_name: string) {
    // ToDo: replace hardcoded platforms filename with dynamic links when more than 1 source becomes available
    return this.post(environment.DB_IP + '/api/getPlatformLocations/', {Name: 'Northsea_offshore_oilgas_platform_coordinates'}).pipe(
      map((response: Response) => response.json()));
  }

  getLatestBoatLocationForCompany(company: string) {
    return this.get(environment.DB_IP + '/api/getLatestBoatLocationForCompany/' + company).pipe(
      map((response: Response) => response.json()));
  }

  getTransfersForVessel(mmsi: number, date: number) {
    return this.get(environment.DB_IP + '/api/getTransfersForVessel/' + mmsi + '/' + date).pipe(
      map((response: Response) => response.json()));
  }

  getTransfersForVesselByRange(vessel: {mmsi: number[], dateMin: number, dateMax: number, x: string | number, y: string | number}) {
    return this.post(environment.DB_IP + '/api/getTransfersForVesselByRange/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getTransitsForVesselByRange(vessel: {mmsi: number[], dateMin: number, dateMax: number, x: string | number, y: string | number}) {
    return this.post(environment.DB_IP + '/api/getTransitsForVesselByRange/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getTurbineTransfersForVesselByRangeForSOV(vessel: {mmsi: number[], dateMin: number, dateMax: number, x: string | number, y: string | number}) {
    return this.post(environment.DB_IP + '/api/getTurbineTransfersForVesselByRangeForSOV/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getPlatformTransfersForVesselByRangeForSOV(vessel: {mmsi: number[], dateMin: number, dateMax: number, x: string | number, y: string | number}) {
    return this.post(environment.DB_IP + '/api/getPlatformTransfersForVesselByRangeForSOV/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getTransitsForVesselByRangeForSOV(vessel: {mmsi: number[], dateMin: number, dateMax: number, x: string | number, y: string | number}) {
    return this.post(environment.DB_IP + '/api/getTransitsForVesselByRangeForSOV/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getCrewRouteForBoat(vessel: { date: number, mmsi: number, dateNormal: Date, vesselType: string }) {
    return this.post(environment.DB_IP + '/api/getCrewRouteForBoat/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getTransitsRouteForBoat(vessel: { date: number, mmsi: number, dateNormal: Date, vesselType: string }) {
    return this.post(environment.DB_IP + '/api/getTransitsRouteForBoat/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getDatesWithValues(vessel: { date: number, mmsi: number, dateNormal: Date, vesselType: string }) {
    return this.post(environment.DB_IP + '/api/getDatesWithValues/', vessel).pipe(
     map((response: Response) => response.json()));
  }

  getDatesWithValuesFromGeneralStats(vessel: { date: number, mmsi: number, dateNormal: Date, vesselType: string }) {
    return this.post(environment.DB_IP + '/api/getHasSailedDatesCTV/', vessel).pipe(
       map((response: Response) => response.json()));
  }

  getDatesShipHasSailedForSov(mmsi: number) {
    return this.get(environment.DB_IP + '/api/getDatesShipHasSailedForSov/' + mmsi).pipe(
      map((response: Response) => response.json()));
  }

  getDatesWithTransfersForSOV(mmsi: number) {
    return this.get(environment.DB_IP + '/api/getDatesWithTransferForSov/' + mmsi).pipe(
      map((response: Response) => response.json()));
  }

  getCommentsForVessel(vessel: number) {
    return this.post(environment.DB_IP + '/api/getCommentsForVessel/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getUsers() {
    return this.get(environment.DB_IP + '/api/getUsers/').pipe(
      map((response: Response) => response.json()));
  }

  getUsersForCompany(client: {client: any}[]) {
    return this.post(environment.DB_IP + '/api/getUsersForCompany/', client).pipe(
      map((response: Response) => response.json()));
  }

  getUserByUsername(username: {username: any}) {
    return this.post(environment.DB_IP + '/api/getUserByUsername/', username).pipe(
      map((response: Response) => response.json()));
  }

  getUserClientById(user: any, client: {client: any}) {
    return this.get(environment.DB_IP + '/api/getUserClientById/' + user + '/' + client).pipe(
      map((response: Response) => response.json()));
  }

  saveUserBoats(user) {
    return this.post(environment.DB_IP + '/api/saveUserBoats/', user).pipe(
      map((response: Response) => response.json()));
  }

  sendFeedback(feedback: {message: string, page: string, person: any}) {
    return this.post(environment.DB_IP + '/api/sendFeedback/', feedback).pipe(
      map((response: Response) => response.json()));
  }

  get(url: string) {
    const headers = new Headers();
    this.createAuthorizationHeader(headers);
    return this.http.get(url, {
      headers: headers
    });
  }

  post(url: string, data: any) {
    const headers = new Headers();
    this.createAuthorizationHeader(headers);
    return this.http.post(url, data, {
      headers: headers
    });
  }

  createAuthorizationHeader(headers: Headers) {
    headers.append('authorization', localStorage.getItem('token'));
  }

  validatePermissionToViewData(vessel: { mmsi: number}) {
    return this.post(environment.DB_IP + '/api/validatePermissionToViewData/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  resetPassword(user) {
    return this.post(environment.DB_IP + '/api/resetPassword/', user).pipe(
      map((response: Response) => response.json()));
  }

  getVideoRequests(vessel: { date: number, mmsi: number, dateNormal: Date, vesselType: string }) {
    return this.post(environment.DB_IP + '/api/getVideoRequests/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  saveVideoRequest(transfer) {
    return this.post(environment.DB_IP + '/api/saveVideoRequest/', transfer).pipe(
      map((response: Response) => response.json()));
  }

  getVideoBudgetByMmsi(mmsi: {mmsi: number}) {
    return this.post(environment.DB_IP + '/api/getVideoBudgetByMmsi/', mmsi).pipe(
      map((response: Response) => response.json()));
  }

  getGeneral(vessel: { date: number, mmsi: number, dateNormal: Date, vesselType: string }) {
    return this.post(environment.DB_IP + '/api/getGeneral/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getTurbineWarranty() {
    return this.get(environment.DB_IP + '/api/getTurbineWarranty/').pipe(
      map((response: Response) => response.json()));
  }

  getTurbineWarrantyForCompany(client: {client: string}) {
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

  saveCTVGeneralStats(generalStats: {date: number, mmsi: number, fuelConsumption: number, landedOil: number, landedGarbage: number, hseReports: string, toolboxConducted: any[], customInput: string}) {
    return this.post(environment.DB_IP + '/api/saveCTVGeneralStats/', generalStats).pipe(
      map((response: Response) => response.json()));
  }

  addVesselToFleet(vessel) {
    return this.post(environment.DB_IP + '/api/addVesselToFleet/', vessel).pipe(
      map((response: Response) => response.json()));
  }

  getActiveListingsForFleet(fleetID: string, client: string, stopDate: number) {
    return this.get(environment.DB_IP + '/api/getActiveListingsForFleet/' + fleetID + '/' + client + '/' + stopDate).pipe(
      map((response: Response) => response.json()));
  }

  getAllActiveListingsForFleet(fleetID: string) {
    return this.get(environment.DB_IP + '/api/getAllActiveListingsForFleet/' + fleetID).pipe(
      map((response: Response) => response.json()));
  }

  setActiveListings(listings: {listings: any, client: string, fleetID: string, stopDate: number}) {
    return this.post(environment.DB_IP + '/api/setActiveListings/', listings).pipe(
      map((response: Response) => response.json()));
  }

  getVesselsToAddToFleet(fleet) {
    console.log(fleet);
    return this.post(environment.DB_IP + '/api/getVesselsToAddToFleet/', fleet).pipe(
      map((response: Response) => response.json()));
  }

  get2faExistence(user: {userEmail: any}) {
    return this.post(environment.DB_IP + '/api/get2faExistence', user).pipe(
      map((response: Response) => response.json()));
  }

  saveFleetRequest(request: {
    boats: any[],
    client: string,
    windfield: string,
    startDate: { year: null, month: null, day: null },
    stopDate: { year: null, month: null, day: null },
    numContractedVessels: number,
    campaignName: string,
    weatherDayTarget: null,
    weatherDayTargetType: string,
    jsTime: { startDate: number, stopDate: number },
    validFields: any[],
    limitHs: null,
    requestTime: null
}) {
    return this.post(environment.DB_IP + '/api/saveFleetRequest', request).pipe(
      map((response: Response) => response.json()));
  }
}

