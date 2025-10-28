import React, { useEffect, useRef, useState } from 'react';
import AppHeader from '../../components/AppHeader';
import Sidebar from '../../components/Sidebar';
import DatabaseInterface from '../../db/DatabaseInterface';
import RestaurantSessionInterface from '../../db/RestaurantSessionInterface';
import './AccountSettings.css';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const REQUIRED_PHONE_LENGTH = 10;

/* ---------- time helpers ---------- */

// generate list with 00:00 (morning) ... 23:45 ... 24:00 (night)
function generateTimeOptions() {
  const options = [];
  // first: 00:00 morning
  options.push({ value: '00:00', label: '12:00 AM (morning)' });

  // 00:15 .. 23:45 (but skip 00:00 duplicate)
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      const val = `${hh}:${mm}`;
      if (val === '00:00') continue; // already added
      // human label in 12-hour format
      const ampm = h < 12 ? 'AM' : 'PM';
      const displayHour = (h % 12) === 0 ? 12 : (h % 12);
      const label = `${displayHour}:${mm} ${ampm}`;
      options.push({ value: val, label });
    }
  }

  // last: 24:00 representing midnight at the end of day
  options.push({ value: '24:00', label: '12:00 AM (night)' });
  return options;
}

const timeOptions = generateTimeOptions();

function timeValueToMinutes(val) {
  // val: "HH:MM" or "24:00"
  if (val === '24:00') return 24 * 60;
  const [hh, mm] = val.split(':').map((x) => parseInt(x, 10));
  return hh * 60 + mm;
}

/* ---------- component ---------- */

