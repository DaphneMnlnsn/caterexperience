import React, { useEffect, useState } from 'react';
import './MenuChecklist.css';
import axiosClient from '../axiosClient';
import Swal from 'sweetalert2';

function MenuChecklist({ bookingId = null, items: initialItems = null, isCook }) {
  const [items, setItems] = useState(initialItems || []);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialItems && initialItems.length) {
      setItems(initialItems);
      return;
    }
    if (!bookingId) return;

    setLoading(true);
    axiosClient.get(`/bookings/${bookingId}/menu-items`)
      .then(res => {
        setItems(res.data.items || []);
      })
      .catch(err => {
        console.error('Failed to load menu items', err);
        setError('Failed to load items');
      })
      .finally(() => setLoading(false));
  }, [bookingId, initialItems]);

  const toggleComplete = (index) => {
    setItems(prev => {
      const copy = [...prev];
      const item = { ...copy[index] };
      item.status = item.status === 'completed' ? 'pending' : 'completed';
      if (item.status === 'completed') item.completed_at = new Date().toISOString();
      else item.completed_at = null;
      copy[index] = item;
      return copy;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = items.map(i => ({
        id: i.id,
        status: i.status,
      }));

      await axiosClient.put('/menu-food/batch-update', { items: payload });

      Swal.fire('Saved!', 'Checklist has been updated.', 'success');

    } catch (err) {
      setError('Failed to save changes. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatDeadline = (iso) => {
    if (!iso) return '-';
    try {
      const d = new Date(iso);
      return d.toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="menu-checklist-card">
      {loading ? <p>Loading items…</p> : (
        <table className="mc-table">
          <thead>
            <tr>
              <th>Dish</th>
              <th>Quantity</th>
              <th>Category</th>
              <th>Deadline</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="5" className="mc-empty">No items to prepare</td>
              </tr>
            ) : (
              items.map((it, idx) => (
                <tr key={it.id} className={it.status === 'completed' ? 'mc-done' : ''}>
                  <td className="mc-dish" data-label="Dish">{it.food_name}</td>
                  <td className="mc-qty" data-label="Qty">{it.quantity_label || '-'}</td>
                  <td className="mc-cat" data-label="Category">{it.category || '-'}</td>
                  <td className="mc-deadline" data-label="Deadline">{formatDeadline(it.deadline)}</td>
                  <td className="mc-check" data-label="Done">
                    <label className="mc-checkbox">
                      <input
                        type="checkbox"
                        checked={it.status === 'completed'}
                        onChange={() => {if(isCook){toggleComplete(idx)}}}
                      />
                      <span className="mc-checkmark" />
                    </label>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      <div className="mc-actions">
        {isCook && (
          <button
            className="user-save-btn"
            onClick={handleSave}
            disabled={saving || loading || items.length === 0}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        )}
      </div>

      {error && <div className="mc-error">{error}</div>}
    </div>
  );
}

export default MenuChecklist;
