import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HtmlPrerequisitesComponent } from './html-prerequisites';
import { PrerequisiteService } from '../../services/prerequisite.service';
import { of } from 'rxjs';

describe('HtmlPrerequisitesComponent', () => {
  let component: HtmlPrerequisitesComponent;
  let fixture: ComponentFixture<HtmlPrerequisitesComponent>;
  let mockPrerequisiteService: jasmine.SpyObj<PrerequisiteService>;

  beforeEach(async () => {
    mockPrerequisiteService = jasmine.createSpyObj('PrerequisiteService', [
      'getHtmlPrerequisites',
    ]);

    await TestBed.configureTestingModule({
      imports: [HtmlPrerequisitesComponent],
      providers: [
        {
          provide: PrerequisiteService,
          useValue: mockPrerequisiteService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HtmlPrerequisitesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load prerequisites on init', () => {
    const mockData = [
      {
        title: 'HTML Basics',
        items: [{ subTitle: 'HTML Tags', description: 'Test description' }],
      },
    ];
    mockPrerequisiteService.getHtmlPrerequisites.and.returnValue(of(mockData));

    fixture.detectChanges();

    expect(component.prerequisites()).toEqual(mockData);
    expect(component.isLoading()).toBe(false);
  });
});
