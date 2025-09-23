export const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function validatePhone(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) {
    return 'Phone number is required.';
  }
  if (digits.length !== 10) {
    return 'Phone number must be exactly 10 digits.';
  }
  return null;
}

export function validateEmail(value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) {
    return 'Email address is required.';
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Enter a valid email address.';
  }
  return null;
}

export function validateContactPerson(value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) {
    return 'Contact person is required.';
  }
  return null;
}
