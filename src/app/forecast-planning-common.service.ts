import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable,  } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '@env/environment';
import { UserService } from './shared/services/user.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
    'Authorization': '' + localStorage.getItem('token')
  })
};

@Injectable({
  providedIn: 'root'
})
export class ForecastPlanningCommonService {

  constructor(
    private http: HttpClient,
    private userService: UserService
  ) { }

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

  getForecastPlanningForToday(project_id) {
    return this.get(`/api/fc-planning/getPlanning/${project_id}`);
  }

  getForecastPlanning(project_id, date) {
    return this.get(`/api/fc-planning/getPlanning/${project_id}/${date}`);
  }

  getForecastOptionsAndTurbines(project_id, windfarmName) {
    return this.get(`/api/fc-planning/getPlanningSettingsAndTurbines/${project_id}/${windfarmName}`);
  }
}
