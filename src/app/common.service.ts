import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable,  } from 'rxjs';
import { AisMarkerModel } from './layout/dashboard/dashboard.component';
import { VesselModel, VesselOperationsClass } from './models/vesselModel';
import { VesselObjectModel } from './supportModules/mocked.common.service';
import { UserModel } from './models/userModel';
import { CampaignModel } from './layout/TWA/models/campaignModel';
import { MissedDcTransfer, Vessel2vesselModel } from './layout/reports/dpr/sov/models/Transfers/vessel2vessel/Vessel2vessel';
import { V2vCtvActivity } from './layout/reports/dpr/sov/models/Transfers/vessel2vessel/V2vCtvActivity';
import { ForecastOperation, ForecastResponseObject, MetoceanProvider } from './layout/forecast/models/forecast-response.model';
import { RawWaveData } from './models/wavedataModel';
import { storedSettings } from './supportModules/settings.service';
import { ForecastVesselRequest } from './layout/forecast/forecast-project/forecast-project.component';
import { TwaSaveFleetModel } from './layout/TWA/models/requests';
import { UsermanagementVesselModel } from './layout/usermanagement/usermanagement.component';
import { UserService } from './shared/services/user.service';
import { CTVDprInputModel } from './layout/reports/dpr/ctv/ctvreport/ctvreport.component';
import { CtvConsumptionWidgetModel } from './layout/reports/dpr/ctv/ctv-summary/widgets/ctv-summary-consumption/ctv-summary-consumption.component';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
    'Authorization': '' + localStorage.getItem('token')
  })
};

@Injectable({
  providedIn: 'root',
})
export class CommonService {

  constructor(
    private http: HttpClient,
    private userService: UserService
  ) {
  }

  get(url: string): Observable<any> {
    return this.http.get(environment.DB_IP + url, httpOptions).pipe(
      catchError(this.getServerErrorMessage)
    );
  }
  post(url: string, data: any): Observable<any> {
    return this.http.post(environment.DB_IP + url, data, httpOptions).pipe(
      catchError(this.getServerErrorMessage)
    );
  }
  put(url: string, data: any): Observable<any> {
    return this.http.put(environment.DB_IP + url, data, httpOptions).pipe(
      catchError(this.getServerErrorMessage)
    );
  }
  private async getServerErrorMessage(error: HttpErrorResponse, caugth: any) {
    switch (error.status) {
      case 460: {
        this.userService.logout();
      }
      default: {
        throw error;
      }
    }
  }


  // ============= Administrative functions =============
  getAdministrativeConnectionTest() {
    return this.get('/api/mo4admin/connectionTest');
  }
  getActiveConnections(): Observable<any> {
    return this.get('/api/getActiveConnections/');
  }
  sendFeedback(feedback: {message: string, page: string}) {
    return this.post('/api/sendFeedback/', feedback);
  }
  validatePermissionToViewData(vessel: { mmsi: number}): Observable<VesselModel[]> {
    return this.post('/api/validatePermissionToViewData/', vessel);
  }
  updateAuthorizationToken(token: string) {
    const oldHeaders = httpOptions.headers;
    const newHeaders = oldHeaders.set('Authorization', token);
    httpOptions.headers = newHeaders;
  }
  getCompanies(): Observable<Client[]> {
    return this.get('/api/getCompanies/');
  }
  getClientList() {
    return this.get('/api/getClients');
  }


  // ============= User management =============
  getUserByUsername(username: string): Observable<UserModel[]> {
    return this.post('/api/getUserByUsername/', {username});
  }
  getUsers(): Observable<UserModel[]> {
    return this.get('/api/getUsers/');
  }
  loadUserSettings(): Observable<storedSettings> {
    return this.get('/api/loadUserSettings');
  }
  saveUserSettings(settings: storedSettings): Observable<any> {
    return this.post('/api/saveUserSettings/', settings);
  }
  checkUserActive(username: string) {
    return this.get('/api/checkUserActive/' + username);
  }
  updateUserPermissions(user) {
    return this.post('/api/updateUserPermissions/', user);
  }
  resetPassword(username: string) {
    return this.post('/api/resetPassword/', {username});
  }
  setActive(user: {username: string}) {
    return this.post('/api/setUserActive/', user);
  }
  setInactive(user: {username: string}) {
    return this.post('/api/setUserInactive/', user);
  }
  getVessel(): Observable<VesselModel[]> {
    return this.get('/api/getVessel/');
  }
  getVesselsForClientByUser(username: string): Observable<UsermanagementVesselModel[]>  {
    return this.get('/api/getVesselsForClientByUser/'+ username);
  }
  getVesselNameAndIDById(info: {vessel_ids: number[]}): Observable<{vessel_id: number, nicename: string}[]> {
    return this.post('/api/getVesselNameAndIDById', info);
  }
  saveUserVessels(username: string, vessel_ids: number[]): Observable<{data: string}> {
    return this.post('/api/saveUserVessels/', {username, vessel_ids});
  }


