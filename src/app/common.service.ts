
import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';   
import { Http, Response, Headers, RequestOptions } from '@angular/http';   
   
import { Observable } from 'rxjs';  
  
  
  
@Injectable()  
export class CommonService {  
  
  constructor(private http: Http) { }  
  
  saveVessel(vessel){      
    return this.http.post('http://localhost:8080/api/SaveVessel/', vessel).pipe(  
            map((response: Response) =>response.json()))              
  }  
  
  GetVessel(){       
    return this.http.get('http://localhost:8080/api/getVessel/').pipe(  
            map((response: Response) => response.json()))              
  }

  GetLatLon(){       
    return this.http.get('http://localhost:8080/api/getLatLon/').pipe(  
            map((response: Response) => response.json()))              
  }  
 
}
