import React, { useEffect, useState, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import DatabaseInterface from '../db/DatabaseInterface';
import MenuSessionInterface from '../db/MenuSessionInterface';
import './UpdateMenu.css';

export default function UpdateMenu() {
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  function validateItem(item) {
    if (!item) return {};
    const errs = {};
    const name = (item.name ?? '').trim();
    const description = (item.description ?? '').trim();
    const allergens = (item.allergens ?? '').trim();
    const price = (item.price ?? '').toString().trim();

    if (!name) {
      errs.name = 'Give this item a name.';
    }
    if (!description) {
      errs.description = 'Add a short description so guests know what to expect.';
    }
    if (!allergens) {
      errs.allergens = 'List key allergens or "None" if there are no concerns.';
    }
    if (!price) {
      errs.price = 'Enter a price using two decimal places (e.g., 9.50).';
    } else if (!/^\d+(\.\d{2})$/.test(price)) {
      errs.price = 'Use a number with two decimal places (e.g., 9.50).';
    }
    if (typeof item.available !== 'boolean') {
      errs.available = 'Mark this dish as available or unavailable.';
    }

    return errs;
  }

  function updateValidationForItem(item) {
    if (!item) return {};
    const validation = validateItem(item);
    setErrors((prev) => {
      const next = { ...prev };
      if (Object.keys(validation).length) next[item.id] = validation;
      else delete next[item.id];
      return next;
    });
    return validation;
  }

  useEffect(() => {
    DatabaseInterface.getRestaurantInfo()
      .then((info) => setRestaurantInfo(info))
      .catch(() => {});
    MenuSessionInterface.getMenuItems().then((list) => {
      setItems(list);
      setSelectedIndex(list.length ? 0 : null);
      setErrors(() => {
        const initial = {};
        list.forEach((item) => {
          const validation = validateItem(item);
          if (Object.keys(validation).length) {
            initial[item.id] = validation;
          }
        });
        return initial;
      });
    });
  }, []);

  function addNewItem() {
    MenuSessionInterface.createMenuItem().then((newItem) => {
      setItems((prev) => {
        const next = [...prev, { ...newItem }];
        setSelectedIndex(next.length - 1);
        return next;
      });
      updateValidationForItem(newItem);
    });
  }

  function selectIndex(i) {
    setSelectedIndex(i);
  }

  function updateField(idx, key, value) {
    let updatedItem;
    setItems((prev) => {
      const copy = [...prev];
      const current = copy[idx] ?? {};
      updatedItem = { ...current, [key]: value };
      copy[idx] = updatedItem;
      return copy;
    });
    if (updatedItem) {
      updateValidationForItem(updatedItem);
    }
  }

  function handleFileSelect(e, idx) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file.');
      return;
    }

    setItems((prev) => {
      const copy = [...prev];
      if (copy[idx] && copy[idx].imageUrl) {
        try { URL.revokeObjectURL(copy[idx].imageUrl); } catch (ex) {}
      }
      const url = URL.createObjectURL(file);
      copy[idx] = { ...copy[idx], imageFile: file, imageUrl: url };
      return copy;
    });
  }

  function removeImage(idx) {
    setItems((prev) => {
      const copy = [...prev];
      if (copy[idx] && copy[idx].imageUrl) {
        try { URL.revokeObjectURL(copy[idx].imageUrl); } catch (ex) {}
      }
      copy[idx] = { ...copy[idx], imageFile: null, imageUrl: null };
      return copy;
    });
  }

  /* ---------- Price input helpers ---------- */

  // Keep only digits and a single decimal point; limit decimal places to 2
  function sanitizePriceString(s) {
    if (s == null) return '';
    s = String(s).trim();
    // remove anything except digits and dot
    s = s.replace(/[^0-9.]/g, '');
    // collapse multiple dots: keep first, remove rest
    const parts = s.split('.');
    if (parts.length === 1) {
      return parts[0];
    }
    const integer = parts.shift();
    const decimal = parts.join(''); // concatenate any extra fragments
    return integer + '.' + decimal.slice(0, 2); // limit to 2 decimals
  }

  // Called on every input change for price (prevents non-number characters from appearing)
  function handlePriceChange(idx, rawValue) {
    const sanitized = sanitizePriceString(rawValue);
    updateField(idx, 'price', sanitized);
  }

  // Prevent typing non-numeric keys (allow navigation/editing keys and one dot)
  function handlePriceKeyDown(e) {
    const allowedControlKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'
    ];
    if (e.ctrlKey || e.metaKey || allowedControlKeys.includes(e.key)) {
      return; // allow copy/paste/undo/arrow navigation
    }
    // allow digits
    if (/^[0-9]$/.test(e.key)) return;
    // allow one dot
    if (e.key === '.') {
      // don't allow second dot
      const current = e.target.value || '';
      if (current.includes('.')) {
        e.preventDefault();
      }
      return;
    }
    // otherwise block the key
    e.preventDefault();
  }

  // On blur, format to two decimals if value is numeric
  function handlePriceBlur(idx) {
    const v = items[idx]?.price ?? '';
    if (v === '') return;
    const parsed = parseFloat(v);
    if (Number.isFinite(parsed)) {
      // If input is like "9" -> show "9.00", "9.5" -> "9.50", "9.123" -> "9.12"
      updateField(idx, 'price', parsed.toFixed(2));
    } else {
      updateField(idx, 'price', '');
    }
  }

  /* ---------- Save/Delete ---------- */

  async function handleSave(idx) {
    const item = items[idx];
    if (!item) return;
    const validation = updateValidationForItem(item);
    if (Object.keys(validation).length) {
      return;
    }
    setSaving(true);
    try {
      const toSave = { ...item };
      delete toSave.imageFile;
      delete toSave.imageUrl;
      const saved = await MenuSessionInterface.updateMenuItem(toSave.id, toSave);
      setItems((prev) => {
        const copy = [...prev];
        const transient = { imageUrl: prev[idx]?.imageUrl ?? null, imageFile: prev[idx]?.imageFile ?? null };
        copy[idx] = { ...saved, ...transient };
        return copy;
      });
      updateValidationForItem({ ...saved, imageUrl: item.imageUrl, imageFile: item.imageFile });
      alert('Saved (session-only). Images are in-memory only for this session.');
    } catch (err) {
      console.error(err);
      alert('Save failed.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(idx) {
    if (!window.confirm('Delete this menu item?')) return;
    const id = items[idx].id;
    try {
      await MenuSessionInterface.deleteMenuItem(id);
      setItems((prev) => {
        const copy = [...prev];
        if (copy[idx] && copy[idx].imageUrl) {
          try { URL.revokeObjectURL(copy[idx].imageUrl); } catch (ex) {}
        }
        copy.splice(idx, 1);
        if (copy.length === 0) setSelectedIndex(null);
        else setSelectedIndex(Math.max(0, idx - 1));
        return copy;
      });
      setErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (err) {
      console.error(err);
      alert('Delete failed.');
    }
  }

  // cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      items.forEach((it) => {
        if (it.imageUrl) {
          try { URL.revokeObjectURL(it.imageUrl); } catch (ex) {}
        }
      });
    };
  }, [items]);

  const selected = selectedIndex != null ? items[selectedIndex] : null;
  const selectedErrors = selected ? errors[selected.id] : null;
  const hasErrors = selectedErrors ? Object.keys(selectedErrors).length > 0 : false;
  const errorIdFor = (field) => (selected ? `${selected.id}-${field}-error` : undefined);

  return (
    <div className="app-root update-menu-root">
      <h1 className="page-title">
        {restaurantInfo?.name ? `Welcome to Your Food Menu Page for ${restaurantInfo.name}!` : 'Welcome To Your Account Page!'}
      </h1>

      <div className="content">
        <Sidebar restaurantName={restaurantInfo?.name ?? 'Loading...'} status={restaurantInfo?.status} />

        <main className="main-panel" aria-live="polite">
          <div className="panel-inner update-menu-panel">
            <div className="page-subtitle">Update Food Menu</div>

            <div className="menu-container-rounded" role="region" aria-label="Your Food Menu editor">
              {/* left menu list inside rounded container */}
              <div className="menu-left-pane">
                <div className="menu-left-header">
                  <div className="menu-title">Your Food Menu</div>
                </div>

                <div className="menu-list-scroll" tabIndex="0" aria-label="Menu items list">
                  {items.length === 0 ? (
                    <div className="no-items-placeholder">No menu items yet</div>
                  ) : (
                    items.map((it, i) => {
                      const itemErrors = errors[it.id];
                      return (
                      <div
                        key={it.id}
                        className={`menu-card-pill ${selectedIndex === i ? 'selected' : ''} ${itemErrors ? 'has-error' : ''}`}
                        onClick={() => selectIndex(i)}
                      >
                        <div className="menu-card-top">
                          <div className="edit-badge" onClick={(e) => { e.stopPropagation(); selectIndex(i); }}>EDIT</div>
                        </div>

                        <div className="menu-card-image-small">
                          {it.imageUrl ? (
                            <img src={it.imageUrl} alt={it.name || 'preview'} />
                          ) : (
                            <div className="menu-card-image-text">ITEM PICTURE</div>
                          )}
                        </div>

                        <div className="menu-card-footer">
                          <div className="food-name">{it.name || 'FOOD NAME'}</div>
                          {itemErrors && (
                            <div className="status-tag" aria-label="This item needs more details">Needs details</div>
                          )}
                        </div>
                      </div>
                    );
                    })
                  )}
                </div>

                <div className="add-new-wrapper">
                  <button className="add-new-btn" onClick={addNewItem}>➕<span>Add New Menu Item</span></button>
                </div>
              </div>

              {/* visual divider */}
              <div className="vertical-divider" aria-hidden="true" />

              {/* right-side editor */}
              <div className="menu-right-pane">
                {selected ? (
                  <div className="editor">
                    {/* Food Name field */}
                    <label className={`field ${selectedErrors?.name ? 'field-error-state' : ''}`}>
                      <div className="field-label">Food Name</div>
                      <input
                        value={selected.name}
                        onChange={(e) => updateField(selectedIndex, 'name', e.target.value)}
                        placeholder="Item name"
                        className={selectedErrors?.name ? 'input-error' : ''}
                        aria-invalid={Boolean(selectedErrors?.name)}
                        aria-describedby={selectedErrors?.name ? errorIdFor('name') : undefined}
                      />
                      {selectedErrors?.name && (
                        <div className="field-error-message" id={errorIdFor('name')}>
                          {selectedErrors.name}
                        </div>
                      )}
                    </label>

                    <label className={`field ${selectedErrors?.description ? 'field-error-state' : ''}`}>
                      <div className="field-label">Description</div>
                      <textarea
                        value={selected.description}
                        onChange={(e) => updateField(selectedIndex, 'description', e.target.value)}
                        className={selectedErrors?.description ? 'input-error' : ''}
                        aria-invalid={Boolean(selectedErrors?.description)}
                        aria-describedby={selectedErrors?.description ? errorIdFor('description') : undefined}
                      />
                      {selectedErrors?.description && (
                        <div className="field-error-message" id={errorIdFor('description')}>
                          {selectedErrors.description}
                        </div>
                      )}
                    </label>

                    <label className={`field ${selectedErrors?.allergens ? 'field-error-state' : ''}`}>
                      <div className="field-label">Allergens</div>
                      <textarea
                        value={selected.allergens}
                        onChange={(e) => updateField(selectedIndex, 'allergens', e.target.value)}
                        className={selectedErrors?.allergens ? 'input-error' : ''}
                        aria-invalid={Boolean(selectedErrors?.allergens)}
                        aria-describedby={selectedErrors?.allergens ? errorIdFor('allergens') : undefined}
                      />
                      {selectedErrors?.allergens && (
                        <div className="field-error-message" id={errorIdFor('allergens')}>
                          {selectedErrors.allergens}
                        </div>
                      )}
                    </label>

                    <label className={`field-inline ${selectedErrors?.price ? 'field-error-state' : ''}`}>
                      <div className="field-label">Set Price</div>
                      <input
                        type="text"
                        inputMode="decimal"
                        pattern="^\d*(\.\d{0,2})?$"
                        value={selected.price}
                        onChange={(e) => handlePriceChange(selectedIndex, e.target.value)}
                        onKeyDown={handlePriceKeyDown}
                        onBlur={() => handlePriceBlur(selectedIndex)}
                        placeholder="0.00"
                        className={selectedErrors?.price ? 'input-error' : ''}
                        aria-invalid={Boolean(selectedErrors?.price)}
                        aria-describedby={selectedErrors?.price ? errorIdFor('price') : undefined}
                      />
                      {selectedErrors?.price && (
                        <div className="field-error-message" id={errorIdFor('price')}>
                          {selectedErrors.price}
                        </div>
                      )}
                    </label>

                    <div className="image-uploader">
                      <div className="image-preview-area">
                        {selected.imageUrl ? (
                          <img className="preview-img" src={selected.imageUrl} alt="preview" />
                        ) : (
                          <div className="no-image-large">Please upload an image for this menu item</div>
                        )}
                      </div>

                      <div className="image-controls">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => handleFileSelect(e, selectedIndex)}
                        />
                        <button className="control-btn" onClick={() => fileInputRef.current && fileInputRef.current.click()}>Add Picture ➕</button>
                        {selected.imageUrl && <button className="control-btn" onClick={() => removeImage(selectedIndex)}>Remove Image</button>}
                      </div>
                    </div>

                    <div className={`availability ${selectedErrors?.available ? 'field-error-state' : ''}`}>
                      <button
                        className={`pill ${selected.available ? 'active' : ''}`}
                        onClick={() => updateField(selectedIndex, 'available', true)}
                        aria-pressed={selected.available === true}
                        aria-describedby={selectedErrors?.available ? errorIdFor('available') : undefined}
                      >
                        AVAILABLE
                      </button>
                      <button
                        className={`pill ${!selected.available ? 'active' : ''}`}
                        onClick={() => updateField(selectedIndex, 'available', false)}
                        aria-pressed={selected.available === false}
                        aria-describedby={selectedErrors?.available ? errorIdFor('available') : undefined}
                      >
                        UNAVAILABLE
                      </button>
                    </div>
                    {selectedErrors?.available && (
                      <div className="field-error-message" id={errorIdFor('available')}>
                        {selectedErrors.available}
                      </div>
                    )}

                    <div className="editor-actions">
                      <button className="btn-delete" onClick={() => handleDelete(selectedIndex)} disabled={saving}>DELETE</button>
                      <button
                        className="btn-save"
                        onClick={() => handleSave(selectedIndex)}
                        disabled={saving || hasErrors}
                        aria-disabled={saving || hasErrors}
                      >
                        {saving ? 'Saving...' : hasErrors ? 'Fix errors to save' : 'SAVE'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="editor empty">
                    <p>Select an item on the left or click “Add New Menu Item” to begin editing.</p>
                  </div>
                )}
              </div>
            </div> {/* menu-container-rounded */}
          </div>
        </main>
      </div>
    </div>
  );
}
