import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { NotAnotherCoachError } from '../NotAnotherCoachError';

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

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('NotAnotherCoachError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('404 Error', () => {
    it('renders 404 error with correct content', () => {
      renderWithRouter(<NotAnotherCoachError code="404" homeHref="/" />);
      
      expect(screen.getByText(/Page Not Found/i)).toBeInTheDocument();
      expect(screen.getByText(/couldn't find the page/i)).toBeInTheDocument();
    });

    it('tracks page view on mount', async () => {
      renderWithRouter(<NotAnotherCoachError code="404" homeHref="/" />);
      
      await waitFor(() => {
        expect(mockTrack).toHaveBeenCalledWith('error_page_view', {
          errorCode: '404',
          timestamp: expect.any(Number),
        });
      });
    });

    it('navigates home on primary button click', async () => {
      const user = userEvent.setup();
      renderWithRouter(<NotAnotherCoachError code="404" homeHref="/home" />);
      
      const homeButton = screen.getByRole('button', { name: /back to home/i });
      await user.click(homeButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/home');
      expect(mockTrack).toHaveBeenCalledWith('error_action_click', {
        errorCode: '404',
        actionType: 'home',
        timestamp: expect.any(Number),
      });
    });

    it('navigates to support on secondary button click', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <NotAnotherCoachError code="404" homeHref="/" supportHref="/support" />
      );
      
      const supportButton = screen.getByRole('button', { name: /contact support/i });
      await user.click(supportButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/support');
    });
  });

  describe('500 Error', () => {
    it('renders 500 error with correct content', () => {
      renderWithRouter(<NotAnotherCoachError code="500" homeHref="/" />);
      
      expect(screen.getByText(/Something Went Wrong/i)).toBeInTheDocument();
      expect(screen.getByText(/experiencing technical difficulties/i)).toBeInTheDocument();
    });

    it('calls onRetry when retry button is clicked', async () => {
      const user = userEvent.setup();
      const mockRetry = vi.fn();
      renderWithRouter(
        <NotAnotherCoachError code="500" homeHref="/" onRetry={mockRetry} />
      );
      
      const retryButton = screen.getByRole('button', { name: /try again/i });
      await user.click(retryButton);
      
      expect(mockRetry).toHaveBeenCalled();
      expect(mockTrack).toHaveBeenCalledWith('error_action_click', {
        errorCode: '500',
        actionType: 'retry',
        timestamp: expect.any(Number),
      });
    });

    it('navigates home when home button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<NotAnotherCoachError code="500" homeHref="/home" />);
      
      const homeButton = screen.getByRole('button', { name: /back to home/i });
      await user.click(homeButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });

  describe('403 Error', () => {
    it('renders 403 error with correct content', () => {
      renderWithRouter(<NotAnotherCoachError code="403" homeHref="/" />);
      
      expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
      expect(screen.getByText(/don't have permission/i)).toBeInTheDocument();
    });

    it('navigates to login on primary button click', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <NotAnotherCoachError code="403" homeHref="/" loginHref="/login" />
      );
      
      const loginButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(loginButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/login');
      expect(mockTrack).toHaveBeenCalledWith('error_action_click', {
        errorCode: '403',
        actionType: 'login',
        timestamp: expect.any(Number),
      });
    });

    it('navigates home on secondary button click', async () => {
      const user = userEvent.setup();
      renderWithRouter(<NotAnotherCoachError code="403" homeHref="/home" />);
      
      const homeButton = screen.getByRole('button', { name: /back to home/i });
      await user.click(homeButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });

  describe('Offline Error', () => {
    it('renders offline error with correct content', () => {
      renderWithRouter(<NotAnotherCoachError code="offline" homeHref="/" />);
      
      expect(screen.getByText(/No Internet Connection/i)).toBeInTheDocument();
      expect(screen.getByText(/check your internet/i)).toBeInTheDocument();
    });

    it('calls onRetry when retry button is clicked', async () => {
      const user = userEvent.setup();
      const mockRetry = vi.fn();
      renderWithRouter(
        <NotAnotherCoachError code="offline" homeHref="/" onRetry={mockRetry} />
      );
      
      const retryButton = screen.getByRole('button', { name: /try again/i });
      await user.click(retryButton);
      
      expect(mockRetry).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has accessible button labels', () => {
      renderWithRouter(<NotAnotherCoachError code="404" homeHref="/" />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });

    it('renders with proper heading hierarchy', () => {
      renderWithRouter(<NotAnotherCoachError code="404" homeHref="/" />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = renderWithRouter(
        <NotAnotherCoachError code="404" homeHref="/" className="custom-class" />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Edge Cases', () => {
    it('renders without optional props', () => {
      renderWithRouter(<NotAnotherCoachError code="404" homeHref="/" />);
      
      expect(screen.getByText(/Page Not Found/i)).toBeInTheDocument();
    });

    it('handles missing onRetry gracefully', async () => {
      const user = userEvent.setup();
      renderWithRouter(<NotAnotherCoachError code="500" homeHref="/" />);
      
      const retryButton = screen.getByRole('button', { name: /try again/i });
      
      // Should not throw error when clicking without onRetry
      await expect(user.click(retryButton)).resolves.not.toThrow();
    });

    it('handles missing secondary action href gracefully', async () => {
      const user = userEvent.setup();
      renderWithRouter(<NotAnotherCoachError code="404" homeHref="/" />);
      
      const buttons = screen.getAllByRole('button');
      
      // Should render buttons without errors
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
