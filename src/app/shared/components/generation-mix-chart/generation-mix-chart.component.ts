import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { GenerationMix, FUEL_COLORS, isRenewable } from '@core/models/carbon-intensity.models';

interface ChartSegment {
  fuel: string;
  percentage: number;
  color: string;
  startAngle: number;
  endAngle: number;
  pathD: string;
  isRenewable: boolean;
}

@Component({
  selector: 'app-generation-mix-chart',
  standalone: true,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="generation-mix-chart">
      <div class="flex flex-col lg:flex-row items-center gap-6">
        <!-- SVG Donut Chart -->
        <div class="relative" role="img" [attr.aria-label]="chartAriaLabel()">
          <svg
            viewBox="0 0 200 200"
            class="w-48 h-48 transform -rotate-90"
            aria-hidden="true"
          >
            @for (segment of segments(); track segment.fuel) {
              <path
                [attr.d]="segment.pathD"
                [attr.fill]="segment.color"
                [attr.stroke]="'white'"
                stroke-width="1"
                class="transition-opacity hover:opacity-80 focus:opacity-80"
              />
            }
            <!-- Center circle for donut effect -->
            <circle cx="100" cy="100" r="50" fill="white" />
          </svg>
          <!-- Center text -->
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-2xl font-bold text-gray-900">{{ renewablePercentage() | number:'1.0-0' }}%</span>
            <span class="text-xs text-gray-500">Renewable</span>
          </div>
        </div>

        <!-- Legend -->
        <div class="flex-1">
          <ul class="grid grid-cols-2 gap-2" aria-label="Generation mix legend">
            @for (segment of sortedSegments(); track segment.fuel) {
              <li class="flex items-center gap-2 text-sm">
                <span
                  class="w-4 h-4 rounded flex-shrink-0 border border-gray-200"
                  [style.background-color]="segment.color"
                  [class]="segment.isRenewable ? 'ring-2 ring-green-400 ring-offset-1' : ''"
                  aria-hidden="true"
                ></span>
                <span class="capitalize">{{ segment.fuel }}</span>
                <span class="font-medium ml-auto">{{ segment.percentage | number:'1.1-1' }}%</span>
              </li>
            }
          </ul>
        </div>
      </div>

      <!-- Accessible data table (screen reader only) -->
      <table class="sr-only" aria-label="Generation mix data">
        <caption>Current UK electricity generation mix by fuel type</caption>
        <thead>
          <tr>
            <th scope="col">Fuel Type</th>
            <th scope="col">Percentage</th>
            <th scope="col">Renewable</th>
          </tr>
        </thead>
        <tbody>
          @for (segment of sortedSegments(); track segment.fuel) {
            <tr>
              <td>{{ segment.fuel }}</td>
              <td>{{ segment.percentage | number:'1.1-1' }}%</td>
              <td>{{ segment.isRenewable ? 'Yes' : 'No' }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    @media (prefers-contrast: more) {
      svg path {
        stroke: black;
        stroke-width: 2;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      svg path {
        transition: none;
      }
    }
  `],
})
export class GenerationMixChartComponent {
  readonly data = input.required<GenerationMix[]>();

  protected readonly segments = computed((): ChartSegment[] => {
    const mix = this.data();
    if (!mix.length) return [];

    let currentAngle = 0;
    return mix.map((item) => {
      const startAngle = currentAngle;
      const sweepAngle = (item.perc / 100) * 360;
      currentAngle += sweepAngle;

      return {
        fuel: item.fuel,
        percentage: item.perc,
        color: FUEL_COLORS[item.fuel] || '#9E9E9E',
        startAngle,
        endAngle: currentAngle,
        pathD: this.createArcPath(startAngle, sweepAngle),
        isRenewable: isRenewable(item.fuel),
      };
    });
  });

  protected readonly sortedSegments = computed(() =>
    [...this.segments()].sort((a, b) => b.percentage - a.percentage)
  );

  protected readonly renewablePercentage = computed(() =>
    this.segments()
      .filter((s) => s.isRenewable)
      .reduce((sum, s) => sum + s.percentage, 0)
  );

  protected readonly chartAriaLabel = computed(() => {
    const renewable = this.renewablePercentage();
    return `Donut chart showing UK electricity generation mix. ${renewable.toFixed(0)}% from renewable sources.`;
  });

  private createArcPath(startAngle: number, sweepAngle: number): string {
    const cx = 100;
    const cy = 100;
    const outerRadius = 90;
    const innerRadius = 50;

    if (sweepAngle >= 359.99) {
      return `
        M ${cx} ${cy - outerRadius}
        A ${outerRadius} ${outerRadius} 0 1 1 ${cx - 0.01} ${cy - outerRadius}
        L ${cx - 0.01} ${cy - innerRadius}
        A ${innerRadius} ${innerRadius} 0 1 0 ${cx} ${cy - innerRadius}
        Z
      `;
    }

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = ((startAngle + sweepAngle) * Math.PI) / 180;

    const x1Outer = cx + outerRadius * Math.cos(startRad);
    const y1Outer = cy + outerRadius * Math.sin(startRad);
    const x2Outer = cx + outerRadius * Math.cos(endRad);
    const y2Outer = cy + outerRadius * Math.sin(endRad);

    const x1Inner = cx + innerRadius * Math.cos(endRad);
    const y1Inner = cy + innerRadius * Math.sin(endRad);
    const x2Inner = cx + innerRadius * Math.cos(startRad);
    const y2Inner = cy + innerRadius * Math.sin(startRad);

    const largeArc = sweepAngle > 180 ? 1 : 0;

    return `
      M ${x1Outer} ${y1Outer}
      A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2Outer} ${y2Outer}
      L ${x1Inner} ${y1Inner}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x2Inner} ${y2Inner}
      Z
    `;
  }
}
