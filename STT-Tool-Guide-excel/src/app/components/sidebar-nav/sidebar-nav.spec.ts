import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarNavComponent } from './sidebar-nav';

describe('SidebarNavComponent', () => {
  let component: SidebarNavComponent;
  let fixture: ComponentFixture<SidebarNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarNavComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should group commands by category', () => {
    fixture.componentRef.setInput('commands', [
      {
        command_id: '1',
        category: 'Browser',
        is_new: false,
        order: 1,
        title: 'Test Command',
        description: 'A test',
        keywords: [],
        purpose: '',
        syntax: '',
        detailed_usage: { label: '', desc: '', cmd: '' },
        options: [],
        use_cases: '',
        example: '',
        when_to_use: ''
      }
    ]);
    fixture.detectChanges();
    const categories = component.groupedCategories();
    expect(categories.length).toBeGreaterThan(0);
  });

  it('should toggle category expansion', () => {
    fixture.componentRef.setInput('commands', [
      {
        command_id: '1',
        category: 'Browser',
        is_new: false,
        order: 1,
        title: 'Test Command',
        description: 'A test',
        keywords: [],
        purpose: '',
        syntax: '',
        detailed_usage: { label: '', desc: '', cmd: '' },
        options: [],
        use_cases: '',
        example: '',
        when_to_use: ''
      }
    ]);
    fixture.detectChanges();

    // Force initial grouped computation to initialize expanded state
    component.groupedCategories();
    expect(component.expandedCategories['Browser']).toBe(true);

    component.toggleCategory('Browser');
    expect(component.expandedCategories['Browser']).toBe(false);
  });
});
