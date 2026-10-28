import { describe, it, expect } from 'vitest';
import { generateDeterministicEventPlan } from '../server/services/geminiService';
import { EventFormData } from '../src/types';

describe('Deterministic Event Planning Engine', () => {
  const baseForm: EventFormData = {
    name: 'Sophia’s 25th Sunset Gathering',
    eventType: 'birthday',
    date: '2027-05-15',
    startTime: '19:00',
    durationHours: 5,
    location: 'Miami, FL',
    environment: 'outdoor',
    totalBudget: 8000,
    currency: 'USD',
    guestCount: 50,
    spendingPriorities: ['Catering & Beverages', 'Music & DJ'],
    budgetFlexibility: 'strict',
    themePreference: 'Tropical Neon Glow',
    preferredColors: ['#FF007F', '#00F0FF'],
    style: 'modern',
    foodPreference: 'Gourmet sliders and tropical cocktails',
    dietaryRestrictions: ['Vegan options'],
    accessibilityRequirements: ['Elevator access'],
    specialRequests: 'Sparkler moment at midnight',
    venueRequirements: 'Poolside cabana',
    decorationRequirements: 'Neon signage and tropical flora',
    cateringRequirements: 'Finger foods and cocktail bar',
    photographyEntertainmentNeeds: 'DJ and candid photographer',
    vendorRequirements: 'Flexible outside cake policy',
    constraints: 'Finish by 01:00',
  };

  it('generates a complete, mathematically verified plan', () => {
    const plan = generateDeterministicEventPlan(baseForm, 'Test Notice');

    expect(plan.id).toBeDefined();
    expect(plan.eventOverview.title).toBe(baseForm.name);
    expect(plan.budget.totalBudget).toBe(8000);

    // Sum of categories must equal estimatedTotal
    const sum = plan.budget.categories.reduce((acc, cat) => acc + cat.estimatedCost, 0);
    expect(plan.budget.estimatedTotal).toBe(sum);

    // Remaining budget must equal total - estimatedTotal
    expect(plan.budget.remainingBudget).toBe(plan.budget.totalBudget - plan.budget.estimatedTotal);

    // Milestones and tasks must be populated
    expect(plan.timeline.length).toBeGreaterThan(0);
    expect(plan.tasks.length).toBeGreaterThan(0);
    expect(plan.vendors.length).toBeGreaterThan(0);
    expect(plan.recommendations.length).toBeGreaterThan(0);
    expect(plan.contingencyPlan.length).toBeGreaterThan(0);
  });

  it('adapts budget allocations for weddings with ceremony priorities', () => {
    const weddingForm: EventFormData = {
      ...baseForm,
      eventType: 'wedding',
      name: 'Claire & David’s Nuptials',
      totalBudget: 40000,
      guestCount: 120,
    };

    const plan = generateDeterministicEventPlan(weddingForm, 'Wedding Test');
    const categoryNames = plan.budget.categories.map((c) => c.name);

    expect(categoryNames).toContain('Catering & Open Bar');
    expect(categoryNames).toContain('Photography & Videography');
    expect(plan.budget.totalBudget).toBe(40000);
  });
});
