import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest, map } from 'rxjs';
import { CodeBlockComponent } from '../code-block/code-block';
import { CommandSectionComponent } from '../command-section/command-section';
import { CommandMetadataComponent } from '../command-metadata/command-metadata';
import { CommandOptionsTableComponent } from '../command-options-table/command-options-table';
import { ApiService } from '../../services/api.service';
import { CommandPage as CommandPageModel } from '../../models/command-page.model';

@Component({
  selector: 'app-command-page',
  standalone: true,
  imports: [
    CommonModule,
    CodeBlockComponent,
    CommandSectionComponent,
    CommandMetadataComponent,
    CommandOptionsTableComponent,
  ],
  templateUrl: './command-page.html',
  styleUrl: './command-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly apiService = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  command: CommandPageModel | null = null;
  previousCommand: CommandPageModel | null = null;
  nextCommand: CommandPageModel | null = null;
  allCommands: CommandPageModel[] = [];
  notFound: boolean = false;

  ngOnInit(): void {
    combineLatest([this.apiService.getCommands(), this.route.paramMap])
      .pipe(
        map(([data, params]) => ({
          commands: data.commands,
          commandId: params.get('id'),
        })),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ commands, commandId }) => {
        this.allCommands = commands;
        if (commandId) {
          this.loadCommand(commandId);
          this.cdr.markForCheck();
          return;
        }
        this.command = null;
        this.previousCommand = null;
        this.nextCommand = null;
        this.notFound = false;
        this.cdr.markForCheck();
      });
  }
  private loadCommand(id: string): void {
    const normalizedId = this.normalizeReference(id);
    const index = this.allCommands.findIndex((cmd) => {
      const commandId = this.normalizeReference(cmd.command_id);
      const commandTitle = this.normalizeReference(cmd.title);
      return commandId === normalizedId || commandTitle === normalizedId;
    });
    if (index !== -1) {
      this.command = this.allCommands[index];
      this.previousCommand = index > 0 ? this.allCommands[index - 1] : null;
      this.nextCommand = index < this.allCommands.length - 1 ? this.allCommands[index + 1] : null;
      this.notFound = false;
      this.cdr.markForCheck();
      return;
    }
    this.command = null;
    this.previousCommand = null;
    this.nextCommand = null;
    this.notFound = true;
    this.cdr.markForCheck();
  }

  navigateTo(commandId: string): void {
    const resolvedCommand = this.resolveCommand(commandId);
    const targetId = resolvedCommand?.command_id ?? commandId;
    this.router.navigate(['/cmd', this.normalizeReference(targetId)]);
  }

  trackByRelatedCommand(index: number, relatedId: string): string {
    return `${index}-${relatedId}`;
  }

  trackByExampleIndex(index: number): number {
    return index;
  }

  trackByCommandLine(index: number, line: string): string {
    return `${index}-${line}`;
  }

  trackByDescriptionLine(index: number, line: string): string {
    return `${index}-${line}`;
  }

  trackByOutputLine(index: number, line: string): string {
    return `${index}-${line}`;
  }

  trackByParamLabel(index: number, param: { label: string }): string {
    return `${index}-${param.label}`;
  }

  splitLines(text: string | null | undefined): string[] {
    if (!text) return [];
    return text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }

  formatJson(obj: Record<string, unknown> | null): string {
    if (!obj) return '';
    return JSON.stringify(obj, null, 2);
  }

  private resolveCommand(reference: string): CommandPageModel | null {
    const normalizedReference = this.normalizeReference(reference);
    const command = this.allCommands.find((item) => {
      const commandId = this.normalizeReference(item.command_id);
      const title = this.normalizeReference(item.title);
      return commandId === normalizedReference || title === normalizedReference;
    });
    return command ?? null;
  }

  private normalizeReference(value: string | null | undefined): string {
    const raw = (value ?? '').trim();
    if (!raw) return '';

    // Convert PascalCase/camelCase into dash-case BEFORE lowercasing
    const withWordBoundaries = raw
      .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2');

    return withWordBoundaries
      .replace(/[\s_]+/g, '-')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
