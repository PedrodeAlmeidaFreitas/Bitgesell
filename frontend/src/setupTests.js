// src/setupTests.js
// Automatically imported by Create React App to set up tests

// Extend jest DOM matchers
import "@testing-library/jest-dom";

// Silence console.error and console.warn during tests to avoid noisy output
let consoleErrorSpy;
let consoleWarnSpy;

beforeEach(() => {
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
  consoleWarnSpy.mockRestore();
});
