import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NewsService {

  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  // ---------------------------------
  // Get latest classified news
  // ---------------------------------
  getNews(): Observable<any> {
    return this.http.get(`${this.apiUrl}/news`);
  }

  // ---------------------------------
  // Analyze pasted news
  // ---------------------------------
  analyzeNews(text: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/analyze-news`, {
      text: text
    });
  }

}