import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AccessibilityPanelComponent } from './components/accessibility-panel/accessibility-panel.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [AccessibilityPanelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="main-content" class="settings p-6 max-w-3xl mx-auto">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Settings
        </h1>
        <p class="text-gray-600">
          Customise your dashboard experience
        </p>
      </header>

      <app-accessibility-panel />
    </main>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
})
export class SettingsComponent {}
