import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';

// Test component to interact with theme context
const ThemeTestComponent = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div>
      <div data-testid="current-theme">{theme}</div>
      <button onClick={toggleTheme} data-testid="toggle-button">
        Toggle Theme
      </button>
    </div>
  );
};

// Component to test theme context outside provider
const ThemeTestWithoutProvider = () => {
  try {
    const { theme } = useTheme();
    return <div>{theme}</div>;
  } catch (error) {
    return <div data-testid="error">{error.message}</div>;
  }
};

describe('ThemeContext', () => {
  beforeEach(() => {
    // Clear localStorage and reset DOM
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    
    // Mock matchMedia for system theme detection
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  test('provides default light theme', () => {
    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
  });

  test('loads theme from localStorage if available', () => {
    localStorage.setItem('theme', 'dark');
    
    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
  });

  test('detects system dark theme preference when no localStorage', () => {
    // Mock system preference for dark theme
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
    
    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
  });

  test('toggles theme from light to dark', () => {
    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    );
    
    const toggleButton = screen.getByTestId('toggle-button');
    const themeDisplay = screen.getByTestId('current-theme');
    
    // Initially light
    expect(themeDisplay).toHaveTextContent('light');
    
    // Toggle to dark
    act(() => {
      toggleButton.click();
    });
    
    expect(themeDisplay).toHaveTextContent('dark');
  });

  test('toggles theme from dark to light', () => {
    localStorage.setItem('theme', 'dark');
    
    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    );
    
    const toggleButton = screen.getByTestId('toggle-button');
    const themeDisplay = screen.getByTestId('current-theme');
    
    // Initially dark
    expect(themeDisplay).toHaveTextContent('dark');
    
    // Toggle to light
    act(() => {
      toggleButton.click();
    });
    
    expect(themeDisplay).toHaveTextContent('light');
  });

  test('persists theme changes to localStorage', () => {
    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    );
    
    const toggleButton = screen.getByTestId('toggle-button');
    
    // Toggle to dark
    act(() => {
      toggleButton.click();
    });
    
    expect(localStorage.getItem('theme')).toBe('dark');
    
    // Toggle to light
    act(() => {
      toggleButton.click();
    });
    
    expect(localStorage.getItem('theme')).toBe('light');
  });

  test('applies data-theme attribute to document element', () => {
    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    );
    
    const toggleButton = screen.getByTestId('toggle-button');
    
    // Initially light (should have data-theme set)
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    
    // Toggle to dark
    act(() => {
      toggleButton.click();
    });
    
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    
    // Toggle back to light
    act(() => {
      toggleButton.click();
    });
    
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  test('throws error when useTheme is used outside ThemeProvider', () => {
    render(<ThemeTestWithoutProvider />);
    
    expect(screen.getByTestId('error')).toHaveTextContent(
      'useTheme must be used within a ThemeProvider'
    );
  });

  test('handles system theme change events', () => {
    // Clear localStorage to ensure no preference is stored
    localStorage.removeItem('theme');
    
    let mediaQueryCallback;
    
    // Mock matchMedia with event listener support
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn((event, callback) => {
        if (event === 'change') {
          mediaQueryCallback = callback;
        }
      }),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
    
    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    );
    
    const themeDisplay = screen.getByTestId('current-theme');
    
    // Simulate system theme change to dark
    if (mediaQueryCallback) {
      act(() => {
        mediaQueryCallback({ matches: true });
      });
    }
    
    // Should change to dark since no localStorage preference exists
    expect(themeDisplay).toHaveTextContent('dark');
  });
});
