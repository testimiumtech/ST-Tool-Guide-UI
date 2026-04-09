import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OptionItem } from '../../models/command-page.model';

@Component({
  selector: 'app-command-options-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './command-options-table.html',
  styleUrl: './command-options-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandOptionsTableComponent {
  @Input() options: readonly OptionItem[] = [];

  trackByOption(index: number, option: OptionItem): string {
    return `${index}-${option.label}`;
  }
}
