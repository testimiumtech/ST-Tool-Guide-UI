import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchModalComponent } from './search-modal';
import { ApiService } from '../../services/api.service';
import { of } from 'rxjs';

describe('SearchModalComponent', () => {
  let component: SearchModalComponent;
  let fixture: ComponentFixture<SearchModalComponent>;
  let apiService: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getCommands']);

    await TestBed.configureTestingModule({
      imports: [SearchModalComponent],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy }
      ]
    }).compileComponents();

    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    apiService.getCommands.and.returnValue(of({ commands: [] }));

    fixture = TestBed.createComponent(SearchModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter commands based on search query', () => {
    component.commands.set([
      {
        command_id: '1',
        category: 'Test',
        is_new: false,
        order: 1,
        title: 'Test Command',
        description: 'A test command',
        keywords: [],
        purpose: '',
        syntax: '',
        detailed_usage: null,
        options: [],
        use_cases: '',
        examples: [],
        when_to_use: ''
      },
      {
        command_id: '2',
        category: 'Other',
        is_new: false,
        order: 2,
        title: 'Other Command',
        description: 'Another command',
        keywords: [],
        purpose: '',
        syntax: '',
        detailed_usage: null,
        options: [],
        use_cases: '',
        examples: [],
        when_to_use: ''
      }
    ]);

    component.searchQuery.set('test');
    expect(component.filteredCommands().length).toBe(1);
    expect(component.filteredCommands()[0].title).toBe('Test Command');
  });
});
