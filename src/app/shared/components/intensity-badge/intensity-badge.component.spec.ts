import { render, screen } from '@testing-library/angular';
import { IntensityBadgeComponent } from './intensity-badge.component';
import { IntensityLevel } from '@core/models/carbon-intensity.models';

describe('IntensityBadgeComponent', () => {
  const renderComponent = async (value: number, level: IntensityLevel) => {
    return render(IntensityBadgeComponent, {
      componentInputs: {
        value,
        level,
      },
    });
  };

  it('should display the intensity value', async () => {
    await renderComponent(150, 'moderate');

    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('gCO2/kWh')).toBeInTheDocument();
  });

  it('should have proper aria-label describing the value and level', async () => {
    await renderComponent(200, 'high');

    const badge = screen.getByRole('status');
    expect(badge).toHaveAttribute(
      'aria-label',
      'Carbon intensity is 200 grams CO2 per kilowatt hour, rated as high'
    );
  });

  it('should apply correct CSS class based on intensity level', async () => {
    await renderComponent(50, 'very low');

    const badge = screen.getByRole('status');
    expect(badge).toHaveClass('intensity-very-low');
  });

  it('should display screen reader text for the level', async () => {
    await renderComponent(100, 'low');

    expect(screen.getByText('low')).toHaveClass('sr-only');
  });

  it('should render pattern indicator for accessibility', async () => {
    const { container } = await renderComponent(300, 'very high');

    const patternElement = container.querySelector('.intensity-pattern-very-high');
    expect(patternElement).toBeInTheDocument();
  });
});
