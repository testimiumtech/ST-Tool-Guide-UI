import { Component, OnInit, signal, ChangeDetectionStrategy, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PrerequisiteService } from '../../services/prerequisite.service';

@Component({
  selector: 'app-testing-properties',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './testing-properties.html',
  styleUrl: './testing-properties.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestingPropertiesComponent implements OnInit {
  prerequisites = signal<any[]>([]);
  isLoading = signal(true);
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private prerequisiteService: PrerequisiteService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.prerequisiteService.getTestingProperties()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.prerequisites.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading Testing Properties:', err);
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
