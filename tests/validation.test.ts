import { describe, it, expect } from 'vitest';
import {
  isPastDate,
  validateStep1,
  validateStep2,
  validateCompleteEventForm,
} from '../src/utils/validation';
import { EventFormData } from '../src/types';

describe('Event Form Validation Engine', () => {
  it('identifies past dates correctly', () => {
    // Yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    expect(isPastDate(yesterdayStr)).toBe(true);

    // Far future date
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const futureStr = future.toISOString().split('T')[0];
    expect(isPastDate(futureStr)).toBe(false);
  });

  it('validates Step 1 required fields and rejects past dates', () => {
    const invalidData: Partial<EventFormData> = {
      name: '',
      eventType: undefined,
      date: '2020-01-01', // past
      location: '',
    };
    const res = validateStep1(invalidData);
    expect(res.isValid).toBe(false);
    expect(res.errors.name).toBeDefined();
    expect(res.errors.eventType).toBeDefined();
    expect(res.errors.date).toBeDefined();
    expect(res.errors.location).toBeDefined();
  });

  it('validates Step 2 budget and guest count constraints', () => {
    const invalidData: Partial<EventFormData> = {
      totalBudget: -100, // negative
      currency: '',
      guestCount: 0, // non-positive
    };
    const res = validateStep2(invalidData);
    expect(res.isValid).toBe(false);
    expect(res.errors.totalBudget).toBeDefined();
    expect(res.errors.currency).toBeDefined();
    expect(res.errors.guestCount).toBeDefined();
  });

  it('passes complete form when all required parameters are valid', () => {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 4);

    const validData: Partial<EventFormData> = {
      name: 'Autumn Wine Festival',
      eventType: 'community',
      date: futureDate.toISOString().split('T')[0],
      startTime: '14:00',
      durationHours: 6,
      location: 'Napa Valley, CA',
      environment: 'outdoor',
      totalBudget: 20000,
      currency: 'USD',
      guestCount: 150,
      spendingPriorities: ['Catering & Beverages', 'Venue & Space'],
      budgetFlexibility: 'moderate',
      style: 'modern',
      themePreference: 'Harvest Vineyard',
      preferredColors: ['#7C699E'],
      foodPreference: 'Wine pairings and cheese grazing',
      dietaryRestrictions: ['Vegetarian'],
      accessibilityRequirements: ['Flat grass path'],
      specialRequests: '',
      venueRequirements: 'Vineyard lawn',
      decorationRequirements: 'Rustic barrels and fairy lights',
      cateringRequirements: 'Local artisan wines',
      photographyEntertainmentNeeds: 'Acoustic jazz quartet',
      vendorRequirements: 'Licensed servers',
      constraints: 'Curfew at 22:00',
    };

    const res = validateCompleteEventForm(validData);
    expect(res.isValid).toBe(true);
    expect(Object.keys(res.errors).length).toBe(0);
  });
});
