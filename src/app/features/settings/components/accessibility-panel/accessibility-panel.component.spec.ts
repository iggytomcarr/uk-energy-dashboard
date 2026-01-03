import { render, screen, fireEvent } from '@testing-library/angular';
import { AccessibilityPanelComponent } from './accessibility-panel.component';
import { PreferencesStore } from '@state/preferences.store';

describe('AccessibilityPanelComponent', () => {
  const renderComponent = async () => {
    return render(AccessibilityPanelComponent, {
      providers: [PreferencesStore],
    });
  };

  it('should display accessibility settings heading', async () => {
    await renderComponent();

    expect(
      screen.getByRole('heading', { name: /accessibility settings/i })
    ).toBeInTheDocument();
  });

  it('should have high contrast toggle switch', async () => {
    await renderComponent();

    const toggle = screen.getByRole('switch', { name: /high contrast/i });
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-checked');
  });

  it('should have reduced motion toggle switch', async () => {
    await renderComponent();

    const toggle = screen.getByRole('switch', { name: /reduce motion/i });
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-describedby', 'reduced-motion-desc');
  });

  it('should have font size radio group', async () => {
    await renderComponent();

    const radioGroup = screen.getByRole('radiogroup', { name: /font size/i });
    expect(radioGroup).toBeInTheDocument();

    expect(screen.getByRole('radio', { name: /normal/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /large/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /extra large/i })).toBeInTheDocument();
  });

  it('should have reset to defaults button', async () => {
    await renderComponent();

    expect(
      screen.getByRole('button', { name: /reset to defaults/i })
    ).toBeInTheDocument();
  });

  it('should toggle high contrast when switch is clicked', async () => {
    await renderComponent();

    const toggle = screen.getByRole('switch', { name: /high contrast/i });
    expect(toggle).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('should have descriptive text for each setting', async () => {
    await renderComponent();

    expect(
      screen.getByText(/increases contrast for better visibility/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/minimises animations and transitions/i)
    ).toBeInTheDocument();
  });
});
