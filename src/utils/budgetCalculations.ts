import { BudgetCategory, EventBudget } from '../types';

/**
 * Format numerical amount into localized currency string.
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  const safeAmount = isNaN(amount) ? 0 : amount;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      maximumFractionDigits: 0,
    }).format(safeAmount);
  } catch {
    // Fallback if unrecognized currency code
    return `${currency.toUpperCase()} ${safeAmount.toLocaleString()}`;
  }
}

/**
 * Calculate deterministic event budget metrics.
 * Ensures estimatedTotal equals exact sum of category estimates,
 * remaining budget is accurately derived, percentages add up sensibly,
 * negative numbers are clamped to 0, and overspending is detected.
 */
export function calculateBudgetMetrics(
  totalBudget: number,
  rawCategories: Array<{
    id?: string;
    name: string;
    estimatedCost: number;
    reason?: string;
  }>,
  currency = 'USD'
): EventBudget {
  const safeTotalBudget = Math.max(0, isNaN(totalBudget) ? 0 : Math.round(totalBudget));

  // Sanitize categories and clamp negative costs to 0
  const sanitizedCategories = (rawCategories || []).map((cat, idx) => {
    const rawCost = isNaN(cat.estimatedCost) ? 0 : cat.estimatedCost;
    const estimatedCost = Math.max(0, Math.round(rawCost));
    return {
      id: cat.id || `cat-${idx + 1}-${Date.now()}`,
      name: (cat.name || 'Miscellaneous').trim(),
      estimatedCost,
      reason: (cat.reason || '').trim(),
      percentage: 0, // will compute below
    };
  });

  // Calculate deterministic sum
  const estimatedTotal = sanitizedCategories.reduce(
    (sum, cat) => sum + cat.estimatedCost,
    0
  );

  const remainingBudget = safeTotalBudget - estimatedTotal;
  const isOverBudget = estimatedTotal > safeTotalBudget;

  // Compute percentages:
  // If estimatedTotal > 0, calculate percentage relative to estimatedTotal
  // (or relative to safeTotalBudget if safeTotalBudget > 0 and not over)
  const baseForPercentage = safeTotalBudget > 0 ? safeTotalBudget : estimatedTotal;

  const categoriesWithPercentages: BudgetCategory[] = sanitizedCategories.map((cat) => {
    let percentage = 0;
    if (baseForPercentage > 0) {
      percentage = Math.round((cat.estimatedCost / baseForPercentage) * 100);
    }
    return {
      ...cat,
      percentage,
    };
  });

  return {
    currency: (currency || 'USD').toUpperCase(),
    totalBudget: safeTotalBudget,
    estimatedTotal,
    remainingBudget,
    categories: categoriesWithPercentages,
    isOverBudget,
  };
}

/**
 * Validates budget category input for additions or edits
 */
export function validateCategoryInput(
  name: string,
  cost: number
): { isValid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Category name is required' };
  }
  if (isNaN(cost) || cost < 0) {
    return { isValid: false, error: 'Cost must be a non-negative number' };
  }
  return { isValid: true };
}
