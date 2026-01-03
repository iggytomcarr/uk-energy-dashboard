import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { IntensityLevel, INTENSITY_COLORS } from '@core/models/carbon-intensity.models';

@Component({
  selector: 'app-intensity-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-medium text-sm transition-colors"
      [class]="badgeClasses()"
      [style.background-color]="backgroundColor()"
      [attr.aria-label]="ariaLabel()"
      role="status"
    >
      <span
        class="w-3 h-3 rounded-sm flex-shrink-0"
        [class]="patternClass()"
        [style.background-color]="iconColor()"
        aria-hidden="true"
      ></span>
      <span class="font-semibold">{{ value() }}</span>
      <span class="text-xs opacity-80">gCO2/kWh</span>
      <span class="sr-only">{{ level() }}</span>
    </span>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    @media (prefers-contrast: more) {
      span[role="status"] {
        border: 2px solid currentColor;
        font-weight: bold;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      span[role="status"] {
        transition: none;
      }
    }
  `],
})
export class IntensityBadgeComponent {
  readonly value = input.required<number>();
  readonly level = input.required<IntensityLevel>();

  protected readonly backgroundColor = computed(() => {
    const color = INTENSITY_COLORS[this.level()];
    return `${color}20`;
  });

  protected readonly iconColor = computed(() => INTENSITY_COLORS[this.level()]);

  protected readonly badgeClasses = computed(() => {
    const levelClass = this.level().replace(' ', '-');
    return `intensity-${levelClass}`;
  });

  protected readonly patternClass = computed(() => {
    const levelClass = this.level().replace(' ', '-');
    return `intensity-pattern-${levelClass}`;
  });

  protected readonly ariaLabel = computed(
    () => `Carbon intensity is ${this.value()} grams CO2 per kilowatt hour, rated as ${this.level()}`
  );
}
