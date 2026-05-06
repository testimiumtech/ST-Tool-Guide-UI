import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainLayoutComponent } from './main-layout';
import { ApiService } from '../../services/api.service';
import { of } from 'rxjs';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;
  let apiService: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getCommands']);

    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy }
      ]
    }).compileComponents();

    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    apiService.getCommands.and.returnValue(
      of({
        commands: [
          {
            command_id: 'test',
            category: 'Test',
            is_new: false,
            order: 1,
            title: 'Test Command',
            description: 'A test',
            keywords: [],
            purpose: '',
            syntax: '',
            detailed_usage: null,
            options: [],
            use_cases: '',
            examples: [],
            when_to_use: ''
          }
        ]
      })
    );

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load commands on init', () => {
    expect(apiService.getCommands).toHaveBeenCalled();
  });

  it('should toggle search modal', () => {
    expect(component.searchModalOpen()).toBe(false);
    component.searchModalOpen.set(true);
    expect(component.searchModalOpen()).toBe(true);
  });
});
