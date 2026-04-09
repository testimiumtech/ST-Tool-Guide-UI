import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-command-metadata',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './command-metadata.html',
  styleUrl: './command-metadata.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandMetadataComponent {
  @Input() isNew = false;
  @Input() category = '';
  @Input() lastUpdated = '';
  @Input() keywords: readonly string[] = [];

  trackByKeyword(index: number, keyword: string): string {
    return `${index}-${keyword}`;
  }
}
