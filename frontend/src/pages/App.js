import { Link, Route, Routes } from 'react-router-dom';
import { DataProvider } from '../state/DataContext';
import { ThemeProvider } from '../state/ThemeContext';
import ItemDetail from './ItemDetail';
import Items from './Items';

function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <nav className="nav">
          <Link to="/">Items</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Items />} />
          <Route path="/items/:id" element={<ItemDetail />} />
        </Routes>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;