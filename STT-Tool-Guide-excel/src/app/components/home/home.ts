import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ScrollRevealDirective],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  trackByFeature(index: number): number {
    return index;
  }

  features = [
    {
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      title: 'Command Reference',
      description: 'Comprehensive documentation for all Selenium-based testing commands with detailed examples and options.',
      link: '/cmd/close-browser-tab',
      linkText: 'Browse Commands'
    },
    {
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      title: 'Prerequisites',
      description: 'Setup guides for Excel integration, HTML locators, and locator configuration for your testing environment.',
      link: '/prerequisites/excel',
      linkText: 'View Prerequisites'
    },
    {
      icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
      title: 'Quick Search',
      description: 'Find commands quickly using the built-in search feature from anywhere in the documentation.',
      link: null,
      linkText: 'Open Search'
    }
  ];
}
