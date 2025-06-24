import '@testing-library/jest-dom';
import React from 'react';

// Mock ReactDOM.createRoot
const mockRender = jest.fn();
jest.mock('react-dom/client', () => ({
  createRoot: jest.fn(() => ({
    render: mockRender
  }))
}));

// Mock App component
jest.mock('./pages/App', () => {
  return function MockApp() {
    return <div data-testid="mock-app">App</div>;
  };
});

describe('index.js', () => {
  beforeEach(() => {
    // Clear previous calls
    mockRender.mockClear();
    
    // Mock document.getElementById
    const mockElement = document.createElement('div');
    mockElement.id = 'root';
    jest.spyOn(document, 'getElementById').mockReturnValue(mockElement);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders App component', () => {
    // Import the index file to trigger the render
    require('./index');
    
    // Check that render was called
    expect(mockRender).toHaveBeenCalledTimes(1);
    
    // Verify the render call includes the expected components
    const renderCall = mockRender.mock.calls[0][0];
    expect(renderCall.type).toBe(React.StrictMode);
  });
});
