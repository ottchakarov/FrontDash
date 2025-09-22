// src/db/RestaurantSessionInterface.js
// Simple in-memory session store for restaurant account settings.
// Promise-based API so you can swap it for a real DatabaseInterface later.

function makeId() {
  return `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

const defaultDays = [
  { id: makeId(), name: 'Sunday', open: false, start: '09:00', end: '17:00' },
  { id: makeId(), name: 'Monday', open: false, start: '09:00', end: '17:00' },
  { id: makeId(), name: 'Tuesday', open: false, start: '09:00', end: '17:00' },
  { id: makeId(), name: 'Wednesday', open: false, start: '09:00', end: '17:00' },
  { id: makeId(), name: 'Thursday', open: false, start: '09:00', end: '17:00' },
  { id: makeId(), name: 'Friday', open: false, start: '09:00', end: '17:00' },
  { id: makeId(), name: 'Saturday', open: false, start: '09:00', end: '17:00' },
];

let _settings = {
  // --- Hardcoded demo contact info (will be replaced by DB later) ---
  phone: '5551234567',
  email: 'owner@example.com',
  contactPerson: 'Alex Manager',

  // password is NOT stored here in plain text in real apps; for demo we keep it ephemeral
  password: '',

  // default days (deep cloned below)
  days: defaultDays.map(d => ({ ...d })),

  // image (session-only)
  imageUrl: null,
  imageFile: null,
};

function getSettings() {
  // return deep copy so callers can keep local transient fields (like object URLs)
  return Promise.resolve(JSON.parse(JSON.stringify(_settings)));
}

function updateSettings(patch = {}) {
  // merge shallow fields
  _settings = { ..._settings, ...patch };
  if (patch.days) {
    _settings.days = patch.days.map(d => ({ ...d }));
  }
  return Promise.resolve(JSON.parse(JSON.stringify(_settings)));
}

function setPicture(file, objectUrl) {
  _settings.imageFile = file || null;
  _settings.imageUrl = objectUrl || null;
  return Promise.resolve({ imageUrl: _settings.imageUrl });
}

function removePicture() {
  _settings.imageFile = null;
  _settings.imageUrl = null;
  return Promise.resolve(true);
}

function updatePassword(newPassword) {
  // In a real app you'd call server; here we keep it simple
  _settings.password = newPassword;
  return Promise.resolve(true);
}

export default {
  getSettings,
  updateSettings,
  setPicture,
  removePicture,
  updatePassword,
};
