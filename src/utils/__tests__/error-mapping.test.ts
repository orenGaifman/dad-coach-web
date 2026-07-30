import { describe, it, expect } from 'vitest';
import { ERROR_FIELD_MAP, mapErrorToField } from '@/src/utils/error-mapping';

describe('error-mapping', () => {
  describe('ERROR_FIELD_MAP', () => {
    it('maps INVALID_DISPLAY_NAME to displayName', () => {
      expect(ERROR_FIELD_MAP['INVALID_DISPLAY_NAME']).toBe('displayName');
    });

    it('maps INVALID_PHONE_FORMAT to phoneNumber', () => {
      expect(ERROR_FIELD_MAP['INVALID_PHONE_FORMAT']).toBe('phoneNumber');
    });

    it('maps PHONE_ALREADY_REGISTERED to phoneNumber', () => {
      expect(ERROR_FIELD_MAP['PHONE_ALREADY_REGISTERED']).toBe('phoneNumber');
    });

    it('maps INVALID_EMAIL_FORMAT to email', () => {
      expect(ERROR_FIELD_MAP['INVALID_EMAIL_FORMAT']).toBe('email');
    });

    it('maps INVALID_TIMEZONE to timezone', () => {
      expect(ERROR_FIELD_MAP['INVALID_TIMEZONE']).toBe('timezone');
    });

    it('maps child-related errors to children', () => {
      expect(ERROR_FIELD_MAP['INVALID_CHILD_NAME']).toBe('children');
      expect(ERROR_FIELD_MAP['INVALID_BIRTH_DATE']).toBe('children');
    });

    it('maps form-level errors to _form', () => {
      expect(ERROR_FIELD_MAP['MAX_CHILDREN_EXCEEDED']).toBe('_form');
      expect(ERROR_FIELD_MAP['INVALID_LANGUAGE']).toBe('_form');
      expect(ERROR_FIELD_MAP['INVALID_GOALS']).toBe('_form');
      expect(ERROR_FIELD_MAP['INVALID_PREFERENCES']).toBe('_form');
    });
  });

  describe('mapErrorToField', () => {
    it('returns the mapped field for known error codes', () => {
      expect(mapErrorToField('INVALID_DISPLAY_NAME')).toBe('displayName');
      expect(mapErrorToField('PHONE_ALREADY_REGISTERED')).toBe('phoneNumber');
    });

    it('returns _form for unknown error codes', () => {
      expect(mapErrorToField('UNKNOWN_ERROR')).toBe('_form');
      expect(mapErrorToField('SESSION_EXPIRED')).toBe('_form');
    });
  });
});
