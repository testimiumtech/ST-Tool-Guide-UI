import { Component, OnInit, signal, ChangeDetectionStrategy, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PrerequisiteService } from '../../services/prerequisite.service';

@Component({
  selector: 'app-locator-prerequisites',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './locator-prerequisites.html',
  styleUrl: './locator-prerequisites.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocatorPrerequisitesComponent implements OnInit {
  prerequisites = signal<any[]>([]);
  isLoading = signal(true);
  locatorImage = 'https://images.pexels.com/photos/2764993/pexels-photo-2764993.jpeg';
  selectorImage = 'https://images.pexels.com/photos/14553707/pexels-photo-14553707.jpeg';
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private prerequisiteService: PrerequisiteService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.prerequisiteService.getLocatorPrerequisites()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.prerequisites.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading Locator prerequisites:', err);
          this.isLoading.set(false);
        },
      });
  }

  trackBySection(index: number): number {
    return index;
  }

  trackByItem(index: number): number {
    return index;
  }

  goBack(): void {
    this.location.back();
  }
}
