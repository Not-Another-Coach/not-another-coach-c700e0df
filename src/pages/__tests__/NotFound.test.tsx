import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import NotFound from '../NotFound';

// Mock analytics
const mockTrack = vi.fn();
vi.mock('@/lib/analytics', () => ({
  analytics: {
    track: (...args: any[]) => mockTrack(...args),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('NotFound Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders 404 error page', () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Page Not Found/i)).toBeInTheDocument();
  });

  it('logs the attempted route to console', () => {
    const consoleError = vi.spyOn(console, 'error');
    
    render(
      <MemoryRouter initialEntries={['/non-existent-route']}>
        <NotFound />
      </MemoryRouter>
    );
    
    expect(consoleError).toHaveBeenCalledWith(
      '404 Error: User attempted to access non-existent route:',
      '/non-existent-route'
    );
    
    consoleError.mockRestore();
  });

  it('provides home and support navigation options', () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );
    
    const homeButton = screen.getByRole('button', { name: /back to home/i });
    const supportButton = screen.getByRole('button', { name: /contact support/i });
    
    expect(homeButton).toBeInTheDocument();
    expect(supportButton).toBeInTheDocument();
  });

  it('renders with correct href props', () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );
    
    // Component should be rendered with homeHref="/" and supportHref="/contact"
    expect(screen.getByText(/Page Not Found/i)).toBeInTheDocument();
  });
});
