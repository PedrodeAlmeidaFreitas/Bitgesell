import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FixedSizeList as List } from 'react-window';
import ItemCard from '../components/ItemCard';
import ThemeSwitch from '../components/ThemeSwitch';
import { useData } from '../state/DataContext';
import '../styles.css';

const PAGE_SIZE = 20;
const ITEM_HEIGHT = 48;

function ItemRow({ index, style, data }) {
  const item = data.items[index];
  const { addSelectedItem, selectedItems } = data.context;
  const isSelected = selectedItems.find(selected => selected.id === item.id);
  
  const handleClick = (e) => {
    e.preventDefault();
    addSelectedItem(item);
  };
  
  return (
    <div style={style} className={`item-row ${isSelected ? 'item-row-selected' : ''}`}>
      <Link 
        to={'/items/' + item.id} 
        className="item-link"
        onClick={handleClick}
      >
        {item.name} {isSelected && '✓'}
      </Link>
    </div>
  );
}

function SkeletonRow({ index, style }) {
  return (
    <div style={style} className="skeleton-item">
      <div className="skeleton-text"></div>
    </div>
  );
}

function Items() {
  const { items, fetchItems, loading, selectedItems, clearSelectedItems, removeSelectedItem } = useData();
  const [page, setPage] = useState(0);
  const [q, setQ] = useState('');

  useEffect(() => {
    const controller = new window.AbortController();
    fetchItems(controller.signal, { limit: PAGE_SIZE, offset: page * PAGE_SIZE, q: q || undefined }).catch(() => {});
    return () => controller.abort();
  }, [fetchItems, page, q]);

  const skeletonItems = Array(PAGE_SIZE).fill(null);
  const itemsWithContext = { items, context: { addSelectedItem: useData().addSelectedItem, selectedItems } };

  return (
    <div className="container">
      <ThemeSwitch />
      <div className="app-header">
        <h1>Items</h1>
      </div>
      
      {selectedItems.length > 0 && (
        <div className="selected-items">
          <h3>Selected Items ({selectedItems.length})</h3>
          <div className="selected-items-grid">
            {selectedItems.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onRemove={removeSelectedItem}
                compact={true}
              />
            ))}
          </div>
          <button onClick={clearSelectedItems} className="clear-button">
            Clear All Selection
          </button>
        </div>
      )}
      
      <input
        type="text"
        placeholder="Search items..."
        value={q}
        onChange={e => { setQ(e.target.value); setPage(0); }}
        aria-label="Search items"
        className="search-input"
      />
      <div className="items-list" style={{ height: Math.min((loading ? skeletonItems : items).length * ITEM_HEIGHT, 400) }}>
        {loading ? (
          <List
            height={Math.min(skeletonItems.length * ITEM_HEIGHT, 400)}
            itemCount={skeletonItems.length}
            itemSize={ITEM_HEIGHT}
          >
            {SkeletonRow}
          </List>
        ) : (
          <List
            height={Math.min(items.length * ITEM_HEIGHT, 400)}
            itemCount={items.length}
            itemSize={ITEM_HEIGHT}
            itemData={itemsWithContext}
          >
            {ItemRow}
          </List>
        )}
      </div>
      <div className="pagination">
        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0 || loading}>
          Previous
        </button>
        <span>Page {page + 1}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={items.length < PAGE_SIZE || loading}>
          Next
        </button>
      </div>
    </div>
  );
}

export default Items;