import type { Meta, StoryObj } from '@storybook/angular';
import { GenerationMixChartComponent } from './generation-mix-chart.component';
import { GenerationMix } from '@core/models/carbon-intensity.models';

const meta: Meta<GenerationMixChartComponent> = {
  title: 'Shared/GenerationMixChart',
  component: GenerationMixChartComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Donut chart showing UK electricity generation mix by fuel type. Includes hidden accessible data table for screen readers.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<GenerationMixChartComponent>;

const typicalMix: GenerationMix[] = [
  { fuel: 'gas', perc: 35 },
  { fuel: 'wind', perc: 25 },
  { fuel: 'nuclear', perc: 15 },
  { fuel: 'solar', perc: 10 },
  { fuel: 'imports', perc: 8 },
  { fuel: 'biomass', perc: 4 },
  { fuel: 'hydro', perc: 2 },
  { fuel: 'coal', perc: 1 },
];

const highRenewable: GenerationMix[] = [
  { fuel: 'wind', perc: 45 },
  { fuel: 'solar', perc: 20 },
  { fuel: 'nuclear', perc: 15 },
  { fuel: 'gas', perc: 10 },
  { fuel: 'hydro', perc: 5 },
  { fuel: 'biomass', perc: 5 },
];

const lowRenewable: GenerationMix[] = [
  { fuel: 'gas', perc: 55 },
  { fuel: 'nuclear', perc: 20 },
  { fuel: 'coal', perc: 10 },
  { fuel: 'imports', perc: 8 },
  { fuel: 'wind', perc: 5 },
  { fuel: 'solar', perc: 2 },
];

export const TypicalMix: Story = {
  args: {
    data: typicalMix,
  },
  parameters: {
    docs: {
      description: {
        story: 'A typical UK generation mix with a balance of gas, renewables, and nuclear.',
      },
    },
  },
};

export const HighRenewable: Story = {
  args: {
    data: highRenewable,
  },
  parameters: {
    docs: {
      description: {
        story: 'High renewable scenario showing wind and solar dominance.',
      },
    },
  },
};

export const LowRenewable: Story = {
  args: {
    data: lowRenewable,
  },
  parameters: {
    docs: {
      description: {
        story: 'Low renewable scenario with high gas and fossil fuel usage.',
      },
    },
  },
};

export const WindDominated: Story = {
  args: {
    data: [
      { fuel: 'wind', perc: 60 },
      { fuel: 'nuclear', perc: 20 },
      { fuel: 'gas', perc: 15 },
      { fuel: 'solar', perc: 5 },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'A windy day scenario where wind provides majority of generation.',
      },
    },
  },
};
