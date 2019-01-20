import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
// import { RequestOptions } from '@angular/http';

@Injectable({
  providedIn: 'root'
})
export class BackendServiceService {

  URL = '/api/programming-assessment-1.0/buildings';
  
  constructor(private httpClient: HttpClient) {

  }

  getData(): Observable<any> {
    return this.httpClient.get(this.URL);
  }

}
