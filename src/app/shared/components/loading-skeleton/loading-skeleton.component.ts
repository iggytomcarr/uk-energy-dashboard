import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="animate-pulse"
      role="status"
      [attr.aria-label]="'Loading ' + type()"
      aria-busy="true"
    >
      @switch (type()) {
        @case ('card') {
          <div class="bg-white rounded-lg shadow-md p-4 border border-gray-100">
            <div class="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div class="h-8 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div class="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        }
        @case ('badge') {
          <div class="h-8 bg-gray-200 rounded-full w-32"></div>
        }
        @case ('chart') {
          <div class="flex items-center gap-6">
            <div class="w-48 h-48 bg-gray-200 rounded-full"></div>
            <div class="flex-1 space-y-2">
              @for (i of [1, 2, 3, 4, 5]; track i) {
                <div class="h-4 bg-gray-200 rounded w-full"></div>
              }
            </div>
          </div>
        }
        @case ('text') {
          <div class="space-y-2">
            <div class="h-4 bg-gray-200 rounded w-full"></div>
            <div class="h-4 bg-gray-200 rounded w-5/6"></div>
            <div class="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        }
        @default {
          <div class="h-20 bg-gray-200 rounded w-full"></div>
        }
      }
      <span class="sr-only">Loading content, please wait...</span>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    @media (prefers-reduced-motion: reduce) {
      .animate-pulse {
        animation: none;
      }

      .bg-gray-200 {
        background-color: #e5e7eb;
        background-image: repeating-linear-gradient(
          45deg,
          transparent,
          transparent 10px,
          rgba(0, 0, 0, 0.05) 10px,
          rgba(0, 0, 0, 0.05) 20px
        );
      }
    }
  `],
})
export class LoadingSkeletonComponent {
  readonly type = input<'card' | 'badge' | 'chart' | 'text' | 'default'>('default');
}
