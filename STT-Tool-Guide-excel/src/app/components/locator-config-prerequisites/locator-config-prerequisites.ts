import { Component, OnInit, signal, ChangeDetectionStrategy, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PrerequisiteService } from '../../services/prerequisite.service';

interface Step {
  title: string;
  description: string;
  code?: string;
  imageUrl?: string;
}

interface ConfigData {
  title: string;
  description: string;
  steps: Step[];
}

@Component({
  selector: 'app-locator-config-prerequisites',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './locator-config-prerequisites.html',
  styleUrl: './locator-config-prerequisites.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocatorConfigPrerequisitesComponent implements OnInit {
  configData = signal<ConfigData | null>(null);
  isLoading = signal(true);
  configImage = 'https://images.pexels.com/photos/8293779/pexels-photo-8293779.jpeg';
  settingsImage = 'https://images.pexels.com/photos/3962270/pexels-photo-3962270.jpeg';
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private prerequisiteService: PrerequisiteService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.prerequisiteService.getLocatorConfigPrerequisites()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.configData.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading Locator Config prerequisites:', err);
          this.isLoading.set(false);
        },
      });
  }

  trackByStep(index: number): number {
    return index;
  }

  goBack(): void {
    this.location.back();
  }
}
