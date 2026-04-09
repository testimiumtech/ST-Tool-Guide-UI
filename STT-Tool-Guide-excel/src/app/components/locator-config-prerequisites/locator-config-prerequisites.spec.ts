import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocatorConfigPrerequisitesComponent } from './locator-config-prerequisites';
import { PrerequisiteService } from '../../services/prerequisite.service';
import { of } from 'rxjs';

describe('LocatorConfigPrerequisitesComponent', () => {
  let component: LocatorConfigPrerequisitesComponent;
  let fixture: ComponentFixture<LocatorConfigPrerequisitesComponent>;
  let mockPrerequisiteService: jasmine.SpyObj<PrerequisiteService>;

  beforeEach(async () => {
    mockPrerequisiteService = jasmine.createSpyObj('PrerequisiteService', [
      'getLocatorConfigPrerequisites',
    ]);

    await TestBed.configureTestingModule({
      imports: [LocatorConfigPrerequisitesComponent],
      providers: [
        {
          provide: PrerequisiteService,
          useValue: mockPrerequisiteService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LocatorConfigPrerequisitesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load configuration data on init', () => {
    const mockData = {
      title: 'What is Property Key?',
      description: 'A Property Key is...',
      steps: [
        {
          title: 'Step 1',
          description: 'Do this',
        },
      ],
    };
    mockPrerequisiteService.getLocatorConfigPrerequisites.and.returnValue(
      of(mockData)
    );

    fixture.detectChanges();

    expect(component.configData()).toEqual(mockData);
    expect(component.isLoading()).toBe(false);
  });
});
