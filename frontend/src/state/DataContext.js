import PropTypes from "prop-types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const abortControllerRef = useRef(null);

  const fetchItems = useCallback(async (signal, options = {}) => {
    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a new controller for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Use the provided signal or our controller's signal
    const requestSignal = signal || controller.signal;

    setLoading(true);

    try {
      // Build query string from options
      const params = new URLSearchParams();
      if (options.limit !== undefined) params.append("limit", options.limit);
      if (options.offset !== undefined) params.append("offset", options.offset);
      if (options.q !== undefined) params.append("q", options.q);

      const queryString = params.toString();
      const url = `http://localhost:3001/api/items?${queryString}`;

      const response = await fetch(url, { signal: requestSignal });

      // Handle both real fetch responses and test mocks
      if (response.ok === false) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setItems(data);
    } catch (error) {
      // Don't update items on error (including abort errors)
      if (error.name !== "AbortError") {
        console.error("Failed to fetch items:", error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const addSelectedItem = useCallback((item) => {
    setSelectedItems((prev) => {
      // Prevent duplicates
      if (prev.find((selected) => selected.id === item.id)) {
        return prev;
      }
      return [...prev, item];
    });
  }, []);

  const removeSelectedItem = useCallback((id) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearSelectedItems = useCallback(() => {
    setSelectedItems([]);
  }, []);

  // Auto-fetch items on mount
  useEffect(() => {
    const controller = new AbortController();
    fetchItems(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchItems]);

  const value = useMemo(
    () => ({
      items,
      loading,
      selectedItems,
      fetchItems,
      addSelectedItem,
      removeSelectedItem,
      clearSelectedItems,
    }),
    [
      items,
      loading,
      selectedItems,
      fetchItems,
      addSelectedItem,
      removeSelectedItem,
      clearSelectedItems,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

DataProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default { DataProvider, useData };
