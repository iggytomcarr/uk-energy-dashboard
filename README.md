# UK Energy Grid Dashboard

[![Angular](https://img.shields.io/badge/Angular-21-dd0031?logo=angular)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![NgRx](https://img.shields.io/badge/NgRx-SignalStore-ba2bd2?logo=ngrx)](https://ngrx.io/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)](https://uk-energy-dashboard-gray.vercel.app/)

A modern Angular 21+ dashboard displaying real-time UK electricity grid carbon intensity and generation mix data. Built as a portfolio demonstration for a **National Grid Angular UI Engineer** role, showcasing expertise in accessibility, modern Angular patterns, and clean architecture.

## Live Demo

**[View Live Demo](https://uk-energy-dashboard-gray.vercel.app/dashboard)**

## Local Development

```bash
npm install && npm start
# Open http://localhost:4200
```

## Key Features

| Feature | Description |
|---------|-------------|
| **Real-time Data** | Live carbon intensity from the UK National Grid API |
| **Generation Mix** | Interactive donut chart showing energy sources (wind, solar, gas, nuclear, etc.) |
| **Regional Map** | Interactive Leaflet map with color-coded UK DNO regions |
| **Historical Charts** | Weekly carbon intensity trends with year selector |
| **Regional Breakdown** | Carbon intensity for all 14 UK DNO regions with detail modals |
| **Accessibility First** | WCAG 2.1 AA compliant with comprehensive a11y features |
| **Modern Angular** | Standalone components, signals, new control flow, OnPush |

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Angular 21** | Frontend framework with standalone components and signals |
| **NgRx SignalStore** | Reactive state management with computed signals |
| **Tailwind CSS 3** | Utility-first styling with custom design tokens |
| **Leaflet** | Interactive maps for regional visualization |
| **Storybook 10** | Component documentation and visual testing |
| **Jest + Testing Library** | Unit testing with accessibility queries |
| **RxJS** | Reactive data fetching and state updates |

## Architecture

### Project Structure

```
src/app/
├── core/                          # Singleton services and models
│   ├── models/
│   │   └── carbon-intensity.models.ts   # TypeScript interfaces & types
│   └── services/
│       └── carbon-intensity.service.ts  # API service with HttpClient
│
├── shared/components/             # Reusable UI components
│   ├── intensity-badge/           # Colour-coded intensity indicator
│   ├── generation-mix-chart/      # SVG donut chart
│   ├── region-card/               # Regional data card
│   └── loading-skeleton/          # Animated loading states
│
├── features/                      # Feature modules (lazy-loaded)
│   ├── dashboard/                 # Main dashboard view
│   │   └── dashboard.component.ts
│   └── settings/                  # User preferences
│       └── components/
│           └── accessibility-panel/
│
├── state/                         # NgRx SignalStore
│   ├── intensity.store.ts         # Carbon intensity state
│   └── preferences.store.ts       # User preferences (localStorage)
│
├── app.config.ts                  # Application configuration
├── app.routes.ts                  # Lazy-loaded route definitions
└── app.ts                         # Root component with navigation
```

### Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Standalone Components** | Simplified dependency management, tree-shakeable |
| **Signal Inputs** | Modern reactive pattern, better performance than @Input() |
| **OnPush Change Detection** | Optimal performance, explicit change triggers |
| **NgRx SignalStore** | Lightweight alternative to full NgRx, signal-based reactivity |
| **SVG Chart** | No external charting library dependency, full accessibility control |
| **Tailwind CSS** | Rapid prototyping, consistent design system, small bundle |

## API Integration

Uses the [Carbon Intensity API](https://api.carbonintensity.org.uk) - free, no authentication required.

### Endpoints

| Endpoint | Description | Response |
|----------|-------------|----------|
| `GET /intensity` | Current UK-wide carbon intensity | Forecast + actual gCO2/kWh |
| `GET /regional` | Intensity by DNO region | 14 regions with forecasts |
| `GET /generation` | Current generation mix | % by fuel type |

### Data Models

```typescript
interface IntensityData {
  forecast: number;        // Predicted gCO2/kWh
  actual: number | null;   // Measured (may lag)
  index: IntensityLevel;   // 'very low' | 'low' | 'moderate' | 'high' | 'very high'
}

interface GenerationMix {
  fuel: string;   // 'wind' | 'solar' | 'gas' | 'nuclear' | etc.
  perc: number;   // Percentage of total generation
}

interface RegionData {
  regionid: number;
  shortname: string;      // e.g., 'North Scotland'
  dnoregion: string;      // Distribution Network Operator
  intensity: IntensityData;
  generationmix: GenerationMix[];
}
```

## Accessibility (a11y)

This project prioritises accessibility as a core requirement, not an afterthought.

### WCAG 2.1 AA Compliance

| Criterion | Implementation |
|-----------|----------------|
| **1.1.1 Non-text Content** | All icons have aria-labels, decorative images marked `aria-hidden` |
| **1.3.1 Info and Relationships** | Semantic HTML, proper heading hierarchy, landmark regions |
| **1.4.1 Use of Colour** | Patterns accompany colours on intensity badges |
| **1.4.3 Contrast** | High contrast mode support, tested ratios |
| **2.1.1 Keyboard** | Full keyboard navigation, visible focus indicators |
| **2.4.1 Bypass Blocks** | Skip link to main content |
| **2.4.4 Link Purpose** | Descriptive link text and aria-labels |
| **4.1.2 Name, Role, Value** | Proper ARIA roles on custom controls |

### Accessibility Features

```html
<!-- Skip Link -->
<a href="#main-content" class="skip-link">Skip to main content</a>

<!-- Screen Reader Table for Chart -->
<table class="sr-only" aria-label="Generation mix data">
  <caption>Current UK electricity generation mix by fuel type</caption>
  ...
</table>

<!-- Intensity Badge with Full Description -->
<span
  role="status"
  aria-label="Carbon intensity is 150 grams CO2 per kilowatt hour, rated as moderate"
>
```

### User Preferences (Settings Page)

| Setting | Description | Persisted |
|---------|-------------|-----------|
| High Contrast Mode | Increases visual contrast | localStorage |
| Reduced Motion | Disables animations | localStorage |
| Font Size | Normal / Large / Extra Large | localStorage |

### Media Query Support

```css
@media (prefers-contrast: more) { /* High contrast styles */ }
@media (prefers-reduced-motion: reduce) { /* Disable animations */ }
```

## Components

### IntensityBadgeComponent

Displays carbon intensity with colour-coded level indicator.

```typescript
// Usage
<app-intensity-badge [value]="150" level="moderate" />

// Inputs (signals)
value: InputSignal<number>      // gCO2/kWh value
level: InputSignal<IntensityLevel>  // Intensity classification
```

**Accessibility:**
- Pattern overlay for colour-blind users
- Comprehensive `aria-label` with value and level
- `role="status"` for live updates

### GenerationMixChartComponent

SVG donut chart showing electricity generation sources.

```typescript
// Usage
<app-generation-mix-chart [data]="generationMix" />

// Input
data: InputSignal<GenerationMix[]>
```

**Accessibility:**
- Hidden data table for screen readers
- `role="img"` with descriptive `aria-label`
- Legend with renewable source indicators

### RegionCardComponent

Card displaying regional carbon intensity.

```typescript
// Usage
<app-region-card [data]="region" (viewDetails)="onViewDetails($event)" />

// Input/Output
data: InputSignal<RegionData>
viewDetails: OutputEmitterRef<RegionData>
```

### LoadingSkeletonComponent

Animated placeholder during data loading.

```typescript
// Usage
<app-loading-skeleton type="card" />
<app-loading-skeleton type="chart" />
<app-loading-skeleton type="badge" />
```

**Accessibility:**
- `role="status"` with `aria-busy="true"`
- Screen reader text: "Loading content, please wait..."
- Respects `prefers-reduced-motion`

## State Management

### IntensityStore

```typescript
// State
interface IntensityState {
  currentIntensity: IntensityData | null;
  regions: RegionData[];
  generationMix: GenerationMix[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// Computed Signals
hasData: Signal<boolean>
renewablePercentage: Signal<number>
sortedRegions: Signal<RegionData[]>

// Methods
loadCurrent(): void
loadRegions(): void
loadGenerationMix(): void
loadAll(): void
clearError(): void
```

### PreferencesStore

```typescript
// State (persisted to localStorage)
interface AccessibilityPreferences {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'normal' | 'large' | 'x-large';
}

// Methods
setHighContrast(enabled: boolean): void
setReducedMotion(enabled: boolean): void
setFontSize(size: FontSize): void
resetToDefaults(): void
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Development server at http://localhost:4200 |
| `npm run build` | Production build to `dist/` |
| `npm test` | Run Jest unit tests |
| `npm run test:watch` | Jest in watch mode |
| `npm run test:coverage` | Generate coverage report |
| `npm run storybook` | Storybook at http://localhost:6006 |
| `npm run build-storybook` | Build static Storybook |

## Testing

### Unit Tests

Tests use Jest with Angular Testing Library for accessible queries.

```typescript
// Example: IntensityBadge test
it('should have proper aria-label describing the value and level', async () => {
  await render(IntensityBadgeComponent, {
    componentInputs: { value: 200, level: 'high' },
  });

  const badge = screen.getByRole('status');
  expect(badge).toHaveAttribute(
    'aria-label',
    'Carbon intensity is 200 grams CO2 per kilowatt hour, rated as high'
  );
});
```

### Storybook

All shared components have Storybook stories with:
- Multiple variants (all intensity levels, loading states)
- Accessibility addon for a11y auditing
- Interactive controls for props

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome | Latest 2 |
| Firefox | Latest 2 |
| Safari | Latest 2 |
| Edge | Latest 2 |

## Performance

| Metric | Value |
|--------|-------|
| Initial Bundle | ~80 KB (transferred) |
| Lazy Chunks | Dashboard: 5 KB, Settings: 2 KB |
| Lighthouse Performance | 95+ |
| First Contentful Paint | < 1s |

## Future Enhancements

- [x] Historical data charts (weekly trends with year selector)
- [x] Region detail modal with generation breakdown
- [x] Interactive regional map with Leaflet
- [ ] Push notifications for intensity changes
- [ ] Offline support with service worker
- [ ] E2E tests with Playwright

## License

MIT

---

Built with modern Angular practices for the National Grid UI Engineer portfolio demonstration.
