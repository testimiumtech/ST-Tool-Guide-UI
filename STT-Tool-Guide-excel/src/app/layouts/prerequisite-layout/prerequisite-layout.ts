import { Component, signal, ChangeDetectionStrategy, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HeaderComponent } from '../../components/header/header';
import { SearchModalComponent } from '../../components/search-modal/search-modal';
import { ApiService } from '../../services/api.service';
import { CommandPage } from '../../models/command-page.model';

@Component({
  selector: 'app-prerequisite-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    SearchModalComponent,
  ],
  templateUrl: './prerequisite-layout.html',
  styleUrl: './prerequisite-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrerequisiteLayoutComponent {
  searchModalOpen = signal(false);
  commands = signal<CommandPage[]>([]);
  private readonly destroyRef = inject(DestroyRef);

  constructor(private apiService: ApiService) {
    this.apiService.getCommands()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        this.commands.set(data.commands);
      });
  }
}
