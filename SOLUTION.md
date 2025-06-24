# SOLUTION.md

## Take-Home Assessment Solution

This document describes the approach and trade-offs made while refactoring, optimizing, and fixing the intentional issues in this project.

## Backend (Node.js) Improvements

### 1. Refactored Blocking I/O
**Problem**: `src/routes/items.js` used `fs.readFileSync`, blocking the event loop.

**Solution**: 
- Replaced `fs.readFileSync` with `fs.promises.readFile`
- Updated route handlers to use `async/await`
- Maintained error handling with try/catch blocks

**Trade-offs**: Minimal performance overhead for promise handling, but significant improvement in non-blocking behavior.

### 2. Performance Optimization for `/api/stats`
**Problem**: Stats were recalculated on every request, causing unnecessary CPU usage.

**Solution**:
- Implemented in-memory caching of calculated stats
- Added file watching using `fs.watchFile` to invalidate cache when data changes
- Utilized the existing `mean` utility from `utils/stats.js`
- Added fallback recalculation if cache is empty

**Trade-offs**: 
- Small memory overhead for caching
- File watcher adds slight complexity but provides real-time updates
- Race conditions possible but acceptable for this use case

### 3. Unit Testing
**Added**: Comprehensive Jest tests for items routes covering:
- Happy path scenarios (GET all items, filtered items, item by ID)
- Error cases (404 for missing items)
- Query parameter handling (limit, search)

**Trade-offs**: Test setup includes file system manipulation, which could be slow for large test suites.

## Frontend (React) Improvements

### 1. Memory Leak Fix
**Problem**: `Items.js` could call `setState` after component unmount if fetch was slow.

**Solution**:
- Implemented `AbortController` to cancel fetch requests on unmount
- Updated `DataContext` to support abort signals
- Ensured proper cleanup in `useEffect`

**Trade-offs**: Slightly more complex code, but prevents memory leaks and console warnings.

### 2. Pagination & Search
**Implementation**:
- **Backend**: Enhanced `/api/items` with `limit`, `offset`, and `q` parameters
- **Frontend**: Added pagination controls and search input
- **Server-side**: Search and pagination handled on backend for better performance

**Trade-offs**: 
- More complex URL parameter handling
- Server-side pagination means total count isn't available (could be added with separate endpoint)

### 3. Performance with Virtualization
**Solution**: Integrated `react-window` for efficient rendering of large lists.

**Features**:
- Only renders visible items in viewport
- Fixed item height for consistent performance
- Skeleton loading states during data fetches

**Trade-offs**:
- Additional dependency
- Fixed height requirements limit styling flexibility
- More complex component structure

### 4. UI/UX Polish
**Improvements**:
- Modern CSS styling with hover effects and focus states
- Skeleton loading animations for better UX
- Responsive design considerations
- Accessibility improvements (aria-labels, semantic HTML)
- Professional color scheme and typography

**Trade-offs**: Additional CSS increases bundle size, but improves user experience significantly.

## Testing Strategy

### Backend
- **Tool**: Jest with Supertest
- **Coverage**: Route handlers, error cases, query parameters
- **Approach**: Integration tests with real file system operations

### Frontend  
- **Tool**: React Testing Library with Jest
- **Coverage**: Component rendering, user interactions
- **Mocking**: react-window and fetch for reliable tests

## Architecture Decisions

### Data Flow
- Maintained existing context-based state management
- Added loading states and error handling
- Implemented proper cleanup patterns

### Performance Considerations
- **Backend**: File-based caching with change detection
- **Frontend**: Virtualization for large datasets
- **Network**: Server-side pagination reduces payload size

### Scalability Notes
- Current file-based approach works for small datasets
- For production: consider database with proper indexing
- Cache invalidation strategy suitable for single-server deployment
- WebSocket connections could improve real-time updates

## Trade-offs Summary

**Prioritized**:
- User experience and performance
- Code maintainability and readability
- Proper error handling and edge cases

**Deprioritized**:
- Complex caching strategies (kept simple file watching)
- Advanced testing patterns (focused on core functionality)
- Mobile-specific optimizations (desktop-first approach)

## Future Improvements

1. **Database Integration**: Replace file-based storage with proper database
2. **Real-time Updates**: WebSocket integration for live data updates  
3. **Advanced Caching**: Redis or similar for distributed caching
4. **Monitoring**: Add logging and performance metrics
5. **Security**: Input validation, rate limiting, CORS configuration
6. **Accessibility**: Full WCAG compliance, keyboard navigation
7. **Mobile UX**: Touch-friendly interactions, responsive breakpoints

The solution balances immediate improvements with maintainable, scalable code that addresses all stated objectives while providing a solid foundation for future enhancements.