  // ============= CTV DPR =============
  getLatestGeneral(): Observable<{_id: number, date: number, vesselname: string}[]> {
    // For both CTV and SOV!
    return this.get('/api/getLatestGeneral/');
  }
  getTransitsForSov(mmsi: number, date: number) {
    return this.get('/api/getTransitsForSov/' + mmsi + '/' + date);
  }
  saveCTVGeneralStats(generalStats: Object) {
    return this.post('/api/saveCTVGeneralStats/', generalStats);
  }
  saveVideoRequest(transfer) {
    return this.post('/api/saveVideoRequest/', transfer);
  }
  getVideoBudgetByMmsi(vessel: VesselObjectModel) {
    return this.post('/api/getVideoBudgetByMmsi/', {mmsi: vessel.mmsi});
  }
  getGeneral(vessel: VesselObjectModel) {
    return this.post('/api/getGeneral/', vessel);
  }
  getPlatformTransfers(mmsi: number, date: number) {
    return this.get('/api/getPlatformTransfers/' + mmsi + '/' + date);
  }
  getTransfersForVesselByRangeForCTV(vessel: StatsRangeRequest): Observable<any[]> {
    return this.post('/api/getTransfersForVesselByRangeForCTV/', vessel);
  }
  getCtvInputsByRange(vessel: StatsRangeRequest): Observable<any[]> {
    return this.post('/api/getCtvInputsByRange/', vessel);
  }
  getTurbineTransfers(mmsi: number, date: number) {
    return this.get('/api/getTurbineTransfers/' + mmsi + '/' + date);
  }
  getEnginedata(mmsi: number, date: number) {
    return this.get('/api/getEnginedata/' + mmsi + '/' + date);
  }
  saveTransfer(transfer) {
    return this.post('/api/saveTransfer/', transfer);
  }
  getDistinctFieldnames(transferdata: {mmsi: number, date: number}) {
    return this.post('/api/getDistinctFieldnames/', transferdata);
  }
  getTransfersForVessel(mmsi: number, date: number): Observable<any[]> {
    return this.get('/api/getTransfersForVessel/' + mmsi + '/' + date);
  }
  getDatesWithValues(vessel: VesselObjectModel) {
    return this.post('/api/getDatesWithValues/', vessel);
  }
  getDatesWithValuesFromGeneralStats(vessel: VesselObjectModel) {
    return this.post('/api/getHasSailedDatesCTV/', vessel);
  }
  getCommentsForVessel(vessel: VesselObjectModel) {
    return this.post('/api/getCommentsForVessel/', vessel);
  }
  getCtvDprInput(mmsi: number, date: number): Observable<CTVDprInputModel> {
    return this.post('/api/getCtvDprInput', { mmsi, date });
  }
  updateCtvDprInputConsumption(mmsi: number, date: number, data: CtvConsumptionWidgetModel): Observable<CTVDprInputModel> {
    return this.post('/api/updateCtvDprInputConsumption', { mmsi, date, data })
  }


  // ============= SOV DPR =============
  getSov(vessel: VesselObjectModel) {
    return this.get('/api/getSov/' + vessel.mmsi + '/' + vessel.date);
  }
  getVessel2vesselsForSov(mmsi: number, date: number): Observable<Vessel2vesselModel[]> {
    return this.get('/api/getVessel2vesselForSov/' + mmsi + '/' + date).pipe(
      map((v2vs: any[]) => {
        v2vs.forEach(v2v => {
          if (!Array.isArray(v2v.transfers)) {
            v2v.transfers = [v2v.transfers];
          }
          if (!Array.isArray(v2v.CTVactivity)) {
            v2v.CTVactivity = [v2v.CTVactivity];
          }
        });
        return v2vs;
      })
    );
  }
  getSovDistinctFieldnames(vesselObject: VesselObjectModel) {
    return this.get('/api/getSovDistinctFieldnames/' + vesselObject.mmsi + '/' + vesselObject.date);
  }
  getSovRovOperations(mmsi: number, date: number) {
    return this.get('/api/getSovRovOperations/' + mmsi + '/' + date);
  }
  getCycleTimesForSov(mmsi: number, date: number) {
    return this.get('/api/getCycleTimesForSov/' + mmsi + '/' + date);
  }
  getSovInfo(vessel: VesselObjectModel) {
    return this.post('/api/getSovInfo/', vessel);
  }
  getVideoRequests(vessel: VesselObjectModel) {
    return this.post('/api/getVideoRequests/', vessel);
  }
  getDatesShipHasSailedForSov(vessel: VesselObjectModel) {
    return this.get('/api/getDatesShipHasSailedForSov/' + vessel.mmsi);
  }
  getDatesWithTransfersForSOV(vessel: VesselObjectModel) {
    return this.get('/api/getDatesWithTransferForSov/' + vessel.mmsi);
  }

