import { render, screen, fireEvent } from '@testing-library/angular';
import { RegionCardComponent } from './region-card.component';
import { RegionData } from '@core/models/carbon-intensity.models';

describe('RegionCardComponent', () => {
  const mockRegion: RegionData = {
    regionid: 1,
    dnoregion: 'North Scotland',
    shortname: 'North Scotland',
    intensity: {
      forecast: 120,
      actual: 115,
      index: 'low',
    },
    generationmix: [
      { fuel: 'wind', perc: 50 },
      { fuel: 'gas', perc: 30 },
      { fuel: 'hydro', perc: 20 },
    ],
  };

  const renderComponent = async (data: RegionData) => {
    return render(RegionCardComponent, {
      componentInputs: { data },
    });
  };

  it('should display region name and DNO region', async () => {
    await renderComponent(mockRegion);

    expect(screen.getByText('North Scotland')).toBeInTheDocument();
  });

  it('should display intensity badge with correct values', async () => {
    await renderComponent(mockRegion);

    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should display actual intensity when available', async () => {
    await renderComponent(mockRegion);

    expect(screen.getByText(/actual:/i)).toBeInTheDocument();
    expect(screen.getByText(/115 gCO2\/kWh/i)).toBeInTheDocument();
  });

  it('should have accessible article landmark with labelledby', async () => {
    await renderComponent(mockRegion);

    const article = screen.getByRole('article');
    expect(article).toHaveAttribute('aria-labelledby', 'region-1-title');
  });

  it('should emit viewDetails event when button is clicked', async () => {
    const onViewDetails = jest.fn();
    await render(RegionCardComponent, {
      componentInputs: { data: mockRegion },
      componentOutputs: { viewDetails: { emit: onViewDetails } as any },
    });

    const button = screen.getByRole('button', { name: /view details for north scotland/i });
    fireEvent.click(button);

    expect(onViewDetails).toHaveBeenCalledWith(mockRegion);
  });

  it('should have proper aria-label on view details button', async () => {
    await renderComponent(mockRegion);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute(
      'aria-label',
      'View details for North Scotland region'
    );
  });
});
