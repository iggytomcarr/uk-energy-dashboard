import { render, screen, within } from '@testing-library/angular';
import { GenerationMixChartComponent } from './generation-mix-chart.component';
import { GenerationMix } from '@core/models/carbon-intensity.models';

describe('GenerationMixChartComponent', () => {
  const mockData: GenerationMix[] = [
    { fuel: 'wind', perc: 30 },
    { fuel: 'gas', perc: 25 },
    { fuel: 'nuclear', perc: 20 },
    { fuel: 'solar', perc: 15 },
    { fuel: 'coal', perc: 10 },
  ];

  const renderComponent = async (data: GenerationMix[]) => {
    return render(GenerationMixChartComponent, {
      componentInputs: { data },
    });
  };

  it('should display renewable percentage in center of donut', async () => {
    await renderComponent(mockData);

    // Wind (30%) + Solar (15%) = 45% renewable
    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.getByText('Renewable')).toBeInTheDocument();
  });

  it('should render legend with all fuel types', async () => {
    await renderComponent(mockData);

    const legend = screen.getByRole('list', { name: /generation mix legend/i });
    expect(within(legend).getByText('wind')).toBeInTheDocument();
    expect(within(legend).getByText('gas')).toBeInTheDocument();
    expect(within(legend).getByText('nuclear')).toBeInTheDocument();
    expect(within(legend).getByText('solar')).toBeInTheDocument();
    expect(within(legend).getByText('coal')).toBeInTheDocument();
  });

  it('should have accessible data table for screen readers', async () => {
    await renderComponent(mockData);

    const table = screen.getByRole('table', { name: /generation mix data/i });
    expect(table).toBeInTheDocument();
    expect(table).toHaveClass('sr-only');

    // Check table has caption
    expect(
      screen.getByText(/current uk electricity generation mix by fuel type/i)
    ).toBeInTheDocument();
  });

  it('should have descriptive aria-label on chart', async () => {
    await renderComponent(mockData);

    const chart = screen.getByRole('img');
    expect(chart).toHaveAttribute('aria-label');
    expect(chart.getAttribute('aria-label')).toContain('45%');
    expect(chart.getAttribute('aria-label')).toContain('renewable');
  });

  it('should mark renewable sources in the legend', async () => {
    const { container } = await renderComponent(mockData);

    // Renewable sources should have ring indicator
    const legendItems = container.querySelectorAll('li');
    const windItem = Array.from(legendItems).find((item) =>
      item.textContent?.includes('wind')
    );
    expect(windItem?.querySelector('.ring-green-400')).toBeInTheDocument();
  });
});
