import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../state/ThemeContext';
import ItemCard from './ItemCard';

const mockItem = {
  id: 1,
  name: 'Test Item',
  description: 'Test Description',
  price: 29.99,
  category: 'Test Category'
};

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeProvider>
        {component}
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('ItemCard Component', () => {
  const mockOnRemove = jest.fn();

  beforeEach(() => {
    mockOnRemove.mockClear();
  });

  test('renders item information correctly', () => {
    renderWithProviders(
      <ItemCard item={mockItem} onRemove={mockOnRemove} />
    );
    
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByText('Category:')).toBeInTheDocument();
    expect(screen.getByText('Test Category')).toBeInTheDocument();
  });

  test('renders compact version when compact prop is true', () => {
    renderWithProviders(
      <ItemCard item={mockItem} onRemove={mockOnRemove} compact />
    );
    
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    // In compact mode, description should not be shown
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });

  test('calls onRemove when remove button is clicked', () => {
    renderWithProviders(
      <ItemCard item={mockItem} onRemove={mockOnRemove} />
    );
    
    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);
    
    expect(mockOnRemove).toHaveBeenCalledWith(mockItem);
  });

  test('applies correct CSS classes for full card', () => {
    const { container } = renderWithProviders(
      <ItemCard item={mockItem} onRemove={mockOnRemove} />
    );
    
    const card = container.querySelector('.item-card');
    expect(card).toBeInTheDocument();
    expect(card).not.toHaveClass('item-card-compact');
  });

  test('applies correct CSS classes for compact card', () => {
    const { container } = renderWithProviders(
      <ItemCard item={mockItem} onRemove={mockOnRemove} compact />
    );
    
    const card = container.querySelector('.item-card-compact');
    expect(card).toBeInTheDocument();
    expect(card).not.toHaveClass('item-card');
  });

  test('handles missing optional fields gracefully', () => {
    const minimalItem = {
      id: 2,
      name: 'Minimal Item',
      price: 15.50
    };
    
    renderWithProviders(
      <ItemCard item={minimalItem} onRemove={mockOnRemove} />
    );
    
    expect(screen.getByText('Minimal Item')).toBeInTheDocument();
    expect(screen.getByText('$15.50')).toBeInTheDocument();
    // Should not crash when description or category is missing
  });
});
