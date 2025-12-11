import React, { useEffect, useState, useRef } from 'react';
import AppHeader from '../../components/AppHeader';
import Sidebar from '../../components/Sidebar';
import DatabaseInterface from '../../db/DatabaseInterface';
import MenuSessionInterface from '../../db/MenuSessionInterface';
import './UpdateMenu.css';

export default function UpdateMenu() {
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [itemErrors, setItemErrors] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    DatabaseInterface.getRestaurantInfo()
      .then((info) => setRestaurantInfo(info))
      .catch(() => {});
    MenuSessionInterface.getMenuItems().then((list) => {
      setItems(list);
      setSelectedIndex(list.length ? 0 : null);
    });
  }, []);

  function selectIndex(i) {
    setSelectedIndex(i);
  }

  function updateField(idx, key, value) {
    setItems((prev) => {
      const copy = [...prev];
      const updated = { ...copy[idx], [key]: value };
      copy[idx] = updated;
      syncItemErrors(updated);
      return copy;
    });
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

  /* Price input helpers */

  function validateMenuItem(item) {
    const errors = {
      name: '',
      description: '',
      price: '',
    };

    if (!item?.name?.trim()) {
      errors.name = 'Food name is required.';
    }

    if (!item?.description?.trim()) {
      errors.description = 'Description is required.';
    }

    const priceString = String(item?.price ?? '').trim();
    const priceValue = Number(priceString);
    if (!priceString) {
      errors.price = 'Price is required.';
    } else if (!Number.isFinite(priceValue) || priceValue <= 0) {
      errors.price = 'Enter a valid price greater than 0 (e.g., 9.99).';
    }

    return errors;
  }

  function syncItemErrors(item) {
    if (!item?.id) {
      return;
    }
    setItemErrors((prev) => {
      const validation = validateMenuItem(item);
      const hasIssues = Object.values(validation).some(Boolean);
      if (!hasIssues) {
        if (!(item.id in prev)) return prev;
        const { [item.id]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [item.id]: validation };
    });
  }

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

  function addNewItem() {
    MenuSessionInterface.createMenuItem()
      .then((newItem) => {
        setItems((prev) => {
          const next = [...prev, { ...newItem }];
          setSelectedIndex(next.length - 1);
          return next;
        });
      })
      .catch((err) => {
        console.error('Add item failed:', err);
        alert('Could not create item. Check the console for details.');
      });
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

  // Save/delete helpers
  async function handleSave(idx) {
    const currentItem = items[idx];
    if (!currentItem) return;

    const validation = validateMenuItem(currentItem);
    const hasIssues = Object.values(validation).some(Boolean);
    if (hasIssues) {
      setItemErrors((prev) => ({ ...prev, [currentItem.id]: validation }));
      alert('Please complete all required menu fields before saving.');
      return;
    }

    setSaving(true);
    try {
      const toSave = { ...currentItem };
      delete toSave.imageFile;
      delete toSave.imageUrl;
      const saved = await MenuSessionInterface.updateMenuItem(toSave.id, toSave);
      setItems((prev) => {
        const copy = [...prev];
        const transient = { imageUrl: prev[idx]?.imageUrl ?? null, imageFile: prev[idx]?.imageFile ?? null };
        copy[idx] = { ...saved, ...transient };
        return copy;
      });
      setItemErrors((prev) => {
        const next = { ...prev };
        delete next[toSave.id];
        return next;
      });
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
      setItemErrors((prev) => {
        if (!(id in prev)) return prev;
        const { [id]: _removed, ...rest } = prev;
        return rest;
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
  const selectedErrors = selected ? itemErrors[selected.id] ?? {} : {};

  return (
    <>
      <AppHeader />
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
                    items.map((it, i) => (
                      <div
                        key={it.id}
                        className={`menu-card-pill ${selectedIndex === i ? 'selected' : ''}`}
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
                        </div>
                      </div>
                    ))
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
                    <label className="field">
                      <div className="field-label">Food Name</div>
                      <input
                        value={selected.name}
                        onChange={(e) => updateField(selectedIndex, 'name', e.target.value)}
                        placeholder="Item name"
                        aria-invalid={Boolean(selectedErrors.name)}
                      />
                      {selectedErrors.name ? (
                        <p className="field-error" role="alert">{selectedErrors.name}</p>
                      ) : null}
                    </label>

                    <label className="field">
                      <div className="field-label">Description</div>
                      <textarea
                        value={selected.description}
                        onChange={(e) => updateField(selectedIndex, 'description', e.target.value)}
                        aria-invalid={Boolean(selectedErrors.description)}
                      />
                      {selectedErrors.description ? (
                        <p className="field-error" role="alert">{selectedErrors.description}</p>
                      ) : null}
                    </label>

                    <label className="field">
                      <div className="field-label">Allergens</div>
                      <textarea value={selected.allergens} onChange={(e) => updateField(selectedIndex, 'allergens', e.target.value)} />
                    </label>

                    <label className="field-inline">
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
                        aria-invalid={Boolean(selectedErrors.price)}
                      />
                      {selectedErrors.price ? (
                        <p className="field-error" role="alert">{selectedErrors.price}</p>
                      ) : null}
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

                    <div className="availability">
                      <button className={`pill ${selected.available ? 'active' : ''}`} onClick={() => updateField(selectedIndex, 'available', true)}>AVAILABLE</button>
                      <button className={`pill ${!selected.available ? 'active' : ''}`} onClick={() => updateField(selectedIndex, 'available', false)}>UNAVAILABLE</button>
                    </div>

                    <div className="editor-actions">
                      <button className="btn-delete" onClick={() => handleDelete(selectedIndex)} disabled={saving}>DELETE</button>
                      <button className="btn-save" onClick={() => handleSave(selectedIndex)} disabled={saving}>{saving ? 'Saving...' : 'SAVE'}</button>
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
    </>
  );
}
