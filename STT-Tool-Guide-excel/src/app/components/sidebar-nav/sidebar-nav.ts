import { Component, computed, input, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommandPage } from '../../models/command-page.model';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

interface NavItem {
  label: string;
  id: string;
  isNew: boolean;
  order: number;
  orderKey?: string;
}

interface CategoryGroup {
  name: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar-nav.html',
  styleUrl: './sidebar-nav.scss',
})
export class SidebarNavComponent {
  readonly commands = input<CommandPage[]>([]);

  expandedCategories: { [key: string]: boolean } = {};

  // Track if we're on the home page
  isHomePage: Signal<boolean>;

  constructor(private router: Router) {
    this.isHomePage = toSignal(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.router.url === '/')
      ),
      { initialValue: this.router.url === '/' }
    ) as Signal<boolean>;
  }

  groupedCategories = computed(() => {
    const cmds = this.commands();

    // Group commands by category
    const groups: { [key: string]: NavItem[] } = {};

    cmds.forEach((cmd) => {
      const category = cmd.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push({
        label: cmd.title,
        id: cmd.command_id,
        isNew: cmd.is_new,
        order: cmd.order,
        orderKey: cmd.order_key,
      });
    });

    // Convert to sorted array and set initial expanded state
    const result = Object.entries(groups)
      .map(([name, items]) => ({
        name,
        items: items.sort((a, b) => {
          const orderCompare = this.compareOrderKeys(a.orderKey || String(a.order), b.orderKey || String(b.order));
          if (orderCompare !== 0) return orderCompare;
          return a.label.localeCompare(b.label);
        }),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // Initialize expanded state if not exists
    result.forEach((category) => {
      if (!(category.name in this.expandedCategories)) {
        this.expandedCategories[category.name] = true; // Default to expanded
      }
    });

    return result;
  });

  toggleCategory(categoryName: string): void {
    this.expandedCategories[categoryName] = !this.expandedCategories[categoryName];
  }

  trackByCategory(index: number, category: CategoryGroup): string {
    return `${index}-${category.name}`;
  }

  trackByNavItem(index: number, item: NavItem): string {
    return `${index}-${item.id}`;
  }

  private compareOrderKeys(a: string, b: string): number {
    const segA = (a || '0').split('.').map(n => Number(n) || 0);
    const segB = (b || '0').split('.').map(n => Number(n) || 0);
    const maxLen = Math.max(segA.length, segB.length);

    for (let i = 0; i < maxLen; i++) {
      const nA = segA[i] ?? -1;
      const nB = segB[i] ?? -1;
      if (nA !== nB) return nA - nB;
    }

    return 0;
  }
}