export default function AccountSettings() {
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [settings, setSettings] = useState(null);       // draft / working values
  const [savedSettings, setSavedSettings] = useState(null); // last-saved values from session store
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    DatabaseInterface.getRestaurantInfo().then((info) => setRestaurantInfo(info)).catch(() => {});
    RestaurantSessionInterface.getSettings().then((s) => {
      setSettings(s);
      setSavedSettings(s); // this captures what is currently saved (from DB/session)
    });
  }, []);

  /* ---------- picture handling (session-only) ---------- */

  function handleImageSelect(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please pick an image file.');
      return;
    }
    // revoke old object URL if present
    if (settings?.imageUrl) {
      try { URL.revokeObjectURL(settings.imageUrl); } catch (_) {}
    }
    const url = URL.createObjectURL(file);
    RestaurantSessionInterface.setPicture(file, url).then(() => {
      setSettings((prev) => ({ ...prev, imageFile: file, imageUrl: url }));
      setSavedSettings((prev) => ({ ...prev, imageUrl: url })); // treat as saved for the purpose of hiding "Add Picture"
    });
  }

  function removePicture() {
    if (!settings?.imageUrl) return;
    if (!window.confirm('Remove the current picture?')) return;
    try { URL.revokeObjectURL(settings.imageUrl); } catch (_) {}
    RestaurantSessionInterface.removePicture().then(() => {
      setSettings((prev) => ({ ...prev, imageFile: null, imageUrl: null }));
      setSavedSettings((prev) => ({ ...prev, imageUrl: null }));
      if (fileRef.current) fileRef.current.value = '';
    });
  }

  /* ---------- password flow ---------- */

  function validatePassword(pw) {
    if (!pw || pw.length < 6) return 'Password must be at least 6 characters.';
    if (!/[A-Z]/.test(pw)) return 'Password must include an uppercase letter.';
    if (!/[a-z]/.test(pw)) return 'Password must include a lowercase letter.';
    if (!/[0-9]/.test(pw)) return 'Password must include a number.';
    return null;
  }

  function confirmPasswordChange() {
    const err = validatePassword(newPassword);
    if (err) {
      alert(err);
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    if (!window.confirm('Are you sure you want to change the password?')) return;
    RestaurantSessionInterface.updatePassword(newPassword).then(() => {
      setNewPassword('');
      setConfirmPassword('');
      alert('Password changed (session-only).');
    });
  }

  /* ---------- contact field confirm logic ---------- */

  function confirmFieldChange(fieldKey, value) {
    // must differ from last-saved value to proceed
    if (!savedSettings) {
      alert('Settings not loaded.');
      return;
    }

    if (fieldKey === 'phone') {
      const digits = String(value ?? '').replace(/[^0-9]/g, '');
      if (digits.length !== REQUIRED_PHONE_LENGTH) {
        alert('Enter a 10-digit phone number before confirming.');
        return;
      }
    }

    if (fieldKey === 'email') {
      const trimmed = String(value ?? '').trim();
      if (!trimmed || !EMAIL_PATTERN.test(trimmed)) {
        alert('Enter a valid email address before confirming.');
        return;
      }
    }

    if (fieldKey === 'contactPerson') {
      if (!String(value ?? '').trim()) {
        alert('Contact person name cannot be empty.');
        return;
      }
    }

    if (String(savedSettings[fieldKey] ?? '') === String(value ?? '')) {
      alert('No change detected — edit the field before confirming.');
      return;
    }
    if (!window.confirm(`Confirm update ${fieldKey} -> "${value}"?`)) return;
    const patch = { [fieldKey]: value };
    RestaurantSessionInterface.updateSettings(patch).then((s) => {
      setSettings(s);
      setSavedSettings(s);
      alert(`${fieldKey} updated (session-only).`);
    });
  }

  /* ---------- days/time logic ---------- */

  function toggleDayOpen(index, isOpen) {
    setSettings((prev) => {
      const copy = { ...prev, days: prev.days.map((d) => ({ ...d })) };
      copy.days[index].open = !!isOpen;
      return copy;
    });
  }

  function updateDayTime(index, which, value) {
    setSettings((prev) => {
      const copy = { ...prev, days: prev.days.map((d) => ({ ...d })) };
      // compute comparator: if changing start, ensure end > start; if changing end ensure end > start
      const priorStart = copy.days[index].start;
      const priorEnd = copy.days[index].end;
      const newStart = which === 'start' ? value : priorStart;
      const newEnd = which === 'end' ? value : priorEnd;

      const sMin = timeValueToMinutes(newStart);
      const eMin = timeValueToMinutes(newEnd);

      if (eMin <= sMin) {
        alert('Closing time must be after opening time. Please choose a valid time range.');
        return prev; // reject the change
      }

      if (which === 'start') copy.days[index].start = value;
      else copy.days[index].end = value;
      return copy;
    });
  }

  function confirmSaveAll() {
    if (!window.confirm('Save all account settings?')) return;

    const phoneDigits = String(settings.phone ?? '').replace(/[^0-9]/g, '');
    if (phoneDigits.length !== REQUIRED_PHONE_LENGTH) {
      alert('Phone number must be exactly 10 digits before saving.');
      return;
    }

    if (!settings.email || !EMAIL_PATTERN.test(String(settings.email).trim())) {
      alert('Provide a valid email address before saving.');
      return;
    }

    if (!String(settings.contactPerson ?? '').trim()) {
      alert('Contact person is required before saving.');
      return;
    }

    const payload = {
      phone: settings.phone,
      email: settings.email,
      contactPerson: settings.contactPerson,
      days: settings.days,
      imageUrl: settings.imageUrl || null,
    };
    RestaurantSessionInterface.updateSettings(payload).then((s) => {
      setSettings(s);
      setSavedSettings(s);
      alert('All settings saved (session-only).');
    });
  }

  if (!settings) {
    return (
      <>
        <AppHeader />
        <div className="app-root">
          <h1 className="page-title">{restaurantInfo?.name ? `Welcome to Your Account Page for ${restaurantInfo.name}!` : 'Welcome To Your Account Page!'}</h1>
          <div className="content">
            <Sidebar restaurantName={restaurantInfo?.name ?? 'Loading...'} status={restaurantInfo?.status} />
            <main className="main-panel">
              <div className="panel-inner">
                <div className="loading">Loading settings...</div>
              </div>
            </main>
          </div>
        </div>
      </>
    );
  }

  // helpers to know whether contact field is changed vs saved
  const phoneChanged = String(settings.phone ?? '') !== String(savedSettings?.phone ?? '');
  const emailChanged = String(settings.email ?? '') !== String(savedSettings?.email ?? '');
  const contactChanged = String(settings.contactPerson ?? '') !== String(savedSettings?.contactPerson ?? '');

  return (
    <>
      <AppHeader />
      <div className="app-root account-settings-root">
      <h1 className="page-title">{restaurantInfo?.name ? `Welcome to Your Account Page for ${restaurantInfo.name}!` : 'Welcome To Your Account Page!'}</h1>

      <div className="content">
        <Sidebar restaurantName={restaurantInfo?.name ?? 'Loading...'} status={restaurantInfo?.status} />

        <main className="main-panel" aria-live="polite">
          <div className="panel-inner account-settings-panel">
            <div className="page-subtitle">Account Settings</div>

            <div className="settings-container">
              <div className="settings-left">
                {/* Password */}
                <div className="setting-block">
                  <div className="setting-title">Change Password</div>
                  <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    aria-label="New password"
                  />
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    aria-label="Confirm password"
                  />
                  <div className="setting-actions">
                    <button className="control-btn" onClick={confirmPasswordChange}>Confirm Password Change</button>
                  </div>
                </div>

                {/* Contact info */}
                <div className="setting-block">
                  <div className="setting-title">Change Contact Info</div>
                  <div className="mini-row">
                    <input
                      type="tel"
                      placeholder="Phone number"
                      inputMode="tel"
                      value={settings.phone}
                      onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        phone: (String(e.target.value || '')).replace(/[^0-9]/g, '').slice(0, REQUIRED_PHONE_LENGTH),
                      }))
                    }
                    />
                    <button
                      className="control-btn"
                      onClick={() => confirmFieldChange('phone', settings.phone)}
                      disabled={!phoneChanged}
                    >
                      Confirm Phone
                    </button>
                  </div>

                  <div className="mini-row">
                    <input
                      type="email"
                      placeholder="Email address"
                      value={settings.email}
                      onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                    />
                    <button
                      className="control-btn"
                      onClick={() => confirmFieldChange('email', settings.email)}
                      disabled={!emailChanged}
                    >
                      Confirm Email
                    </button>
                  </div>

                  <div className="mini-row">
                    <input
                      type="text"
                      placeholder="Contact person"
                      value={settings.contactPerson}
                      onChange={(e) => setSettings(prev => ({ ...prev, contactPerson: e.target.value }))}
                    />
                    <button
                      className="control-btn"
                      onClick={() => confirmFieldChange('contactPerson', settings.contactPerson)}
                      disabled={!contactChanged}
                    >
                      Confirm Contact
                    </button>
                  </div>
                </div>

                {/* Days the Restaurant is Open */}
                <div className="setting-block days-block">
                  <div className="setting-title">Days the Restaurant is Open</div>
                  <div className="days-list">
                    {settings.days.map((day, idx) => (
                      <div className="day-row" key={day.id}>
                        <div className="day-name">{day.name}</div>

                        <div className="open-close">
                          <button
                            className={`day-pill ${day.open ? 'active' : ''}`}
                            onClick={() => toggleDayOpen(idx, true)}
                            aria-pressed={!!day.open}
                          >
                            OPEN
                          </button>
                          <button
                            className={`day-pill ${!day.open ? 'active' : ''}`}
                            onClick={() => toggleDayOpen(idx, false)}
                            aria-pressed={!day.open}
                          >
                            CLOSE
                          </button>
                        </div>

                        <div className="time-selects">
                          <select value={day.start} onChange={(e) => updateDayTime(idx, 'start', e.target.value)} disabled={!day.open}>
                            {timeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                          <span className="time-dash">—</span>
                          <select value={day.end} onChange={(e) => updateDayTime(idx, 'end', e.target.value)} disabled={!day.open}>
                            {timeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Picture */}
                <div className="setting-block">
                  <div className="setting-title">Add Restaurant Profile Picture</div>
                  <div className="picture-row">
                    <div className="picture-preview">
                      {settings.imageUrl ? <img src={settings.imageUrl} alt="restaurant preview" /> : <div className="no-image">No picture uploaded</div>}
                    </div>
                    <div className="picture-controls">
                      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} />
                      {/* Only show Add if no picture exists */}
                      {!settings.imageUrl && <button className="control-btn" onClick={() => fileRef.current && fileRef.current.click()}>Add Picture ➕</button>}
                      {settings.imageUrl && <button className="control-btn" onClick={removePicture}>Remove Picture</button>}
                    </div>
                  </div>
                </div>

                <div className="save-area">
                  <button className="btn-save" onClick={confirmSaveAll}>Save</button>
                </div>
              </div>

              {/* right column help */}
              <aside className="settings-right">
                <div className="help-box">
                  <h4>Notes</h4>
                  <ul>
                    <li>Password rules: min 6 characters, one uppercase, one lowercase, one number.</li>
                    <li>Phone will be sanitized to digits only.</li>
                    <li>Times are selectable in 15 minute increments; 12:00 AM appears twice as "morning" and "night" for 24-hour support.</li>
                    <li>Closing time must be after opening time.</li>
                    <li>Pictures are session-only (cleared on refresh).</li>
                  </ul>
                </div>
              </aside>
            </div>

          </div>
        </main>
      </div>
      </div>
    </>
  );
}
