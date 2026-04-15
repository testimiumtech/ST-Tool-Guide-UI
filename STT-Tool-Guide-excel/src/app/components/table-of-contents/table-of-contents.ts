import { Component, Input, OnDestroy, OnInit, Signal, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { TocSyncService } from '../../services/toc-sync.service';
import { TOCItem } from '../../services/toc-sync.service';

@Component({
  selector: 'app-table-of-contents',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-of-contents.html',
  styleUrl: './table-of-contents.scss',
})
export class TableOfContentsComponent implements OnInit {
  @Input() scrollContainer: HTMLElement | null = null;
  activeSection = signal('');
  private scrollListenerAttachedTo: HTMLElement | Window | null = null;
  private readonly handleScroll = () => {
    const items = this.tocService.items();
    if (items.length === 0) return;

    let currentSection = items[0].id;

    for (const item of items) {
      const element = document.getElementById(item.id);
      if (!element) continue;

      const rect = element.getBoundingClientRect();
      if (rect.top >= 0 && rect.top <= 200) {
        currentSection = item.id;
        break;
      }
    }

    this.activeSection.set(currentSection);
  };

  // Track if we're on the home page
  isHomePage: Signal<boolean>;

  constructor(readonly tocService: TocSyncService, private router: Router) {
    this.isHomePage = toSignal(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.router.url === '/')
      ),
      { initialValue: this.router.url === '/' }
    ) as Signal<boolean>;

    // Update active section based on scroll position
    effect(() => {
      this.tocService.items();
      this.setupScrollListener();
    });

    // React to route changes and update content container
    effect(() => {
      if (this.isHomePage()) {
        // Clear TOC on home page
        this.tocService.setContentContainer(null);
        this.activeSection.set('');
      } else {
        // Delay to ensure content is rendered
        setTimeout(() => this.updateContentContainer(), 200);
      }
    });
  }

  ngOnInit(): void {
    // Initial content container setup
    this.updateContentContainer();
  }

  ngOnDestroy(): void {
    this.teardownScrollListener();
  }

  private updateContentContainer(): void {
    let attempts = 0;
    const maxAttempts = 20; // Try for up to 2 seconds (20 * 100ms)
    
    const tryFind = () => {
      attempts++;
      const contentContainer = this.scrollContainer?.querySelector('.command-content-wrapper')
        ?? document.querySelector('.command-content-wrapper');
      
      if (contentContainer) {
        this.tocService.setContentContainer(contentContainer as HTMLElement);
        this.handleScroll();
        return; // Success, stop trying
      }
      
      if (attempts < maxAttempts) {
        setTimeout(tryFind, 100);
      }
    };
    
    // Start trying immediately
    setTimeout(tryFind, 0);
  }

  private setupScrollListener(): void {
    const nextTarget = this.scrollContainer ?? window;
    if (this.scrollListenerAttachedTo === nextTarget) {
      return;
    }

    this.teardownScrollListener();
    nextTarget.addEventListener('scroll', this.handleScroll, { passive: true });
    this.scrollListenerAttachedTo = nextTarget;
    this.handleScroll();
  }

  scrollToSection(sectionId: string, event: Event): void {
    event.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      const scrollContainer = this.scrollContainer;
      if (scrollContainer) {
        const elementTop = element.getBoundingClientRect().top;
        const containerTop = scrollContainer.getBoundingClientRect().top;
        const offset = elementTop - containerTop + scrollContainer.scrollTop - 24; // 24px offset for header margin
        scrollContainer.scrollTo({ top: offset, behavior: 'smooth' });
      } else {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      this.activeSection.set(sectionId);
    }
  }

  private teardownScrollListener(): void {
    this.scrollListenerAttachedTo?.removeEventListener('scroll', this.handleScroll);
    this.scrollListenerAttachedTo = null;
  }

  get items() {
    return this.tocService.items;
  }

  trackByTocItem(index: number, item: TOCItem): string {
    return `${index}-${item.id}`;
  }
}
