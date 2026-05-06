import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { of } from 'rxjs';
import { TableOfContentsComponent } from './table-of-contents';
import { TOCItem, TocSyncService } from '../../services/toc-sync.service';

class MockTocSyncService {
  private readonly tocItems = signal<TOCItem[]>([
    { label: 'Purpose', id: 'purpose', level: 1 },
    { label: 'Example', id: 'examples', level: 1 },
  ]);

  readonly items = this.tocItems.asReadonly();

  setContentContainer(): void {}
}

describe('TableOfContentsComponent', () => {
  let component: TableOfContentsComponent;
  let fixture: ComponentFixture<TableOfContentsComponent>;

  beforeEach(async () => {
    const routerStub = {
      url: '/cmd/test',
      events: of(new NavigationEnd(1, '/cmd/test', '/cmd/test')),
    };

    await TestBed.configureTestingModule({
      imports: [TableOfContentsComponent],
      providers: [
        { provide: TocSyncService, useClass: MockTocSyncService },
        { provide: Router, useValue: routerStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TableOfContentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose toc items from the TocSyncService', () => {
    expect(component.items().length).toBe(2);
    expect(component.items()[0].label).toBe('Purpose');
  });
});
