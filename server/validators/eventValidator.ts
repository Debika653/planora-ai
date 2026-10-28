import { Request, Response, NextFunction } from 'express';

const ALLOWED_EVENT_TYPES = [
  'wedding',
  'birthday',
  'anniversary',
  'college_corporate',
  'community',
  'custom',
];

const ALLOWED_STYLES = [
  'elegant',
  'traditional',
  'modern',
  'minimalist',
  'festive',
  'custom',
];

/**
 * Sanitizes string input to prevent dangerous script injections
 */
export function sanitizeString(input: unknown, maxLength = 1000): string {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ''); // strip angle brackets
}

/**
 * Express middleware to validate event form data for generation
 */
export function validateEventFormMiddleware(req: Request, res: Response, next: NextFunction) {
  const body = req.body;
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Invalid request: Request body must be a JSON object' });
  }

  const errors: Record<string, string> = {};

  // Name
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
    errors.name = 'Event name is required and must have at least 2 characters';
  } else if (body.name.length > 150) {
    errors.name = 'Event name cannot exceed 150 characters';
  }

  // Event Type
  if (!body.eventType || !ALLOWED_EVENT_TYPES.includes(body.eventType)) {
    errors.eventType = `Event type must be one of: ${ALLOWED_EVENT_TYPES.join(', ')}`;
  }

  // Date
  if (!body.date || typeof body.date !== 'string') {
    errors.date = 'Event date is required';
  } else {
    const eventDate = new Date(body.date + 'T00:00:00');
    if (isNaN(eventDate.getTime())) {
      errors.date = 'Event date format is invalid. Must be YYYY-MM-DD';
    }
  }

  // Budget
  const budget = Number(body.totalBudget);
  if (isNaN(budget) || budget <= 0) {
    errors.totalBudget = 'Total budget must be a positive number greater than 0';
  } else if (budget > 100000000) {
    errors.totalBudget = 'Total budget exceeds maximum supported limit';
  }

  // Guest Count
  const guests = Number(body.guestCount);
  if (isNaN(guests) || guests <= 0 || !Number.isInteger(guests)) {
    errors.guestCount = 'Guest count must be a positive integer';
  } else if (guests > 100000) {
    errors.guestCount = 'Guest count exceeds maximum supported limit';
  }

  // Location
  if (!body.location || typeof body.location !== 'string' || body.location.trim().length === 0) {
    errors.location = 'Event location is required';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      error: 'Form validation failed',
      validationErrors: errors,
    });
  }

  // Attach sanitized fields to req.body
  req.body.name = sanitizeString(body.name, 150);
  req.body.location = sanitizeString(body.location, 200);
  req.body.themePreference = sanitizeString(body.themePreference || '', 300);
  req.body.foodPreference = sanitizeString(body.foodPreference || '', 300);
  req.body.specialRequests = sanitizeString(body.specialRequests || '', 500);
  req.body.venueRequirements = sanitizeString(body.venueRequirements || '', 500);
  req.body.decorationRequirements = sanitizeString(body.decorationRequirements || '', 500);
  req.body.cateringRequirements = sanitizeString(body.cateringRequirements || '', 500);
  req.body.photographyEntertainmentNeeds = sanitizeString(body.photographyEntertainmentNeeds || '', 500);
  req.body.constraints = sanitizeString(body.constraints || '', 500);

  next();
}