  getSovDprInput(vessel: VesselObjectModel) {
    return this.post('/api/getSovDprInput/', vessel);
  }
  saveFuelStatsSovDpr(sovfuelstats) {
    return this.post('/api/saveFuelStatsSovDpr/', sovfuelstats);
  }
  saveIncidentDpr(sovincidentstats) {
    return this.post('/api/saveIncidentDpr/', sovincidentstats);
  }
  updateSOVTurbinePaxInput(transfer) {
    return this.post('/api/updateSOVTurbinePaxInput/', transfer);
  }
  updateSOVPlatformPaxInput(transfer) {
    return this.post('/api/updateSOVPlatformPaxInput/', transfer);
  }
  updateSOVv2vPaxInput(transfer) {
    return this.post('/api/updateSOVv2vPaxInput/', transfer);
  }
  updateSovRovOperations(rovOperations: RovOperationsSaveModel) {
    return this.post('/api/updateSovRovOperations/', rovOperations);
  }
  updateSOVv2vTurbineTransfers(ctvInfo: {
    update: V2vCtvActivity;
    missedTransfers: MissedDcTransfer[];
    mmsi: number;
    date: number;
  }) {
    return this.post('/api/updateSOVv2vTurbineTransfers', ctvInfo);
  }
  saveNonAvailabilityDpr(sovnonavailabilitystats) {
    return this.post('/api/saveNonAvailabilityDpr/', sovnonavailabilitystats);
  }
  saveWeatherDowntimeDpr(weatherdowntime) {
    return this.post('/api/saveWeatherDowntimeDpr/', weatherdowntime);
  }
  saveStandByDpr(weatherdowntime) {
    return this.post('/api/saveStandByDpr/', weatherdowntime);
  }
  saveAccessDayType(status: {accessDayType: string}) {
    return this.post('/api/saveAccessDayType/', status);
  }
  saveCateringStats(sovcateringstats) {
    return this.post('/api/saveCateringStats/', sovcateringstats);
  }
  saveDPStats(dpstats) {
    return this.post('/api/saveDPStats/', dpstats);
  }
  saveMissedPaxCargo(missedpaxcargo) {
    return this.post('/api/saveMissedPaxCargo/', missedpaxcargo);
  }
  saveHelicopterPaxCargo(helicopterpaxcargo) {
    return this.post('/api/saveHelicopterPaxCargo/', helicopterpaxcargo);
  }
  saveRemarksStats(sovremarks) {
    return this.post('/api/saveRemarksStats/', sovremarks);
  }
  saveDprSigningSkipper(dataObject: SovDprSignOrRefuseModel) {
    return this.post('/api/saveDprSigningSkipper/', dataObject);
  }
  saveDprSigningClient(dataObject: SovDprSignOrRefuseModel) {
    return this.post('/api/saveDprSigningClient/', dataObject);
  }
  requestFullAccount() {
    return this.get('/api/requestFullAccount/');
  }


  getSovHseDprInput(vessel: VesselObjectModel) {
    return this.post('/api/getSovHseDprInput/', vessel);
  }
  updateDprFieldsSOVHseDpr(dataObject) {
    return this.post('/api/updateDprFieldsSOVHseDpr/', dataObject);
  }
  updateSOVHseDpr(dataObject) {
    return this.post('/api/updateSOVHseDpr/', dataObject);
  }
  saveHseDprSigningSkipper(dataObject: SovDprSignOrRefuseModel) {
    return this.post('/api/saveHseDprSigningSkipper/', dataObject);
  }
  saveHseDprSigningClient(dataObject: SovDprSignOrRefuseModel) {
    return this.post('/api/saveHseDprSigningClient/', dataObject);
  }
  declineHseDprClient(dataObject: SovDprSignOrRefuseModel) {
    return this.post('/api/declineHseDprClient/', dataObject);
  }
  saveQHSERemark(dataObject) {
    return this.post('/api/saveQHSERemark/', dataObject);
  }
  declineDprClient(dataObject: SovDprSignOrRefuseModel) {
    return this.post('/api/declineDprClient/', dataObject);
  }
  getSovWaveSpectrumAvailable(vessel: {date:  number, mmsi: number}) {
    return this.post('/api/getSovWaveSpectrumAvailable', vessel);
  }
  getSovWaveSpectrum(vessel: {date:  number, mmsi: number}) {
    return this.post('/api/getSovWaveSpectrum', vessel);
  }


