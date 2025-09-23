// src/db/MenuSessionInterface.js
// Simple in-memory session store for menu items. Promise-based API for easy swap later.

function makeId() {
  return `${Date.now().toString(36)}-${Math.floor(Math.random()*1e6).toString(36)}`;
}

let _items = []; // session-only store (cleared on page reload)

/**
 * Returns a Promise resolving to an array of items.
 */
function getMenuItems() {
  // return shallow clones so callers can manage transient fields like imageUrl locally
  return Promise.resolve(_items.map(item => ({ ...item })));
}

/**
 * Create a menu item (session only). Accepts partial data, returns the created item.
 * If no payload provided, creates a blank item.
 */
function createMenuItem(payload = {}) {
  const item = {
    id: makeId(),
    name: payload.name ?? '',
    description: payload.description ?? '',
    allergens: payload.allergens ?? '',
    price: payload.price ?? '',
    available: typeof payload.available === 'boolean' ? payload.available : true,
  };
  _items.push(item);
  return Promise.resolve({ ...item });
}

/**
 * Update an item by id. payload should contain fields to replace (name, description, allergens, price, available).
 * Does NOT accept or persist images — images remain in the page's local state.
 */
function updateMenuItem(id, payload = {}) {
  const idx = _items.findIndex(it => it.id === id);
  if (idx < 0) return Promise.reject(new Error('Item not found'));
  _items[idx] = { ..._items[idx], ...payload };
  return Promise.resolve({ ..._items[idx] });
}

/**
 * Delete an item by id (session-only).
 */
function deleteMenuItem(id) {
  const idx = _items.findIndex(it => it.id === id);
  if (idx < 0) return Promise.reject(new Error('Item not found'));
  _items.splice(idx, 1);
  return Promise.resolve(true);
}

export default {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
