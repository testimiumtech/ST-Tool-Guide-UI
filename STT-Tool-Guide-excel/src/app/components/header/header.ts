import { Component, Output, EventEmitter, signal, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  @Output() searchOpen = new EventEmitter<void>();
  @ViewChild('settingsDropdown') settingsDropdown!: ElementRef;
  settingsOpen = signal(false);

  constructor(readonly themeService: ThemeService) {}

  openSearch(): void {
    this.searchOpen.emit();
  }

  toggleSettings(): void {
    this.settingsOpen.set(!this.settingsOpen());
  }

  closeSettings(): void {
    this.settingsOpen.set(false);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.settingsDropdown && !this.settingsDropdown.nativeElement.contains(event.target as Node)) {
      this.closeSettings();
    }
  }
}
