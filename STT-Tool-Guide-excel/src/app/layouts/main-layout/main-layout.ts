import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from '../../components/header/header';
import { SidebarNavComponent } from '../../components/sidebar-nav/sidebar-nav';
import { TableOfContentsComponent } from '../../components/table-of-contents/table-of-contents';
import { SearchModalComponent } from '../../components/search-modal/search-modal';
import { ReadingProgressComponent } from '../../components/reading-progress/reading-progress';
import { ApiService } from '../../services/api.service';
import { CommandPage } from '../../models/command-page.model';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    SidebarNavComponent,
    TableOfContentsComponent,
    SearchModalComponent,
    ReadingProgressComponent,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  searchModalOpen = signal(false);
  commands = signal<CommandPage[]>([]);
  mainScrollElement = signal<HTMLElement | null>(null);
  isHomePage = signal(true);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  @ViewChild('mainScrollContainerRef') private mainScrollContainerRef?: ElementRef<HTMLElement>;

  constructor(private apiService: ApiService) {
    this.isHomePage.set(this.router.url === '/');

    this.apiService.getCommands()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        this.commands.set(data.commands);
      });

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event: NavigationEnd) => {
        this.isHomePage.set(event.urlAfterRedirects === '/');
        this.mainScrollElement()?.scrollTo({ top: 0, behavior: 'auto' });
      });
  }

  ngAfterViewInit(): void {
    this.mainScrollElement.set(this.mainScrollContainerRef?.nativeElement ?? null);
  }
}
