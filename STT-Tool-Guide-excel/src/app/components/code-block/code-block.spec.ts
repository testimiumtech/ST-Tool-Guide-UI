import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CodeBlockComponent } from './code-block';

describe('CodeBlockComponent', () => {
  let component: CodeBlockComponent;
  let fixture: ComponentFixture<CodeBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeBlockComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CodeBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the provided code', () => {
    component.code = 'console.log("test")';
    fixture.detectChanges();
    const codeElement = fixture.nativeElement.querySelector('code');
    expect(codeElement.textContent).toContain('console.log("test")');
  });

  it('should display the provided language', () => {
    component.language = 'javascript';
    fixture.detectChanges();
    const languageLabel = fixture.nativeElement.querySelector('.language-label');
    expect(languageLabel.textContent).toContain('javascript');
  });
});
