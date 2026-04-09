import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocatorPrerequisitesComponent } from './locator-prerequisites';
import { PrerequisiteService } from '../../services/prerequisite.service';
import { of } from 'rxjs';

describe('LocatorPrerequisitesComponent', () => {
  let component: LocatorPrerequisitesComponent;
  let fixture: ComponentFixture<LocatorPrerequisitesComponent>;
  let mockPrerequisiteService: jasmine.SpyObj<PrerequisiteService>;

  beforeEach(async () => {
    mockPrerequisiteService = jasmine.createSpyObj('PrerequisiteService', [
      'getLocatorPrerequisites',
    ]);

    await TestBed.configureTestingModule({
      imports: [LocatorPrerequisitesComponent],
      providers: [
        {
          provide: PrerequisiteService,
          useValue: mockPrerequisiteService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LocatorPrerequisitesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load prerequisites on init', () => {
    const mockData = [
      {
        title: 'What is a Locator?',
        items: [{ description: 'Test description' }],
      },
    ];
    mockPrerequisiteService.getLocatorPrerequisites.and.returnValue(of(mockData));

    fixture.detectChanges();

    expect(component.prerequisites()).toEqual(mockData);
    expect(component.isLoading()).toBe(false);
  });
});
