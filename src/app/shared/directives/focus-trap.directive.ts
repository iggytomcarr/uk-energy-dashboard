import {
  Directive,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  inject,
  output,
} from '@angular/core';

@Directive({
  selector: '[appFocusTrap]',
  standalone: true,
  host: {
    '(keydown)': 'onKeyDown($event)',
  },
})
export class FocusTrapDirective implements AfterViewInit, OnDestroy {
  readonly escapePressed = output<void>();

  private readonly elementRef = inject(ElementRef);
  private previouslyFocusedElement: HTMLElement | null = null;

  ngAfterViewInit(): void {
    // Store the previously focused element to restore focus on destroy
    this.previouslyFocusedElement = document.activeElement as HTMLElement;

    // Focus the first focusable element in the trap
    setTimeout(() => {
      const firstFocusable = this.getFocusableElements()[0];
      if (firstFocusable) {
        firstFocusable.focus();
      }
    });
  }

  ngOnDestroy(): void {
    // Restore focus to the previously focused element
    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.escapePressed.emit();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const focusableElements = this.getFocusableElements();
    if (focusableElements.length === 0) {
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift+Tab: if on first element, wrap to last
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: if on last element, wrap to first
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  private getFocusableElements(): HTMLElement[] {
    const selector = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const elements = this.elementRef.nativeElement.querySelectorAll(selector);
    return Array.from(elements) as HTMLElement[];
  }
}
