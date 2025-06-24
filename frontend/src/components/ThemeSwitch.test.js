import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider } from '../state/ThemeContext';
import ThemeSwitch from './ThemeSwitch';

const renderWithThemeProvider = (component) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('ThemeSwitch Component', () => {
  test('renders with correct initial state', () => {
    renderWithThemeProvider(<ThemeSwitch />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Switch to dark theme');
    expect(button).toHaveAttribute('title', 'Switch to dark theme');
    expect(screen.getByText('☀️')).toBeInTheDocument();
  });

  test('toggles theme when clicked', () => {
    renderWithThemeProvider(<ThemeSwitch />);
    
    const button = screen.getByRole('button');
    
    // Initially should be light theme
    expect(button).toHaveAttribute('aria-label', 'Switch to dark theme');
    expect(screen.getByText('☀️')).toBeInTheDocument();
    
    // Click to toggle to dark theme
    fireEvent.click(button);
    
    // Should now be dark theme
    expect(button).toHaveAttribute('aria-label', 'Switch to light theme');
    expect(screen.getByText('🌙')).toBeInTheDocument();
  });

  test('has correct class name', () => {
    renderWithThemeProvider(<ThemeSwitch />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('theme-switch');
  });
});
