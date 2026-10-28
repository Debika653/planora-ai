import { describe, it, expect } from 'vitest';
import {
  calculateBudgetMetrics,
  formatCurrency,
  validateCategoryInput,
} from '../src/utils/budgetCalculations';

describe('Budget Calculations Engine', () => {
  it('correctly calculates budget totals and remaining balance', () => {
    const categories = [
      { name: 'Catering', estimatedCost: 10000 },
      { name: 'Venue', estimatedCost: 8000 },
      { name: 'Photography', estimatedCost: 4000 },
    ];
    const result = calculateBudgetMetrics(25000, categories, 'USD');

    expect(result.totalBudget).toBe(25000);
    expect(result.estimatedTotal).toBe(22000);
    expect(result.remainingBudget).toBe(3000);
    expect(result.isOverBudget).toBe(false);
  });

  it('correctly derives percentage allocations deterministically', () => {
    const categories = [
      { name: 'Catering', estimatedCost: 5000 },
      { name: 'Music', estimatedCost: 5000 },
    ];
    const result = calculateBudgetMetrics(10000, categories, 'USD');

    expect(result.categories[0].percentage).toBe(50);
    expect(result.categories[1].percentage).toBe(50);
  });

  it('flags overspending when estimates exceed total budget', () => {
    const categories = [
      { name: 'Venue', estimatedCost: 15000 },
      { name: 'Decor', estimatedCost: 6000 },
    ];
    const result = calculateBudgetMetrics(20000, categories, 'USD');

    expect(result.estimatedTotal).toBe(21000);
    expect(result.remainingBudget).toBe(-1000);
    expect(result.isOverBudget).toBe(true);
  });

  it('safely handles zero total budget without division by zero', () => {
    const categories = [
      { name: 'Venue', estimatedCost: 500 },
    ];
    const result = calculateBudgetMetrics(0, categories, 'USD');

    expect(result.totalBudget).toBe(0);
    expect(result.estimatedTotal).toBe(500);
    expect(result.remainingBudget).toBe(-500);
    expect(result.isOverBudget).toBe(true);
    // Percentage should not crash and be calculated based on estimated total
    expect(result.categories[0].percentage).toBe(100);
  });

  it('clamps negative costs and invalid numbers to 0', () => {
    const categories = [
      { name: 'Catering', estimatedCost: -500 },
      { name: 'Flowers', estimatedCost: NaN },
      { name: 'Band', estimatedCost: 1200 },
    ];
    const result = calculateBudgetMetrics(5000, categories, 'USD');

    expect(result.categories[0].estimatedCost).toBe(0);
    expect(result.categories[1].estimatedCost).toBe(0);
    expect(result.categories[2].estimatedCost).toBe(1200);
    expect(result.estimatedTotal).toBe(1200);
    expect(result.remainingBudget).toBe(3800);
  });

  it('formats currencies accurately', () => {
    expect(formatCurrency(5000, 'USD')).toContain('5,000');
    expect(formatCurrency(150000, 'INR')).toContain('150,000');
    expect(formatCurrency(2500, 'EUR')).toContain('2,500');
  });

  it('validates budget category inputs accurately', () => {
    expect(validateCategoryInput('', 100).isValid).toBe(false);
    expect(validateCategoryInput('Decor', -50).isValid).toBe(false);
    expect(validateCategoryInput('Decor', 500).isValid).toBe(true);
  });
});
