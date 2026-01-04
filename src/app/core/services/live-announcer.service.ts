import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class LiveAnnouncerService {
  private readonly platformId = inject(PLATFORM_ID);
  private liveRegion: HTMLElement | null = null;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.createLiveRegion();
    }
  }

  announce(message: string, politeness: 'polite' | 'assertive' = 'polite'): void {
    if (!this.liveRegion) return;

    // Update politeness
    this.liveRegion.setAttribute('aria-live', politeness);

    // Clear and set message (needs to change for screen reader to re-announce)
    this.liveRegion.textContent = '';

    // Use setTimeout to ensure the DOM update is processed
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = message;
      }
    }, 100);
  }

  private createLiveRegion(): void {
    // Check if already exists
    const existing = document.getElementById('live-announcer');
    if (existing) {
      this.liveRegion = existing;
      return;
    }

    // Create live region element
    this.liveRegion = document.createElement('div');
    this.liveRegion.id = 'live-announcer';
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.setAttribute('role', 'status');
    this.liveRegion.className = 'sr-only';

    // Style to hide visually but keep accessible
    this.liveRegion.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `;

    document.body.appendChild(this.liveRegion);
  }
}
