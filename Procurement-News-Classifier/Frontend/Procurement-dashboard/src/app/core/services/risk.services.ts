import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Risk } from '../models/risk';

@Injectable({
  providedIn: 'root'
})
export class RiskService {

  private apiUrl = 'http://127.0.0.1:8000/api/risks';
  private analyzeUrl = 'http://127.0.0.1:8000/api/analyze-news';
  private recentUrl = 'http://127.0.0.1:8000/api/recent-risks';
  private newsUrl = 'http://127.0.0.1:8000/api/news';

  constructor(private http: HttpClient) {}

  // All risks from entire history
  getRisks(): Observable<Risk[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  // All news from entire history
  getAllNews(): Observable<Risk[]> {
    return this.http.get<any>(this.newsUrl).pipe(
      map(response => response.data)
    );
  }

  // Risks filtered by last N days
  getRecentRisks(days: number = 7): Observable<Risk[]> {
    return this.http.get<any>(`${this.recentUrl}?days=${days}`).pipe(
      map(response => response.data)
    );
  }

  analyzeNews(text: string): Observable<any> {
    return this.http.post<any>(this.analyzeUrl, { text });
  }

}