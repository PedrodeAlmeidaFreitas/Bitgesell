import "@testing-library/jest-dom";
import { act, render, screen, waitFor } from "@testing-library/react";
import { DataProvider, useData } from "./DataContext";

// Mock fetch
global.fetch = jest.fn();

// Test component to interact with data context
const TestComponent = () => {
  const {
    items,
    loading,
    selectedItems,
    fetchItems,
    addSelectedItem,
    removeSelectedItem,
    clearSelectedItems,
  } = useData();

  return (
    <div>
      <div data-testid="loading">{loading ? "Loading" : "Not Loading"}</div>
      <div data-testid="items-count">{items.length}</div>
      <div data-testid="selected-count">{selectedItems.length}</div>

      <button onClick={() => fetchItems()} data-testid="fetch-button">
        Fetch Items
      </button>

      <button
        onClick={() =>
          addSelectedItem({ id: 1, name: "Test Item", price: 9.99 })
        }
        data-testid="add-button"
      >
        Add Item
      </button>

      <button onClick={() => removeSelectedItem(1)} data-testid="remove-button">
        Remove Item
      </button>

      <button onClick={() => clearSelectedItems()} data-testid="clear-button">
        Clear Items
      </button>

      {/* Display items */}
      {items.map((item) => (
        <div key={item.id} data-testid={`item-${item.id}`}>
          {item.name}
        </div>
      ))}

      {/* Display selected items */}
      {selectedItems.map((item) => (
        <div key={item.id} data-testid={`selected-${item.id}`}>
          {item.name}
        </div>
      ))}
    </div>
  );
};

// Test component without provider (for error testing)
const TestComponentWithoutProvider = () => {
  try {
    const { items } = useData();
    return <div data-testid="items-count">{items.length}</div>;
  } catch (error) {
    return <div data-testid="error">{error.message}</div>;
  }
};

describe("DataContext", () => {
  const mockItems = [
    { id: 1, name: "Apple", price: 1.99 },
    { id: 2, name: "Banana", price: 0.99 },
  ];

  beforeEach(() => {
    fetch.mockClear();
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockItems),
    });
  });

  test("provides initial state correctly", () => {
    render(
      <DataProvider>
        <TestComponent />
      </DataProvider>
    );

    // Initially should be loading with empty items and selectedItems
    expect(screen.getByTestId("loading")).toHaveTextContent("Loading");
    expect(screen.getByTestId("items-count")).toHaveTextContent("0");
    expect(screen.getByTestId("selected-count")).toHaveTextContent("0");
  });

  test("fetches items on mount", async () => {
    render(
      <DataProvider>
        <TestComponent />
      </DataProvider>
    );

    // Should start loading
    expect(screen.getByTestId("loading")).toHaveTextContent("Loading");

    // Wait for fetch to complete
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("Not Loading");
    });

    // Should have loaded items
    expect(screen.getByTestId("items-count")).toHaveTextContent("2");
    expect(screen.getByTestId("item-1")).toHaveTextContent("Apple");
    expect(screen.getByTestId("item-2")).toHaveTextContent("Banana");
  });

  test("adds selected items", async () => {
    render(
      <DataProvider>
        <TestComponent />
      </DataProvider>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("Not Loading");
    });

    // Add an item
    act(() => {
      screen.getByTestId("add-button").click();
    });

    expect(screen.getByTestId("selected-count")).toHaveTextContent("1");
    expect(screen.getByTestId("selected-1")).toHaveTextContent("Test Item");
  });

  test("prevents duplicate selected items", async () => {
    render(
      <DataProvider>
        <TestComponent />
      </DataProvider>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("Not Loading");
    });

    // Add same item twice
    act(() => {
      screen.getByTestId("add-button").click();
      screen.getByTestId("add-button").click();
    });

    // Should only have one item
    expect(screen.getByTestId("selected-count")).toHaveTextContent("1");
  });

  test("removes selected items", async () => {
    render(
      <DataProvider>
        <TestComponent />
      </DataProvider>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("Not Loading");
    });

    // Add then remove an item
    act(() => {
      screen.getByTestId("add-button").click();
    });

    expect(screen.getByTestId("selected-count")).toHaveTextContent("1");

    act(() => {
      screen.getByTestId("remove-button").click();
    });

    expect(screen.getByTestId("selected-count")).toHaveTextContent("0");
    expect(screen.queryByTestId("selected-1")).not.toBeInTheDocument();
  });

  test("clears all selected items", async () => {
    render(
      <DataProvider>
        <TestComponent />
      </DataProvider>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("Not Loading");
    });

    // Add an item then clear
    act(() => {
      screen.getByTestId("add-button").click();
    });

    expect(screen.getByTestId("selected-count")).toHaveTextContent("1");

    act(() => {
      screen.getByTestId("clear-button").click();
    });

    expect(screen.getByTestId("selected-count")).toHaveTextContent("0");
  });

  test("handles fetch errors gracefully", async () => {
    fetch.mockRejectedValue(new Error("Network error"));

    render(
      <DataProvider>
        <TestComponent />
      </DataProvider>
    );

    // Should start loading
    expect(screen.getByTestId("loading")).toHaveTextContent("Loading");

    // Wait for error to be handled
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("Not Loading");
    });

    // Items should remain empty on error
    expect(screen.getByTestId("items-count")).toHaveTextContent("0");
  });

  test("throws error when useData is used outside DataProvider", () => {
    render(<TestComponentWithoutProvider />);

    expect(screen.getByTestId("error")).toHaveTextContent(
      "useData must be used within a DataProvider"
    );
  });

  test("handles manual fetch", async () => {
    const newItems = [{ id: 3, name: "Orange", price: 1.49 }];

    render(
      <DataProvider>
        <TestComponent />
      </DataProvider>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("Not Loading");
    });

    // Mock new fetch response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(newItems),
    });

    // Trigger manual fetch
    act(() => {
      screen.getByTestId("fetch-button").click();
    });

    // Should show loading again
    expect(screen.getByTestId("loading")).toHaveTextContent("Loading");

    // Wait for new data
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("Not Loading");
    });

    expect(screen.getByTestId("items-count")).toHaveTextContent("1");
    expect(screen.getByTestId("item-3")).toHaveTextContent("Orange");
  });
});
