import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';

export interface ChartDataPoint {
  week: number;
  average: number;
  min: number;
  max: number;
  label: string;
  dateRange: string;
}

@Component({
  selector: 'app-yearly-chart',
  standalone: true,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="yearly-chart">
      <!-- Chart Header -->
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Weekly Carbon Intensity</h3>
          <p class="text-sm text-gray-500">Average gCO2/kWh per week</p>
        </div>
        <div class="flex gap-4 text-sm">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-blue-500"></span>
            <span>Average</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-0.5 bg-gray-300"></span>
            <span>Min/Max Range</span>
          </div>
        </div>
      </div>

      <!-- SVG Chart -->
      <div class="relative" role="img" [attr.aria-label]="chartAriaLabel()">
        <svg
          [attr.viewBox]="'0 0 ' + chartWidth + ' ' + chartHeight"
          class="w-full h-80"
          aria-hidden="true"
        >
          <!-- Grid lines -->
          @for (line of gridLines(); track line.y) {
            <line
              [attr.x1]="padding.left"
              [attr.y1]="line.y"
              [attr.x2]="chartWidth - padding.right"
              [attr.y2]="line.y"
              stroke="#e5e7eb"
              stroke-width="1"
            />
            <text
              [attr.x]="padding.left - 10"
              [attr.y]="line.y + 4"
              text-anchor="end"
              class="text-xs fill-gray-500"
            >
              {{ line.value }}
            </text>
          }

          <!-- X-axis labels (months) -->
          @for (month of monthLabels(); track month.x) {
            <text
              [attr.x]="month.x"
              [attr.y]="chartHeight - 10"
              text-anchor="middle"
              class="text-xs fill-gray-500"
            >
              {{ month.label }}
            </text>
          }

          <!-- Min/Max area -->
          <path
            [attr.d]="areaPath()"
            fill="rgba(59, 130, 246, 0.1)"
            stroke="none"
          />

          <!-- Average line -->
          <path
            [attr.d]="linePath()"
            fill="none"
            stroke="#3b82f6"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <!-- Data points -->
          @for (point of chartPoints(); track point.week) {
            <circle
              [attr.cx]="point.x"
              [attr.cy]="point.y"
              r="3"
              fill="#3b82f6"
              class="hover:r-5 transition-all cursor-pointer"
            >
              <title>Week {{ point.week }}: {{ point.average }} gCO2/kWh ({{ point.dateRange }})</title>
            </circle>
          }
        </svg>

        <!-- Tooltip would go here for interactive version -->
      </div>

      <!-- Summary Stats -->
      <div class="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-200">
        <div class="text-center">
          <p class="text-2xl font-bold text-green-600">{{ minValue() }}</p>
          <p class="text-sm text-gray-500">Lowest Week</p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold text-blue-600">{{ avgValue() | number:'1.0-0' }}</p>
          <p class="text-sm text-gray-500">Yearly Average</p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold text-orange-600">{{ maxValue() }}</p>
          <p class="text-sm text-gray-500">Highest Week</p>
        </div>
      </div>

      <!-- Accessible data table -->
      <table class="sr-only" aria-label="Weekly carbon intensity data">
        <caption>Weekly average carbon intensity in gCO2/kWh for {{ year() }}</caption>
        <thead>
          <tr>
            <th scope="col">Week</th>
            <th scope="col">Date Range</th>
            <th scope="col">Average</th>
            <th scope="col">Min</th>
            <th scope="col">Max</th>
          </tr>
        </thead>
        <tbody>
          @for (point of data(); track point.week) {
            <tr>
              <td>{{ point.week }}</td>
              <td>{{ point.dateRange }}</td>
              <td>{{ point.average }} gCO2/kWh</td>
              <td>{{ point.min }} gCO2/kWh</td>
              <td>{{ point.max }} gCO2/kWh</td>
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

    @media (prefers-reduced-motion: reduce) {
      circle {
        transition: none;
      }
    }

    @media (prefers-contrast: more) {
      svg path {
        stroke-width: 3;
      }
    }
  `],
})
export class YearlyChartComponent {
  readonly data = input.required<ChartDataPoint[]>();
  readonly year = input.required<number>();

  readonly chartWidth = 800;
  readonly chartHeight = 320;
  readonly padding = { top: 20, right: 20, bottom: 40, left: 50 };

  protected readonly minValue = computed(() => {
    const d = this.data();
    return d.length ? Math.min(...d.map((p) => p.min)) : 0;
  });

  protected readonly maxValue = computed(() => {
    const d = this.data();
    return d.length ? Math.max(...d.map((p) => p.max)) : 0;
  });

  protected readonly avgValue = computed(() => {
    const d = this.data();
    if (!d.length) return 0;
    return d.reduce((sum, p) => sum + p.average, 0) / d.length;
  });

  protected readonly yScale = computed(() => {
    const max = this.maxValue();
    const min = this.minValue();
    const range = max - min || 1;
    const paddedMax = max + range * 0.1;
    const paddedMin = Math.max(0, min - range * 0.1);

    return {
      min: paddedMin,
      max: paddedMax,
      range: paddedMax - paddedMin,
    };
  });

  protected readonly gridLines = computed(() => {
    const scale = this.yScale();
    const lines: Array<{ y: number; value: number }> = [];
    const step = Math.ceil(scale.range / 5 / 25) * 25; // Round to nearest 25

    for (let value = Math.ceil(scale.min / step) * step; value <= scale.max; value += step) {
      const y = this.valueToY(value);
      lines.push({ y, value });
    }
    return lines;
  });

  protected readonly monthLabels = computed(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartAreaWidth = this.chartWidth - this.padding.left - this.padding.right;

    return months.map((label, index) => ({
      label,
      x: this.padding.left + (chartAreaWidth * (index + 0.5)) / 12,
    }));
  });

  protected readonly chartPoints = computed(() => {
    const d = this.data();
    return d.map((point) => ({
      ...point,
      x: this.weekToX(point.week),
      y: this.valueToY(point.average),
    }));
  });

  protected readonly linePath = computed(() => {
    const points = this.chartPoints();
    if (points.length === 0) return '';

    return points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');
  });

  protected readonly areaPath = computed(() => {
    const d = this.data();
    if (d.length === 0) return '';

    const topLine = d
      .map((p, i) => {
        const x = this.weekToX(p.week);
        const y = this.valueToY(p.max);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

    const bottomLine = [...d]
      .reverse()
      .map((p) => {
        const x = this.weekToX(p.week);
        const y = this.valueToY(p.min);
        return `L ${x} ${y}`;
      })
      .join(' ');

    return `${topLine} ${bottomLine} Z`;
  });

  protected readonly chartAriaLabel = computed(() => {
    const avg = this.avgValue();
    return `Line chart showing weekly carbon intensity for ${this.year()}. Yearly average: ${Math.round(avg)} gCO2/kWh.`;
  });

  private weekToX(week: number): number {
    const chartAreaWidth = this.chartWidth - this.padding.left - this.padding.right;
    const totalWeeks = 52;
    return this.padding.left + (chartAreaWidth * (week - 1)) / (totalWeeks - 1);
  }

  private valueToY(value: number): number {
    const scale = this.yScale();
    const chartAreaHeight = this.chartHeight - this.padding.top - this.padding.bottom;
    const normalized = (value - scale.min) / scale.range;
    return this.chartHeight - this.padding.bottom - normalized * chartAreaHeight;
  }
}
