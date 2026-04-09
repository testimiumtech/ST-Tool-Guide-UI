import { Component, Input, Output, EventEmitter, signal, computed, ChangeDetectionStrategy, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from '../../services/api.service';
import { CommandPage } from '../../models/command-page.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-modal.html',
  styleUrl: './search-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchModalComponent {
  @Input() isOpen = signal(false);
  @Output() closeModal = new EventEmitter<void>();

  searchQuery = signal('');
  commands = signal<CommandPage[]>([]);

  filteredCommands = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return [];
    return this.commands().filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(query) ||
        cmd.description.toLowerCase().includes(query)
    );
  });

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    this.apiService.getCommands()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        this.commands.set(data.commands);
      });
  }

  trackByCommand(index: number, command: CommandPage): string {
    return command.command_id;
  }

  selectCommand(command: CommandPage): void {
    this.closeModal.emit();
    this.router.navigate(['/cmd', command.command_id]);
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }
}
