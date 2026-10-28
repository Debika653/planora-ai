import { EventFormData } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Checks if a date string (YYYY-MM-DD) is in the past compared to today.
 */
export function isPastDate(dateString: string): boolean {
  if (!dateString) return false;
  const targetDate = new Date(dateString + 'T00:00:00');
  if (isNaN(targetDate.getTime())) return true; // invalid date is treated as invalid
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return targetDate < today;
}

/**
 * Validates step 1: Event Basics
 */
export function validateStep1(data: Partial<EventFormData>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Celebration name is required';
  } else if (data.name.trim().length < 3) {
    errors.name = 'Name must be at least 3 characters long';
  }

  if (!data.eventType) {
    errors.eventType = 'Please select an event category';
  }

  if (!data.date) {
    errors.date = 'Event date is required';
  } else if (isPastDate(data.date)) {
    errors.date = 'Event date cannot be in the past for new celebrations';
  }

  if (!data.startTime) {
    errors.startTime = 'Start time is required';
  }

  if (data.durationHours === undefined || isNaN(data.durationHours) || data.durationHours <= 0) {
    errors.durationHours = 'Duration must be at least 0.5 hours';
  } else if (data.durationHours > 72) {
    errors.durationHours = 'Duration cannot exceed 72 hours for a single celebration schedule';
  }

  if (!data.location || data.location.trim().length === 0) {
    errors.location = 'City or location is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates step 2: Budget & Attendees
 */
export function validateStep2(data: Partial<EventFormData>): ValidationResult {
  const errors: Record<string, string> = {};

  if (data.totalBudget === undefined || isNaN(data.totalBudget) || data.totalBudget <= 0) {
    errors.totalBudget = 'Total budget must be a positive number greater than 0';
  }

  if (!data.currency) {
    errors.currency = 'Currency selection is required';
  }

  if (
    data.guestCount === undefined ||
    isNaN(data.guestCount) ||
    !Number.isInteger(data.guestCount) ||
    data.guestCount <= 0
  ) {
    errors.guestCount = 'Guest count must be a positive whole number';
  } else if (data.guestCount > 100000) {
    errors.guestCount = 'Guest count cannot exceed 100,000 for standard planning';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates step 3: Style & Preferences
 */
export function validateStep3(data: Partial<EventFormData>): ValidationResult {
  const errors: Record<string, string> = {};
  if (!data.style) {
    errors.style = 'Please choose a primary styling theme';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates step 4: Logistics
 */
export function validateStep4(_data: Partial<EventFormData>): ValidationResult {
  // Optional detailed fields with graceful defaults, always valid
  return {
    isValid: true,
    errors: {},
  };
}

/**
 * Validates complete event form data before AI submission
 */
export function validateCompleteEventForm(data: Partial<EventFormData>): ValidationResult {
  const step1 = validateStep1(data);
  const step2 = validateStep2(data);
  const step3 = validateStep3(data);
  const step4 = validateStep4(data);

  const combinedErrors = {
    ...step1.errors,
    ...step2.errors,
    ...step3.errors,
    ...step4.errors,
  };

  return {
    isValid: Object.keys(combinedErrors).length === 0,
    errors: combinedErrors,
  };
}
