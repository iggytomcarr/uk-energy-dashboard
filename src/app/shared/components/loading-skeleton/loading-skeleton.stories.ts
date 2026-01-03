import type { Meta, StoryObj } from '@storybook/angular';
import { LoadingSkeletonComponent } from './loading-skeleton.component';

const meta: Meta<LoadingSkeletonComponent> = {
  title: 'Shared/LoadingSkeleton',
  component: LoadingSkeletonComponent,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['default', 'card', 'badge', 'chart', 'text'],
      description: 'Type of skeleton to display',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Animated loading placeholder that respects prefers-reduced-motion. Provides visual feedback while content loads.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<LoadingSkeletonComponent>;

export const Default: Story = {
  args: {
    type: 'default',
  },
};

export const Card: Story = {
  args: {
    type: 'card',
  },
  parameters: {
    docs: {
      description: {
        story: 'Card skeleton matching the RegionCard component layout.',
      },
    },
  },
};

export const Badge: Story = {
  args: {
    type: 'badge',
  },
  parameters: {
    docs: {
      description: {
        story: 'Badge skeleton matching the IntensityBadge component.',
      },
    },
  },
};

export const Chart: Story = {
  args: {
    type: 'chart',
  },
  parameters: {
    docs: {
      description: {
        story: 'Chart skeleton matching the GenerationMixChart layout.',
      },
    },
  },
};

export const Text: Story = {
  args: {
    type: 'text',
  },
  parameters: {
    docs: {
      description: {
        story: 'Text skeleton for paragraph content.',
      },
    },
  },
};

export const AllTypes: Story = {
  render: () => ({
    template: `
      <div class="space-y-6 p-4">
        <div>
          <h3 class="text-sm font-medium text-gray-500 mb-2">Badge</h3>
          <app-loading-skeleton type="badge" />
        </div>
        <div>
          <h3 class="text-sm font-medium text-gray-500 mb-2">Card</h3>
          <div class="max-w-sm">
            <app-loading-skeleton type="card" />
          </div>
        </div>
        <div>
          <h3 class="text-sm font-medium text-gray-500 mb-2">Chart</h3>
          <app-loading-skeleton type="chart" />
        </div>
        <div>
          <h3 class="text-sm font-medium text-gray-500 mb-2">Text</h3>
          <app-loading-skeleton type="text" />
        </div>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'All skeleton types displayed together.',
      },
    },
  },
};

export const CardGrid: Story = {
  render: () => ({
    template: `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        <app-loading-skeleton type="card" />
        <app-loading-skeleton type="card" />
        <app-loading-skeleton type="card" />
        <app-loading-skeleton type="card" />
        <app-loading-skeleton type="card" />
        <app-loading-skeleton type="card" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Grid of card skeletons as seen on the dashboard during loading.',
      },
    },
  },
};
