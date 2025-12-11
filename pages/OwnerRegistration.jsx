import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { useRegistration } from '../contexts/RegistrationContext';
import './OwnerRegistration.css';

const initialFormState = {
  restaurantName: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  menuHighlights: '',
};

const fieldOrder = Object.keys(initialFormState);

function buildErrors(values) {
  const errors = {
    restaurantName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    menuHighlights: '',
  };

  if (!values.restaurantName.trim()) {
    errors.restaurantName = 'Restaurant name is required.';
  }

  if (!values.contactName.trim()) {
    errors.contactName = 'Please tell us who to reach out to.';
  }

  if (!values.contactEmail.trim()) {
    errors.contactEmail = 'Email is required.';
  } else if (!/^\S+@\S+\.\S+$/.test(values.contactEmail.trim())) {
    errors.contactEmail = 'Enter a valid email address.';
  }

  const phoneDigits = values.contactPhone.replace(/[^\d]/g, '');
  if (!phoneDigits) {
    errors.contactPhone = 'Phone number is required.';
  } else if (phoneDigits.length !== 10) {
    errors.contactPhone = 'Phone number must be exactly 10 digits.';
  }

  if (!values.menuHighlights.trim()) {
    errors.menuHighlights = 'Share a few menu highlights to tempt diners.';
  } else if (values.menuHighlights.trim().length < 12) {
    errors.menuHighlights = 'Menu highlights should be at least 12 characters long.';
  }

  return errors;
}

