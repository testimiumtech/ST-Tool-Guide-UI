import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommandPageComponent } from './command-page';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { of } from 'rxjs';

describe('CommandPageComponent', () => {
  let component: CommandPageComponent;
  let fixture: ComponentFixture<CommandPageComponent>;
  let apiService: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getCommands']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CommandPageComponent],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(new Map([['id', 'test']])) }
        }
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
            title: 'Test',
            description: 'Test',
            keywords: [],
            purpose: '',
            syntax: '',
            detailed_usage: { label: '', desc: '', cmd: '' },
            options: [],
            use_cases: '',
            example: '',
            when_to_use: ''
          }
        ]
      })
    );

    fixture = TestBed.createComponent(CommandPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load commands on init', () => {
    fixture.detectChanges();
    expect(apiService.getCommands).toHaveBeenCalled();
  });
});
