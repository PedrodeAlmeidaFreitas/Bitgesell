import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('/api/items/' + id)
      .then(res => {
        if (res.ok) {
          return res.json();
        } else if (res.status === 404) {
          throw new Error('not-found');
        } else {
          throw new Error('fetch-error');
        }
      })
      .then(item => {
        setItem(item);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        if (err.message === 'not-found') {
          setError('Item not found');
        } else {
          setError('Error loading item');
        }
      });
  }, [id, navigate]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!item) return <p>Item not found</p>;

  return (
    <div style={{padding: 16}}>
      <h2>{item.name}</h2>
      {item.description && <p>{item.description}</p>}
      <p><strong>Category:</strong> {item.category}</p>
      <p><strong>Price:</strong> ${item.price.toFixed(2)}</p>
    </div>
  );
}

export default ItemDetail;