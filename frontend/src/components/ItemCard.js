
function ItemCard({ item, onRemove, compact = false }) {
  if (compact) {
    return (
      <div className="item-card-compact">
        <div className="item-card-content">
          <h4>{item.name}</h4>
          <span className="item-price">${item.price}</span>
        </div>
        {onRemove && (
          <button onClick={() => onRemove(item.id)} className="remove-button">
            ×
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="item-card">
      <div className="item-card-content">
        <h3>{item.name}</h3>
        {item.description && <p>{item.description}</p>}
        {item.category && <p><strong>Category:</strong> {item.category}</p>}
        <p><strong>Price:</strong> ${item.price.toFixed(2)}</p>
      </div>
      {onRemove && (
        <button onClick={() => onRemove(item)} className="remove-button">
          Remove
        </button>
      )}
    </div>
  );
}

export default ItemCard;
