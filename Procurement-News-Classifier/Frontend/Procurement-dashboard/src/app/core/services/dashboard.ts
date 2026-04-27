import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Risk } from '../models/risk';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private api = "http://127.0.0.1:8000";

  constructor(private http: HttpClient) {}

  // Fetch all risk alerts
  getRisks(): Observable<Risk[]> {
    return this.http.get<Risk[]>(`${this.api}/api/risks`);
  }

}