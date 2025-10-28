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
  operatingHours: '',
  menuHighlights: '',
};

const fieldOrder = Object.keys(initialFormState);

function buildErrors(values) {
  const errors = {
    restaurantName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    operatingHours: '',
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

  if (!values.operatingHours.trim()) {
    errors.operatingHours = 'Let diners know when you are open.';
  } else if (values.operatingHours.trim().length < 6) {
    errors.operatingHours = 'Operating hours should include days and times (e.g., Mon-Fri 9a-9p).';
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

    try {
      setIsSubmitting(true);
      const saved = await registerOwner({ ...formData });
      setSubmissionResult(saved);
      setFormData(initialFormState);
      setTouched({});
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
          <label htmlFor="operatingHours">Operating hours</label>
          <input
            id="operatingHours"
            name="operatingHours"
            type="text"
            value={formData.operatingHours}
            onChange={handleChange('operatingHours')}
            onBlur={handleBlur('operatingHours')}
            placeholder="Mon-Fri 9a-9p, Sat-Sun 10a-8p"
          />
          {touched.operatingHours && errors.operatingHours && (
            <p className="owner-registration__error">{errors.operatingHours}</p>
          )}
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
              <dt>Operating hours</dt>
              <dd>{submissionResult.operatingHours}</dd>
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
