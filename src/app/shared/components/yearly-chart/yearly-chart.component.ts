import { Component, ChangeDetectionStrategy, input, computed, signal } from '@angular/core';
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
          <div class="flex items-center gap-2">
            <span class="w-6 h-0.5 bg-red-500" style="border-top: 2px dashed #ef4444;"></span>
            <span>Trend</span>
          </div>
        </div>
      </div>

      <!-- SVG Chart -->
      <div class="relative" role="img" [attr.aria-label]="chartAriaLabel()">
        <svg
          [attr.viewBox]="'0 0 ' + chartWidth + ' ' + chartHeight"
          class="w-full h-80"
          aria-hidden="true"
          (mouseleave)="clearHighlight()"
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

          <!-- Highlighted week vertical line -->
          @if (highlightedPoint()) {
            <line
              [attr.x1]="highlightedPoint()!.x"
              [attr.y1]="padding.top"
              [attr.x2]="highlightedPoint()!.x"
              [attr.y2]="chartHeight - padding.bottom"
              stroke="#3b82f6"
              stroke-width="1"
              stroke-dasharray="4,4"
              opacity="0.5"
            />
          }

          <!-- Trend line -->
          @if (trendLine()) {
            <line
              [attr.x1]="trendLine()!.x1"
              [attr.y1]="trendLine()!.y1"
              [attr.x2]="trendLine()!.x2"
              [attr.y2]="trendLine()!.y2"
              stroke="#ef4444"
              stroke-width="2"
              stroke-dasharray="6,4"
              opacity="0.8"
            />
          }

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
              [attr.r]="highlightedWeek() === point.week ? 6 : 3"
              [attr.fill]="highlightedWeek() === point.week ? '#1d4ed8' : '#3b82f6'"
              [attr.stroke]="highlightedWeek() === point.week ? '#fff' : 'none'"
              [attr.stroke-width]="highlightedWeek() === point.week ? 2 : 0"
              class="cursor-pointer transition-all duration-150"
              (mouseenter)="highlightWeek(point.week)"
            />
          }

          <!-- Invisible larger hit areas for easier hovering -->
          @for (point of chartPoints(); track point.week) {
            <circle
              [attr.cx]="point.x"
              [attr.cy]="point.y"
              r="12"
              fill="transparent"
              class="cursor-pointer"
              (mouseenter)="highlightWeek(point.week)"
            />
          }
        </svg>

        <!-- Tooltip -->
        @if (highlightedPoint()) {
          <div
            class="absolute bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm pointer-events-none z-10 transform -translate-x-1/2"
            [style.left.%]="(highlightedPoint()!.x / chartWidth) * 100"
            [style.top.px]="highlightedPoint()!.y - 70"
          >
            <div class="font-semibold">Week {{ highlightedPoint()!.week }}</div>
            <div class="text-gray-300 text-xs">{{ highlightedPoint()!.dateRange }}</div>
            <div class="mt-1">
              <span class="text-blue-400">Avg:</span> {{ highlightedPoint()!.average }} gCO2/kWh
            </div>
            <div class="text-xs text-gray-400">
              Min: {{ highlightedPoint()!.min }} | Max: {{ highlightedPoint()!.max }}
            </div>
            <!-- Tooltip arrow -->
            <div class="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-gray-900 rotate-45"></div>
          </div>
        }
      </div>

      <!-- Summary Stats -->
      <div class="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-200">
        <div
          class="text-center p-3 rounded-lg cursor-pointer transition-colors"
          [class.bg-green-50]="highlightedWeek() === minWeek()?.week"
          [class.ring-2]="highlightedWeek() === minWeek()?.week"
          [class.ring-green-500]="highlightedWeek() === minWeek()?.week"
          (mouseenter)="highlightWeek(minWeek()?.week ?? null)"
          (mouseleave)="clearHighlight()"
        >
          <p class="text-2xl font-bold text-green-600">{{ minValue() }}</p>
          <p class="text-sm text-gray-500">Lowest Week</p>
          @if (minWeek()) {
            <p class="text-xs text-gray-400 mt-1">Week {{ minWeek()!.week }}</p>
          }
        </div>
        <div
          class="text-center p-3 rounded-lg cursor-pointer transition-colors"
          [class.bg-orange-50]="highlightedWeek() === maxWeek()?.week"
          [class.ring-2]="highlightedWeek() === maxWeek()?.week"
          [class.ring-orange-500]="highlightedWeek() === maxWeek()?.week"
          (mouseenter)="highlightWeek(maxWeek()?.week ?? null)"
          (mouseleave)="clearHighlight()"
        >
          <p class="text-2xl font-bold text-orange-600">{{ maxValue() }}</p>
          <p class="text-sm text-gray-500">Highest Week</p>
          @if (maxWeek()) {
            <p class="text-xs text-gray-400 mt-1">Week {{ maxWeek()!.week }}</p>
          }
        </div>
        <div class="text-center p-3">
          <div class="flex items-center justify-center gap-2">
            <p class="text-2xl font-bold text-blue-600">{{ avgValue() | number:'1.0-0' }}</p>
            @if (trendLine()) {
              <span
                class="flex items-center text-sm font-medium px-2 py-0.5 rounded"
                [class.text-green-700]="trendLine()!.slope < 0"
                [class.bg-green-100]="trendLine()!.slope < 0"
                [class.text-red-700]="trendLine()!.slope > 0"
                [class.bg-red-100]="trendLine()!.slope > 0"
                [class.text-gray-600]="trendLine()!.slope === 0"
                [class.bg-gray-100]="trendLine()!.slope === 0"
              >
                @if (trendLine()!.slope < 0) {
                  <svg class="w-4 h-4 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                } @else if (trendLine()!.slope > 0) {
                  <svg class="w-4 h-4 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                } @else {
                  <svg class="w-4 h-4 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14" />
                  </svg>
                }
                {{ trendChangePercent() | number:'1.1-1' }}%
              </span>
            }
          </div>
          <p class="text-sm text-gray-500">Yearly Average</p>
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
      circle,
      div {
        transition: none !important;
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

  // Highlighted week signal
  readonly highlightedWeek = signal<number | null>(null);

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

  // Find the week with minimum value
  protected readonly minWeek = computed(() => {
    const d = this.data();
    if (!d.length) return null;
    return d.reduce((min, p) => (p.min < min.min ? p : min));
  });

  // Find the week with maximum value
  protected readonly maxWeek = computed(() => {
    const d = this.data();
    if (!d.length) return null;
    return d.reduce((max, p) => (p.max > max.max ? p : max));
  });

  // Get the highlighted point data
  protected readonly highlightedPoint = computed(() => {
    const week = this.highlightedWeek();
    if (week === null) return null;
    return this.chartPoints().find((p) => p.week === week) ?? null;
  });

  // Calculate trend line using linear regression
  protected readonly trendLine = computed(() => {
    const d = this.data();
    if (d.length < 2) return null;

    // Linear regression: y = mx + b
    const n = d.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    d.forEach((point) => {
      sumX += point.week;
      sumY += point.average;
      sumXY += point.week * point.average;
      sumXX += point.week * point.week;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate start and end points
    const firstWeek = d[0].week;
    const lastWeek = d[d.length - 1].week;
    const startY = slope * firstWeek + intercept;
    const endY = slope * lastWeek + intercept;

    return {
      x1: this.weekToX(firstWeek),
      y1: this.valueToY(startY),
      x2: this.weekToX(lastWeek),
      y2: this.valueToY(endY),
      slope,
      direction: slope < 0 ? 'decreasing' : slope > 0 ? 'increasing' : 'stable',
      startValue: startY,
      endValue: endY,
    };
  });

  // Calculate trend percentage change
  protected readonly trendChangePercent = computed(() => {
    const trend = this.trendLine();
    if (!trend || trend.startValue === 0) return 0;
    return ((trend.endValue - trend.startValue) / trend.startValue) * 100;
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

  highlightWeek(week: number | null): void {
    this.highlightedWeek.set(week);
  }

  clearHighlight(): void {
    this.highlightedWeek.set(null);
  }

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