export default function OwnerRegistration() {
  const { registerOwner, registrations } = useRegistration();

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [hours, setHours] = useState(
    days.map(() => ({
      open: false,
      start: '09:00',
      end: '17:00',
    }))
  );
  const [highlights, setHighlights] = useState([{ name: '', description: '', price: '' }]);

  const [formData, setFormData] = useState(initialFormState);
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submitError, setSubmitError] = useState('');

  const errors = useMemo(() => buildErrors(formData), [formData]);
  const isFormValid = useMemo(
    () => fieldOrder.every((field) => errors[field] === ''),
    [errors]
  );

  const handleChange = (field) => (event) => {
    const rawValue = event.target.value;
    const value =
      field === 'contactPhone'
        ? rawValue.replace(/[^\d]/g, '').slice(0, 10)
        : rawValue;
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const toggleDayOpen = (index, open) => {
    setHours((prev) =>
      prev.map((d, i) => (i === index ? { ...d, open } : d))
    );
  };

  const setDayTime = (index, which, value) => {
    setHours((prev) =>
      prev.map((d, i) => (i === index ? { ...d, [which]: value } : d))
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const allTouched = fieldOrder.reduce(
      (acc, key) => ({
        ...acc,
        [key]: true,
      }),
      {}
    );
    setTouched(allTouched);
    setSubmitError('');

    if (!isFormValid) {
      return;
    }

    const cleanedHighlights = highlights
      .map((h) => ({
        name: (h.name || '').trim(),
        description: (h.description || '').trim(),
        price: (h.price || '').trim(),
      }))
      .filter((h) => h.name || h.description || h.price);

    const operatingHours = hours.map((d, idx) => ({
      weekday: idx, // 0-6
      start: d.start,
      end: d.end,
      open: d.open,
    }));

    try {
      setIsSubmitting(true);
      const saved = await registerOwner({
        ...formData,
        operatingHours,
        approvalStatus: 'pending',
        menuHighlightsList: cleanedHighlights,
      });
      setSubmissionResult(saved);
      setFormData(initialFormState);
      setTouched({});
      setHours(
        days.map(() => ({
          open: false,
          start: '09:00',
          end: '17:00',
        }))
      );
      setHighlights([{ name: '', description: '', price: '' }]);
    } catch (error) {
      setSubmitError('Something went wrong while saving your registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AppHeader />
      <div className="owner-registration">
      <header className="owner-registration__header">
        <div>
          <p className="owner-registration__eyebrow">Partner with FrontDash</p>
          <h1 className="owner-registration__title">Restaurant Owner Registration</h1>
          <p className="owner-registration__subtitle">
            Tell us a little bit about your restaurant so we can get you set up quickly.
          </p>
        </div>
        <Link to="/" className="owner-registration__back">
          ← Back to landing page
        </Link>
      </header>

      <form className="owner-registration__form" onSubmit={handleSubmit} noValidate>
        <div className="owner-registration__field">
          <label htmlFor="restaurantName">Restaurant name</label>
          <input
            id="restaurantName"
            name="restaurantName"
            type="text"
            value={formData.restaurantName}
            onChange={handleChange('restaurantName')}
            onBlur={handleBlur('restaurantName')}
            placeholder="FrontDash Bistro"
          />
          {touched.restaurantName && errors.restaurantName && (
            <p className="owner-registration__error">{errors.restaurantName}</p>
          )}
        </div>

        <div className="owner-registration__field">
          <label htmlFor="contactName">Primary contact</label>
          <input
            id="contactName"
            name="contactName"
            type="text"
            value={formData.contactName}
            onChange={handleChange('contactName')}
            onBlur={handleBlur('contactName')}
            placeholder="Alex Rivera"
          />
          {touched.contactName && errors.contactName && (
            <p className="owner-registration__error">{errors.contactName}</p>
          )}
        </div>

        <div className="owner-registration__field owner-registration__field--inline">
          <div>
            <label htmlFor="contactEmail">Contact email</label>
            <input
              id="contactEmail"
              name="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={handleChange('contactEmail')}
              onBlur={handleBlur('contactEmail')}
              placeholder="owner@frontdash.com"
            />
            {touched.contactEmail && errors.contactEmail && (
              <p className="owner-registration__error">{errors.contactEmail}</p>
            )}
          </div>

          <div>
            <label htmlFor="contactPhone">Contact phone</label>
            <input
              id="contactPhone"
              name="contactPhone"
              type="tel"
              inputMode="numeric"
              pattern="\d{10}"
              value={formData.contactPhone}
              onChange={handleChange('contactPhone')}
              onBlur={handleBlur('contactPhone')}
              placeholder="5551234567"
            />
            {touched.contactPhone && errors.contactPhone && (
              <p className="owner-registration__error">{errors.contactPhone}</p>
            )}
          </div>
        </div>

        <div className="owner-registration__field">
          <label>Operating hours</label>
          <table className="hours-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Open?</th>
                <th>Start</th>
                <th>End</th>
              </tr>
            </thead>
            <tbody>
              {days.map((day, idx) => (
                <tr key={day}>
                  <td>{day}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={hours[idx].open}
                      onChange={(e) => toggleDayOpen(idx, e.target.checked)}
                    />
                  </td>
                  <td>
                    <input
                      type="time"
                      value={hours[idx].start}
                      disabled={!hours[idx].open}
                      onChange={(e) => setDayTime(idx, 'start', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="time"
                      value={hours[idx].end}
                      disabled={!hours[idx].open}
                      onChange={(e) => setDayTime(idx, 'end', e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="owner-registration__helper">Let diners know when you are open.</p>
        </div>

        <div className="owner-registration__field">
          <label htmlFor="menuHighlights">Menu highlights</label>
          <textarea
            id="menuHighlights"
            name="menuHighlights"
            rows={4}
            value={formData.menuHighlights}
            onChange={handleChange('menuHighlights')}
            onBlur={handleBlur('menuHighlights')}
            placeholder="List your best sellers or dietary specialties so our team can set up your menu quickly."
          />
          {touched.menuHighlights && errors.menuHighlights && (
            <p className="owner-registration__error">{errors.menuHighlights}</p>
          )}
        </div>

        <div className="owner-registration__field">
          <label>Menu items (optional)</label>
          <div className="menu-highlights-list">
            {highlights.map((h, idx) => (
              <div className="menu-highlight-row" key={idx}>
                <input
                  type="text"
                  placeholder="Item name"
                  value={h.name}
                  onChange={(e) =>
                    setHighlights((prev) =>
                      prev.map((item, i) => (i === idx ? { ...item, name: e.target.value } : item))
                    )
                  }
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={h.description}
                  onChange={(e) =>
                    setHighlights((prev) =>
                      prev.map((item, i) => (i === idx ? { ...item, description: e.target.value } : item))
                    )
                  }
                />
                <input
                  type="text"
                  placeholder="Price"
                  value={h.price}
                  onChange={(e) =>
                    setHighlights((prev) =>
                      prev.map((item, i) => (i === idx ? { ...item, price: e.target.value } : item))
                    )
                  }
                />
                {highlights.length > 1 && (
                  <button
                    type="button"
                    className="mini-btn"
                    onClick={() => setHighlights((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            className="control-btn"
            onClick={() => setHighlights((prev) => [...prev, { name: '', description: '', price: '' }])}
          >
            Add menu item
          </button>
          <p className="owner-registration__helper">These will be saved with your registration for review.</p>
        </div>

        {submitError && <p className="owner-registration__submit-error">{submitError}</p>}

        <button
          type="submit"
          className="owner-registration__submit"
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? 'Saving registration…' : 'Submit registration'}
        </button>
      </form>

      {submissionResult && (
        <section className="owner-registration__result" aria-live="polite">
          <h2>Registration received!</h2>
          <p>
            Thanks, <strong>{submissionResult.contactName}</strong>. Our onboarding team will reach out at{' '}
            <strong>{submissionResult.contactEmail}</strong> within the next business day.
          </p>
          <dl>
            <div>
              <dt>Restaurant</dt>
              <dd>{submissionResult.restaurantName}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{submissionResult.contactPhone}</dd>
            </div>
            <div>
              <dt>Menu highlights</dt>
              <dd>{submissionResult.menuHighlights}</dd>
            </div>
          </dl>
        </section>
      )}

      {registrations.length > 0 && (
        <section className="owner-registration__saved">
          <h3>Recently saved registrations</h3>
          <ul>
            {registrations.map((entry) => (
              <li key={entry.id}>
                <span className="owner-registration__saved-name">{entry.restaurantName}</span>
                <span className="owner-registration__saved-contact">{entry.contactEmail}</span>
                <span className="owner-registration__saved-time">
                  Saved {new Date(entry.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
      </div>
    </>
  );
}
