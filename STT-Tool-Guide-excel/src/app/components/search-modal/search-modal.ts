import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
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

  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private readonly destroyRef = inject(DestroyRef);

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

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    effect(() => {
      const open = this.isOpen();

      if (!open) {
        this.searchQuery.set('');
        return;
      }

      setTimeout(() => {
        const input = this.searchInput()?.nativeElement;
        if (!input) return;
        input.focus();
        input.select();
      });
    });

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
    this.handleClose();
    this.router.navigate(['/cmd', command.command_id]);
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  handleClose(): void {
    this.searchQuery.set('');
    this.closeModal.emit();
  }
}
