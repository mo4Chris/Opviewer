import { Injectable } from '@angular/core';   
import { Http, Response, Headers, RequestOptions } from '@angular/http';   
   
import { Observable } from 'rxjs/Observable';  
import 'rxjs/add/operator/map';  
import 'rxjs/add/operator/do';  
  
@Injectable()  
export class CommonService {  
  
  constructor(private http: Http) { }  
  
  saveVessel(vessel){      
    return this.http.post('http://localhost:8080/api/SaveVessel/', vessel)  
            .map((response: Response) =>response.json())              
  }  
  
  GetVessel(){       
    return this.http.get('http://localhost:8080/api/getVessel/')  
            .map((response: Response) => response.json())              
  }  
 
}
