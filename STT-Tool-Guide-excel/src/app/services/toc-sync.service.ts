import { Injectable, signal, effect } from '@angular/core';

export interface TOCItem {
  label: string;
  id: string;
  level: number;
}

@Injectable({
  providedIn: 'root'
})
export class TocSyncService {
  private tocItems = signal<TOCItem[]>([]);
  readonly items = this.tocItems.asReadonly();
  private contentContainer: HTMLElement | null = null;
  private observer: MutationObserver | null = null;

  constructor() {
    // Effect to auto-update TOC when observable content changes
    effect(() => {
      // This will re-run whenever needed
      this.updateTOC();
    });
  }

  setContentContainer(container: HTMLElement | null): void {
    // Clean up previous observer
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    this.contentContainer = container;
    
    if (container) {
      this.setupObserver();
      this.updateTOC();
    } else {
      this.tocItems.set([]);
    }
  }

  private setupObserver(): void {
    if (!this.contentContainer) return;

    // Use MutationObserver to watch for content changes
    this.observer = new MutationObserver(() => {
      this.updateTOC();
    });

    this.observer.observe(this.contentContainer, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['id'],
    });
  }

  private updateTOC(): void {
    if (!this.contentContainer) {
      this.tocItems.set([]);
      return;
    }

    // Find all heading elements within the content container
    const headings = Array.from(
      this.contentContainer.querySelectorAll('h2, h3, h4')
    ) as HTMLElement[];

    const items: TOCItem[] = headings
      .map((heading, index) => {
        // Assign IDs if not present
        if (!heading.id) {
          const text = heading.textContent || '';
          heading.id = text
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);
        }

        const level = parseInt(heading.tagName[1], 10);
        const label = (heading.dataset['tocLabel'] || heading.textContent || '').trim();

        return {
          label,
          id: heading.id,
          level: level - 1, // h2 = level 1, h3 = level 2, etc.
        };
      })
      .filter((item) => item.label.trim().length > 0);
    this.tocItems.set(items);
  }

  forceUpdate(): void {
    this.updateTOC();
  }
}
