import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from '../ErrorBoundary';

// Suppress console errors in tests
const originalError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalError;
});

const ThrowError = ({ error }: { error: Error }) => {
  throw error;
};

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when there is no error', () => {
    renderWithRouter(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders 500 error page when error occurs', () => {
    renderWithRouter(
      <ErrorBoundary>
        <ThrowError error={new Error('Test error')} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/Something Went Wrong/i)).toBeInTheDocument();
  });

  it('renders offline error when navigator is offline', () => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    renderWithRouter(
      <ErrorBoundary>
        <ThrowError error={new Error('Network error')} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/No Internet Connection/i)).toBeInTheDocument();

    // Reset
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  it('calls onError callback when error occurs', () => {
    const onError = vi.fn();
    
    renderWithRouter(
      <ErrorBoundary onError={onError}>
        <ThrowError error={new Error('Test error')} />
      </ErrorBoundary>
    );
    
    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  it('renders custom fallback when provided', () => {
    const fallback = <div>Custom Error Fallback</div>;
    
    renderWithRouter(
      <ErrorBoundary fallback={fallback}>
        <ThrowError error={new Error('Test error')} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Custom Error Fallback')).toBeInTheDocument();
  });

  it('resets error state when retry is clicked', async () => {
    const user = userEvent.setup();
    let shouldThrow = true;
    
    const ConditionalError = () => {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <div>Success</div>;
    };
    
    const { rerender } = renderWithRouter(
      <ErrorBoundary>
        <ConditionalError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/Something Went Wrong/i)).toBeInTheDocument();
    
    shouldThrow = false;
    const retryButton = screen.getByRole('button', { name: /try again/i });
    await user.click(retryButton);
    
    rerender(
      <BrowserRouter>
        <ErrorBoundary>
          <ConditionalError />
        </ErrorBoundary>
      </BrowserRouter>
    );
    
    expect(screen.getByText('Success')).toBeInTheDocument();
  });

  it('logs error to console', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    renderWithRouter(
      <ErrorBoundary>
        <ThrowError error={new Error('Test error')} />
      </ErrorBoundary>
    );
    
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

describe('TrainerDataErrorBoundary', () => {
  it('renders children when there is no error', () => {
    const { TrainerDataErrorBoundary } = require('../ErrorBoundary');
    
    render(
      <TrainerDataErrorBoundary>
        <div>Trainer Data</div>
      </TrainerDataErrorBoundary>
    );
    
    expect(screen.getByText('Trainer Data')).toBeInTheDocument();
  });

  it('renders custom fallback on error', () => {
    const { TrainerDataErrorBoundary } = require('../ErrorBoundary');
    
    render(
      <TrainerDataErrorBoundary>
        <ThrowError error={new Error('Trainer data error')} />
      </TrainerDataErrorBoundary>
    );
    
    expect(screen.getByText(/Failed to load trainer data/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });
});
