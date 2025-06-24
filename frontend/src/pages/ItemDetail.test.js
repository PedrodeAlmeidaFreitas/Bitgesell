import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ItemDetail from './ItemDetail';

// Mock fetch
global.fetch = jest.fn();

describe('ItemDetail Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders loading state initially', () => {
    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={['/items/1']}>
        <ItemDetail />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders item details when data loads successfully', async () => {
    const mockItem = {
      id: 1,
      name: 'Test Item',
      description: 'Test Description',
      price: 29.99
    };
    
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockItem)
    });
    
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={['/items/1']}>
        <ItemDetail />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });

  test('renders error message when fetch fails', async () => {
    fetch.mockRejectedValue(new Error('Network error'));
    
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={['/items/1']}>
        <ItemDetail />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Error loading item')).toBeInTheDocument();
    });
  });

  test('renders not found message when item does not exist', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 404
    });
    
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={['/items/1']}>
        <ItemDetail />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Item not found')).toBeInTheDocument();
    });
  });
});
