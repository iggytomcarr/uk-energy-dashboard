import type { Meta, StoryObj } from '@storybook/angular';
import { IntensityBadgeComponent } from './intensity-badge.component';

const meta: Meta<IntensityBadgeComponent> = {
  title: 'Shared/IntensityBadge',
  component: IntensityBadgeComponent,
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'number', min: 0, max: 500 },
      description: 'Carbon intensity value in gCO2/kWh',
    },
    level: {
      control: 'select',
      options: ['very low', 'low', 'moderate', 'high', 'very high'],
      description: 'Intensity level classification',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Displays carbon intensity value with colour-coded level indicator. Includes accessibility patterns for colour-blind users.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<IntensityBadgeComponent>;

export const VeryLow: Story = {
  args: {
    value: 50,
    level: 'very low',
  },
};

export const Low: Story = {
  args: {
    value: 100,
    level: 'low',
  },
};

export const Moderate: Story = {
  args: {
    value: 180,
    level: 'moderate',
  },
};

export const High: Story = {
  args: {
    value: 280,
    level: 'high',
  },
};

export const VeryHigh: Story = {
  args: {
    value: 400,
    level: 'very high',
  },
};

export const AllLevels: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap gap-4 p-4">
        <app-intensity-badge [value]="50" level="very low" />
        <app-intensity-badge [value]="100" level="low" />
        <app-intensity-badge [value]="180" level="moderate" />
        <app-intensity-badge [value]="280" level="high" />
        <app-intensity-badge [value]="400" level="very high" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'All intensity levels displayed together for comparison.',
      },
    },
  },
};
