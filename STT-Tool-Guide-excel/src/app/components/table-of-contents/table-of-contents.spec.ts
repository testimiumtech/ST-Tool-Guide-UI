import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableOfContentsComponent } from './table-of-contents';

describe('TableOfContentsComponent', () => {
  let component: TableOfContentsComponent;
  let fixture: ComponentFixture<TableOfContentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableOfContentsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableOfContentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display toc items', () => {
    expect(component.items().length).toBeGreaterThan(0);
  });

  it('should display default items on initialization', () => {
    const items = component.items();
    expect(items[0].label).toBe('Basic Usage');
  });
});
