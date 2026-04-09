import { Component, OnInit, signal, effect, Signal } from '@angular/core';
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
  activeSection = signal('');

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
      // Access items to establish dependency
      this.tocService.items();
      // Set up scroll listener
      this.setupScrollListener();
    });

    // React to route changes and update content container
    effect(() => {
      if (this.isHomePage()) {
        // Clear TOC on home page
        this.tocService.setContentContainer(null);
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

  private updateContentContainer(): void {
    let attempts = 0;
    const maxAttempts = 20; // Try for up to 2 seconds (20 * 100ms)
    
    const tryFind = () => {
      attempts++;
      const contentContainer = document.querySelector('.command-content-wrapper');
      console.log(`🔍 TOC: Attempt ${attempts} - Looking for content container...`, contentContainer);
      
      if (contentContainer) {
        const headings = contentContainer.querySelectorAll('h2, h3, h4');
        console.log('📝 TOC: Found headings:', headings.length, headings);
        this.tocService.setContentContainer(contentContainer as HTMLElement);
        return; // Success, stop trying
      }
      
      if (attempts < maxAttempts) {
        console.log(`⏳ TOC: Retrying in 100ms... (${attempts}/${maxAttempts})`);
        setTimeout(tryFind, 100);
      } else {
        console.warn('⚠️ TOC: Content container not found after maximum attempts');
      }
    };
    
    // Start trying immediately
    setTimeout(tryFind, 0);
  }

  private setupScrollListener(): void {
    const handleScroll = () => {
      const items = this.tocService.items();
      if (items.length === 0) return;

      // Find which section is currently in view
      let currentSection = items[0].id;

      for (const item of items) {
        const element = document.getElementById(item.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 200) {
            currentSection = item.id;
            break;
          }
        }
      }

      this.activeSection.set(currentSection);
    };

    // Listen on the main scroll container instead of window
    const scrollContainer = document.querySelector('main.overflow-y-auto') || document.querySelector('main');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    } else {
      window.addEventListener('scroll', handleScroll);
    }
  }

  scrollToSection(sectionId: string, event: Event): void {
    event.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      // Find the main scroll container
      const scrollContainer = document.querySelector('main.overflow-y-auto') || document.querySelector('main');
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

  get items() {
    return this.tocService.items;
  }

  trackByTocItem(index: number, item: TOCItem): string {
    return `${index}-${item.id}`;
  }
}
