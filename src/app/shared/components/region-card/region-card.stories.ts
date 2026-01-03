import type { Meta, StoryObj } from '@storybook/angular';
import { fn } from 'storybook/test';
import { RegionCardComponent } from './region-card.component';
import { RegionData } from '@core/models/carbon-intensity.models';

const meta: Meta<RegionCardComponent> = {
  title: 'Shared/RegionCard',
  component: RegionCardComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Card displaying a UK region\'s carbon intensity with interactive view details button.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<RegionCardComponent>;

const createRegion = (
  id: number,
  name: string,
  dno: string,
  forecast: number,
  actual: number | null,
  index: 'very low' | 'low' | 'moderate' | 'high' | 'very high'
): RegionData => ({
  regionid: id,
  shortname: name,
  dnoregion: dno,
  intensity: { forecast, actual, index },
  generationmix: [
    { fuel: 'wind', perc: 40 },
    { fuel: 'gas', perc: 30 },
    { fuel: 'nuclear', perc: 20 },
    { fuel: 'solar', perc: 10 },
  ],
});

export const VeryLowIntensity: Story = {
  args: {
    data: createRegion(1, 'North Scotland', 'SHETL', 45, 42, 'very low'),
  },
};

export const LowIntensity: Story = {
  args: {
    data: createRegion(2, 'South Scotland', 'SPD', 95, 90, 'low'),
  },
};

export const ModerateIntensity: Story = {
  args: {
    data: createRegion(3, 'North West England', 'ENWL', 175, 180, 'moderate'),
  },
};

export const HighIntensity: Story = {
  args: {
    data: createRegion(4, 'East Midlands', 'EMEB', 260, 255, 'high'),
  },
};

export const VeryHighIntensity: Story = {
  args: {
    data: createRegion(5, 'South East England', 'SEEB', 380, null, 'very high'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Region with very high intensity and no actual data available yet.',
      },
    },
  },
};

export const WithInteraction: Story = {
  args: {
    data: createRegion(6, 'London', 'UKPN', 200, 195, 'moderate'),
  },
  render: (args) => ({
    props: {
      ...args,
      onViewDetails: fn(),
    },
    template: `
      <app-region-card
        [data]="data"
        (viewDetails)="onViewDetails($event)"
      />
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Click the View Details button to see the action logged.',
      },
    },
  },
};

export const Grid: Story = {
  render: () => ({
    template: `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        <app-region-card [data]="regions[0]" />
        <app-region-card [data]="regions[1]" />
        <app-region-card [data]="regions[2]" />
        <app-region-card [data]="regions[3]" />
        <app-region-card [data]="regions[4]" />
        <app-region-card [data]="regions[5]" />
      </div>
    `,
    props: {
      regions: [
        createRegion(1, 'North Scotland', 'SHETL', 45, 42, 'very low'),
        createRegion(2, 'South Scotland', 'SPD', 95, 90, 'low'),
        createRegion(3, 'North West', 'ENWL', 175, 180, 'moderate'),
        createRegion(4, 'Yorkshire', 'NPG', 220, 215, 'high'),
        createRegion(5, 'East Midlands', 'EMEB', 260, 255, 'high'),
        createRegion(6, 'London', 'UKPN', 200, 195, 'moderate'),
      ],
    },
  }),
  parameters: {
    docs: {
      description: {
        story: 'Multiple region cards in a responsive grid layout.',
      },
    },
  },
};
