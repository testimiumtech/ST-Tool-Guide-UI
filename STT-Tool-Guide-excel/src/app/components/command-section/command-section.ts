import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-command-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './command-section.html',
  styleUrl: './command-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandSectionComponent {
  @Input({ required: true }) sectionId = '';
  @Input({ required: true }) title = '';
  @Input({ required: true }) iconPath = '';
}
