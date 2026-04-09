import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { CommandPage } from '../models/command-page.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {}

  getCommands(): Observable<{ commands: CommandPage[] }> {
    // Load from JSON file (reliable and fast)
    // JSON is the primary source, generated from XLSX
    return this.http.get<{ commands: CommandPage[] }>('/data/commands.json').pipe(
      catchError((error) => {
        console.error('Failed to load commands from JSON:', error);
        return of({ commands: [] });
      })
    );
  }

  getCommandById(id: string): Observable<CommandPage | undefined> {
    return new Observable((observer) => {
      this.getCommands().subscribe({
        next: (data) => {
          const command = data.commands.find((cmd) => cmd.command_id === id);
          observer.next(command);
          observer.complete();
        },
        error: (error) => {
          console.error('Error loading command:', error);
          observer.next(undefined);
          observer.complete();
        }
      });
    });
  }
}
