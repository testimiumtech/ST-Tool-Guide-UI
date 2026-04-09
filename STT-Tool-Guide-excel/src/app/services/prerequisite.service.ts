import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PrerequisiteService {
  constructor(private http: HttpClient) {}

  getExcelPrerequisites(): Observable<any[]> {
    return this.http.get<any[]>('/data/excel-prerequisites.json').pipe(
      catchError((error) => {
        console.error('Failed to load Excel prerequisites:', error);
        return of([]);
      })
    );
  }

  getHtmlPrerequisites(): Observable<any[]> {
    return this.http.get<any[]>('/data/html-prerequisites.json').pipe(
      catchError((error) => {
        console.error('Failed to load HTML prerequisites:', error);
        return of([]);
      })
    );
  }

  getLocatorPrerequisites(): Observable<any[]> {
    return this.http.get<any>('/data/locator-prerequisites.json').pipe(
      // Ensure the result is always an array
      map(data => Array.isArray(data) ? data : Object.values(data)),
      catchError((error) => {
        console.error('Failed to load Locator prerequisites:', error);
        return of([]);
      })
    );
  }

  getLocatorConfigPrerequisites(): Observable<any> {
    return this.http.get<any>('/data/locator-config-prerequisites.json').pipe(
      catchError((error) => {
        console.error('Failed to load Locator Config prerequisites:', error);
        return of({});
      })
    );
  }

  getTestingProperties(): Observable<any[]> {
    return this.http.get<any[]>('/data/testing-properties.json').pipe(
      catchError((error) => {
        console.error('Failed to load Testing Properties:', error);
        return of([]);
      })
    );
  }

  getUserProfileProperties(): Observable<any[]> {
    return this.http.get<any[]>('/data/user-profile.json').pipe(
      catchError((error) => {
        console.error('Failed to load User Profile Properties:', error);
        return of([]);
      })
    );
  }
}
