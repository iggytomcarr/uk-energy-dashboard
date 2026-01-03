import { render, screen } from '@testing-library/angular';
import { LoadingSkeletonComponent } from './loading-skeleton.component';

describe('LoadingSkeletonComponent', () => {
  it('should render with status role and aria-busy', async () => {
    await render(LoadingSkeletonComponent);

    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveAttribute('aria-busy', 'true');
  });

  it('should have accessible loading message for screen readers', async () => {
    await render(LoadingSkeletonComponent);

    expect(
      screen.getByText(/loading content, please wait/i)
    ).toHaveClass('sr-only');
  });

  it('should render card skeleton type', async () => {
    const { container } = await render(LoadingSkeletonComponent, {
      componentInputs: { type: 'card' },
    });

    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveAttribute('aria-label', 'Loading card');
    expect(container.querySelector('.bg-white.rounded-lg')).toBeInTheDocument();
  });

  it('should render badge skeleton type', async () => {
    const { container } = await render(LoadingSkeletonComponent, {
      componentInputs: { type: 'badge' },
    });

    expect(container.querySelector('.rounded-full')).toBeInTheDocument();
  });

  it('should render chart skeleton type', async () => {
    const { container } = await render(LoadingSkeletonComponent, {
      componentInputs: { type: 'chart' },
    });

    // Chart skeleton has a circular element for the donut
    expect(container.querySelector('.rounded-full.w-48')).toBeInTheDocument();
  });

  it('should have pulse animation class', async () => {
    await render(LoadingSkeletonComponent);

    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveClass('animate-pulse');
  });
});
