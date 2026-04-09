import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrerequisiteLayoutComponent } from './prerequisite-layout';
import { ApiService } from '../../services/api.service';
import { of } from 'rxjs';

describe('PrerequisiteLayoutComponent', () => {
  let component: PrerequisiteLayoutComponent;
  let fixture: ComponentFixture<PrerequisiteLayoutComponent>;
  let mockApiService: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    mockApiService = jasmine.createSpyObj('ApiService', ['getCommands']);
    mockApiService.getCommands.and.returnValue(of({ commands: [] }));

    await TestBed.configureTestingModule({
      imports: [PrerequisiteLayoutComponent],
      providers: [
        {
          provide: ApiService,
          useValue: mockApiService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PrerequisiteLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with closed search modal', () => {
    expect(component.searchModalOpen()).toBe(false);
  });

  it('should toggle search modal', () => {
    component.searchModalOpen.set(true);
    expect(component.searchModalOpen()).toBe(true);
  });
});
