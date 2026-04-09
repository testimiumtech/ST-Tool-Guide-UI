import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header';
import { ThemeService } from '../../services/theme.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let themeService: ThemeService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [ThemeService],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    themeService = TestBed.inject(ThemeService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit searchOpen event when openSearch is called', () => {
    spyOn(component.searchOpen, 'emit');
    component.openSearch();
    expect(component.searchOpen.emit).toHaveBeenCalled();
  });

  it('should toggle theme when toggleTheme is called', () => {
    const initialTheme = themeService.theme();
    component.toggleTheme();
    expect(themeService.theme()).not.toBe(initialTheme);
  });
});
