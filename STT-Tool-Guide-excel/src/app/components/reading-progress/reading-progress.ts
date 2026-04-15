import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reading-progress',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="reading-progress-bar" [style.width.%]="progress"></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReadingProgressComponent implements OnInit, OnDestroy {
  @Input() scrollContainer: HTMLElement | null = null;
  progress = 0;
  private scrollHandler = () => this.updateProgress();
  private boundTarget: HTMLElement | Window | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['scrollContainer']) {
      this.bindScrollTarget();
    }
  }

  ngOnDestroy(): void {
    this.unbindScrollTarget();
  }

  ngOnInit(): void {
    this.bindScrollTarget();
  }

  private updateProgress(): void {
    const el = this.scrollContainer ?? document.documentElement;
    const scrollTop = this.scrollContainer ? el.scrollTop : window.scrollY;
    const scrollHeight = el.scrollHeight - el.clientHeight;
    this.progress = scrollHeight > 0 ? Math.min((scrollTop / scrollHeight) * 100, 100) : 0;
    this.cdr.markForCheck();
  }

  private bindScrollTarget(): void {
    this.unbindScrollTarget();
    this.boundTarget = this.scrollContainer ?? window;
    this.boundTarget.addEventListener('scroll', this.scrollHandler, { passive: true });
    this.updateProgress();
  }

  private unbindScrollTarget(): void {
    this.boundTarget?.removeEventListener('scroll', this.scrollHandler);
    this.boundTarget = null;
  }
}
