import { Router, Request, Response } from 'express';
import { eventRepository } from '../repositories/eventRepository';
import { generateEventPlanWithGemini, chatWithEventAssistant } from '../services/geminiService';
import { validateEventFormMiddleware } from '../validators/eventValidator';
import { rateLimiter } from '../middleware/rateLimiter';
import { calculateBudgetMetrics } from '../../src/utils/budgetCalculations';

const router = Router();

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  const hasGeminiKey = Boolean(
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY.trim() !== '' &&
    process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
  );

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    aiEngine: hasGeminiKey ? 'Gemini 3.8 Flash (Active)' : 'Planora Deterministic Event Engine (Demo/Fallback Active)',
    databaseMode: 'In-Memory Local Session Repository with Synchronized Cache',
  });
});

// GET all events
router.get('/events', (_req: Request, res: Response) => {
  try {
    const events = eventRepository.getAll();
    res.json(events);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve saved celebrations' });
  }
});

// GET single event by id
router.get('/events/:id', (req: Request, res: Response) => {
  try {
    const event = eventRepository.getById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Celebration not found' });
    }
    res.json(event);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve celebration details' });
  }
});

// POST save or update event
router.post('/events', (req: Request, res: Response) => {
  try {
    const eventData = req.body;
    if (!eventData || !eventData.id || !eventData.formData) {
      return res.status(400).json({ error: 'Invalid event data structure' });
    }

    // Recalculate deterministic budget
    if (eventData.budget && Array.isArray(eventData.budget.categories)) {
      eventData.budget = calculateBudgetMetrics(
        eventData.formData.totalBudget,
        eventData.budget.categories,
        eventData.formData.currency
      );
    }

    const saved = eventRepository.save(eventData);
    res.status(200).json(saved);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save celebration' });
  }
});

// DELETE event
router.delete('/events/:id', (req: Request, res: Response) => {
  try {
    const success = eventRepository.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Celebration not found to delete' });
    }
    res.json({ success: true, message: 'Celebration deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete celebration' });
  }
});

// POST generate AI plan
router.post(
  '/events/generate-plan',
  rateLimiter(15, 60 * 1000), // Max 15 generation requests per minute
  validateEventFormMiddleware,
  async (req: Request, res: Response) => {
    try {
      const formData = req.body;
      const plan = await generateEventPlanWithGemini(formData);

      // Save to repository
      const savedPlan = eventRepository.save(plan);

      res.status(200).json(savedPlan);
    } catch (err: any) {
      console.error('Error in /events/generate-plan:', err);
      res.status(500).json({
        error: 'An unexpected error occurred while planning your celebration. Please try again.',
      });
    }
  }
);

// POST AI assistant chat
router.post(
  '/events/assistant',
  rateLimiter(30, 60 * 1000), // Max 30 assistant messages per minute
  async (req: Request, res: Response) => {
    try {
      const { message, event, history } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'A message prompt is required' });
      }
      if (!event || typeof event !== 'object') {
        return res.status(400).json({ error: 'Event context is required' });
      }

      const result = await chatWithEventAssistant(message, event, history || []);
      res.json(result);
    } catch (err: any) {
      console.error('Error in /events/assistant:', err);
      res.status(500).json({
        error: 'Failed to query celebration assistant. Please try again.',
      });
    }
  }
);

export default router;
