import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExcelPrerequisitesComponent } from './excel-prerequisites';
import { PrerequisiteService } from '../../services/prerequisite.service';
import { of } from 'rxjs';

describe('ExcelPrerequisitesComponent', () => {
  let component: ExcelPrerequisitesComponent;
  let fixture: ComponentFixture<ExcelPrerequisitesComponent>;
  let mockPrerequisiteService: jasmine.SpyObj<PrerequisiteService>;

  beforeEach(async () => {
    mockPrerequisiteService = jasmine.createSpyObj('PrerequisiteService', [
      'getExcelPrerequisites',
    ]);

    await TestBed.configureTestingModule({
      imports: [ExcelPrerequisitesComponent],
      providers: [
        {
          provide: PrerequisiteService,
          useValue: mockPrerequisiteService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExcelPrerequisitesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load prerequisites on init', () => {
    const mockData = [
      {
        title: 'Excel Basics',
        items: [{ subTitle: 'Cells', description: 'Test description' }],
      },
    ];
    mockPrerequisiteService.getExcelPrerequisites.and.returnValue(of(mockData));

    fixture.detectChanges();

    expect(component.prerequisites()).toEqual(mockData);
    expect(component.isLoading()).toBe(false);
  });
});