  // ============= TWA =============
  getLatestTwaUpdate(): Observable<number> {
    return this.get('/api/getLatestTwaUpdate/').pipe(
      map((response: any) => {
        const res = response;
        return res.lastUpdate;
      })
    );
  }
  getTurbineWarranty() {
    return this.get('/api/getTurbineWarranty/');
  }
  getTurbineWarrantyForCompany(client: {client: string}): Observable<CampaignModel[]> {
    return this.post('/api/getTurbineWarrantyForCompany/', client);
  }
  getTurbineWarrantyOne(warrenty) {
    return this.post('/api/getTurbineWarrantyOne/', warrenty);
  }
  setSaildays(warrenty) {
    return this.post('/api/setSaildays/', warrenty);
  }
  addVesselToFleet(vessel) {
    return this.post('/api/addVesselToFleet/', vessel);
  }
  getActiveListingsForFleet(fleetID: string, client: string, stopDate: number) {
    return this.get('/api/getActiveListingsForFleet/' + fleetID + '/' + client + '/' + stopDate);
  }
  getAllActiveListingsForFleet(fleetID: string) {
    return this.get('/api/getAllActiveListingsForFleet/' + fleetID);
  }
  setActiveListings(_listings: {listings: any, client: string, fleetID: string, stopDate: number}) {
    return this.post('/api/setActiveListings/', _listings);
  }
  getVesselsToAddToFleet(fleet) {
    return this.post('/api/getVesselsToAddToFleet/', fleet);
  }
  saveFleetRequest(request: TwaSaveFleetModel): Observable<any> {
    return this.post('/api/saveFleetRequest', request);
  }


  // ============= Locations =============
  getParkByNiceName(park: string): Observable<{
    centroid: {lon: number, lat: number, radius: number},
    SiteName: string,
    name: string[]
  } | undefined> {
    return this.get('/api/getParkByNiceName/' + park).pipe(
      map(response => response[0]));
  }
  getParkLocations() {
    return this.get('/api/getParkLocations');
  }
  getPlatformLocations(src_name: string) {
    // ToDo: replace hardcoded platforms filename with dynamic links when more than 1 source becomes available
    return this.post('/api/getPlatformLocations/', {Name: 'Northsea_offshore_oilgas_platform_coordinates'});
  }
  getHarbourLocations() {
    return this.get('/api/getHarbourLocations/');
  }
  getForecastProjectLocations(): Observable<{lon: number, lat: number, nicename: string, id: number}[]> {
    return this.get('/api/forecastProjectLocations')
  }
  getLatestBoatLocation(): Observable<AisMarkerModel[]> {
    return this.get('/api/getLatestBoatLocation/');
  }
  getSpecificPark(park: {park: string[]}) {
    return this.post('/api/getSpecificPark/', park);
  }


  // ============= Wavedata =============
  getFieldsWithWaveSourcesByCompany(): Observable<{_id: string, site: string, name: string}[]> {
    return this.get('/api/getFieldsWithWaveSourcesByCompany');
  }
  getWavedataForDay(request: {
    date: number,
    site: string,
  }): Observable<Array<{wavedata: RawWaveData}>> {// Observable<WavedataModel> {
    return this.post('/api/getWavedataForDay', request).pipe(
      map(response => {
        if (response?.status === 204) {
          return null;
        } else {
          return response; // new WavedataModel(response);
        }
      }));
  }
  getWavedataForRange(request: {
    startDate: number,
    stopDate: number,
    source: string,
  }): Observable<Array<{wavedata: RawWaveData}>> {// = Observable<RawWaveData[]> {
    return this.post('/api/getWavedataForRange', request).pipe(
      map(response => {
        return response; // .map( wavedata => new WavedataModel(wavedata));
      }));
  }


