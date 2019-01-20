import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
// import { RequestOptions } from '@angular/http';

@Injectable({
  providedIn: 'root'
})
export class BackendServiceService {

  // TODO rfa: set headers
  // headers = new Headers({'Content-Type': 'application/json'});
  // options = new RequestOptions({headers: this.headers});
  // https://demo.interfacema.de
  URL = '/api/programming-assessment-1.0/buildings';
  // options = new RequestOptions({ headers: this.headers });


  constructor(private httpClient: HttpClient) {

  }

  getData(): Observable<any> {
    return this.httpClient.get(this.URL);
  }

}
