import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeBlockComponent } from '../code-block/code-block';
import { OptionExample, OptionItem } from '../../models/command-page.model';

@Component({
  selector: 'app-command-options-table',
  standalone: true,
  imports: [CommonModule, CodeBlockComponent],
  templateUrl: './command-options-table.html',
  styleUrl: './command-options-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandOptionsTableComponent {
  @Input() options: readonly OptionItem[] = [];

  trackByOption(index: number, option: OptionItem): string {
    return `${index}-${option.label}`;
  }

  trackByOptionExample(index: number, ex: OptionExample): string {
    return `${index}-${ex.scenario ?? ''}-${ex.command}`;
  }

  splitLines(text: string | null | undefined): string[] {
    if (!text) return [];
    return text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }

  formatJson(obj: Record<string, unknown> | null | undefined): string {
    if (!obj) return '';
    return JSON.stringify(obj, null, 2);
  }
}
