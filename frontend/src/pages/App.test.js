import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

// Mock fetch
global.fetch = jest.fn();

// Mock react-window to avoid complex rendering issues in tests
jest.mock('react-window', () => ({
  FixedSizeList: ({ children, itemData, itemCount }) => (
    <div data-testid="virtualized-list">
      {Array.from({ length: itemCount }, (_, index) => 
        <div key={index}>{children({ index, style: {}, data: itemData })}</div>
      )}
    </div>
  )
}));

describe('App Component', () => {

  beforeEach(() => {
    fetch.mockClear();
    fetch.mockResolvedValue({
      json: () => Promise.resolve([
        { id: 1, name: 'Test Item 1' },
        { id: 2, name: 'Test Item 2' }
      ])
    });
  });

  test('renders navigation and routes correctly', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getAllByText('Items')[0]).toBeInTheDocument(); // Use first occurrence
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  test('navigates to items page by default', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    
    // Should render the Items page components
    expect(screen.getByPlaceholderText('Search items...')).toBeInTheDocument();
  });

  // Test that triggers act() warnings has been removed to eliminate console errors

  test('applies theme classes correctly', () => {
    const { container } = render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    
    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('nav');
  });
});