  // ============= Longterm =============
  getGeneralForRange(request: {
    startDate: number,
    stopDate: number,
    mmsi: number | number[],
    vesselType: 'CTV' | 'SOV' | 'OSV',
    projection?: any,
  }): Observable<any[]> {
    return this.post('/api/getGeneralForRange', request);
  }
  getEngineStatsForRange(request: StatsRangeRequest): Observable<any> {
    return this.post('/api/getEnginesForVesselByRange', request);
  }
  getTransfersForVesselByRange(vessel: StatsRangeRequest) {
    return this.post('/api/getTransfersForVesselByRange/', vessel);
  }
  getTransitsForVesselByRange(vessel: StatsRangeRequest): Observable<any[]> {
    return this.post('/api/getTransitsForVesselByRange/', vessel);
  }
  getTurbineTransfersForVesselByRangeForSOV(vessel: StatsRangeRequest): Observable<any[]> {
    return this.post('/api/getTurbineTransfersForVesselByRangeForSOV/', vessel);
  }
  getPlatformTransfersForVesselByRangeForSOV(vessel: StatsRangeRequest): Observable<any[]> {
    return this.post('/api/getPlatformTransfersForVesselByRangeForSOV/', vessel);
  }
  getGeneralForVesselByRangeForSOV(vessel: StatsRangeRequest): Observable<any[]> {
    return this.post('/api/getGeneralForVesselByRangeForSOV/', vessel);
  }
  getTransitsForVesselByRangeForSOV(vessel: StatsRangeRequest): Observable<any[]> {
    return this.post('/api/getTransitsForVesselByRangeForSOV/', vessel);
  }
  getVessel2vesselsByRangeForSov(vessel: StatsRangeRequest): Observable<any[]> {
    return this.post('/api/getVessel2vesselsByRangeForSov/', vessel);
  }
  getPortcallsByRange(vessel: StatsRangeRequest): Observable<any[]> {
    return this.post('/api/getPortcallsByRange/', vessel);
  }
  getDprInputsByRange(vessel: StatsRangeRequest): Observable<any[]> {
    return this.post('/api/getDprInputsByRange/', vessel);
  }


  // ============= Forecast =============
  getForecastConnectionTest() {
    return this.get('/api/mo4light/connectionTest');
  }
  getForecastProjectList(): Observable<ForecastOperation[]> {
    return this.get('/api/mo4light/getProjectList');
  }
  getForecastProjectByName(project_name: string): Observable<ForecastOperation[]> {
    return this.post('/api/mo4light/getProject', {project_name});
  }
  getForecastVesselList(): Observable<ForecastVesselRequest[]> {
    return this.get('/api/mo4light/getVesselList');
  }
  getForecastClientList() {
    // Depricated
    return this.get('/api/mo4light/getClients');
  }
  getForecastWorkabilityForProject(project_id: number): Observable<ForecastResponseObject> {
    return this.get('/api/mo4light/getResponseForProject/' + project_id);
  }
  getForecastProjectsForClient(client_id: number) {
    return this.get('/api/mo4light/getProjectsForClient/' + client_id);
  }
  getForecastWeatherForResponse(id: number): Observable<{weather: RawWaveData, spectrum: any}> {
    return this.post('/api/mo4light/weather', {
      response_id: id
    });
  }
  saveForecastProjectSettings(project: ForecastOperation): Observable<{data: string}> {
    return this.put('/api/mo4light/projectSettings', {
      project_name: project.name,
      project_settings: {
        display_name: project.nicename,
        latitude: project.latitude,
        longitude: project.longitude,
        water_depth: project.water_depth,
        vessel_id: project.vessel_id,
        client_preferences: project.client_preferences,
        maximum_duration: project.maximum_duration,
        analysis_types: project.analysis_types,
        metocean_provider: project.metocean_provider,
      }
    });
  }
  getCtvForecast() {
    return this.get('/api/mo4light/ctvForecast')
  }

  getForecastMetoceanProviders(): Observable<MetoceanProvider[]> {
    return this.get('/api/mo4light/metoceanProviders')
  }
}

export interface StatsRangeRequest {
  mmsi: number[];
  dateMin: number;
  dateMax: number;
  reqFields: string[];
}
export interface RovOperationsSaveModel {
  mmsi: number;
  date: number;
  rovOperations?: Object[];
}
export interface SovDprSignOrRefuseModel {
  mmsi: number;
  date: number;
  dateString: string;
  vesselName: string;
  feedback?: string;
}
 export interface Client {
  client_id: number;
  client_name: string;
  client_permissions: ClientPermission;
  client_children: number[];
 }
 interface ClientPermission {
 }
