import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';
import { CommandPage } from '../models/command-page.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private commandsCache$?: Observable<{ commands: CommandPage[] }>;

  constructor(private http: HttpClient) {}

  getCommands(): Observable<{ commands: CommandPage[] }> {
    if (!this.commandsCache$) {
      this.commandsCache$ = this.loadCommandsJson().pipe(shareReplay(1));
    }

    return this.commandsCache$;
  }

  getCommandById(id: string): Observable<CommandPage | undefined> {
    return this.getCommands().pipe(
      map((data) => data.commands.find((cmd) => cmd.command_id === id)),
      catchError((error) => {
        console.error('Error loading command:', error);
        return of(undefined);
      })
    );
  }

  private loadCommandsJson(): Observable<{ commands: CommandPage[] }> {
    return this.http.get<{ commands: CommandPage[] }>('/data/commands.json').pipe(
      map((data) => ({
        commands: [...(data.commands || [])].sort((a, b) => a.order - b.order)
      })),
      catchError((error) => {
        console.error('Failed to load commands.json:', error);
        return of({ commands: [] });
      })
    );
  }
}
