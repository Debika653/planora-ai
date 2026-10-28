import { GoogleGenAI } from '@google/genai';
import { EventFormData, EventPlan, BudgetCategory, TimelineMilestone, EventTask, EventVendor, Recommendation, ContingencyRisk } from '../../src/types';
import { calculateBudgetMetrics } from '../../src/utils/budgetCalculations';

const GEMINI_MODEL = 'gemini-3.8-flash';

/**
 * Generates an event plan via Google Gemini API with fallback to deterministic domain-knowledge engine.
 */
export async function generateEventPlanWithGemini(formData: EventFormData): Promise<EventPlan> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim() !== '' && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = buildGeminiPrompt(formData);

      // Timeout safety: 25 seconds
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI request timed out after 25 seconds')), 25000)
      );

      const generatePromise = ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          temperature: 0.4,
          responseMimeType: 'application/json',
        },
      });

      const response = await Promise.race([generatePromise, timeoutPromise]);
      const responseText = response.text || '';

      const parsedPlan = parseAndValidateAiResponse(responseText, formData);
      if (parsedPlan) {
        return parsedPlan;
      }
    } catch (err: any) {
      console.warn('Gemini API request failed or timed out:', err?.message || err);
      // Fallback to deterministic expert engine with honest disclosure
    }
  }

  // Graceful domain-specific fallback engine
  return generateDeterministicEventPlan(formData, apiKey ? 'Fallback mode activated: Gemini API error/rate-limit. Plan created with Planora Deterministic Rules Engine.' : 'Demonstration mode: Plan created using Planora Event Rules Engine (Configure GEMINI_API_KEY for live generative insights).');
}

/**
 * Builds the structured prompt for Gemini
 */
function buildGeminiPrompt(formData: EventFormData): string {
  return `You are a world-class celebration and event planner architect.
Plan a complete, production-quality, personalized event plan based on the following verified user inputs:

- Event Title: ${formData.name}
- Event Category: ${formData.eventType}
- Scheduled Date: ${formData.date}
- Start Time: ${formData.startTime} (${formData.durationHours} hours duration)
- Location: ${formData.location} (${formData.environment} setting)
- Total Budget: ${formData.totalBudget} ${formData.currency} (Budget flexibility: ${formData.budgetFlexibility})
- Guest Count: ${formData.guestCount} attendees
- Spending Priorities: ${formData.spendingPriorities?.join(', ') || 'Balanced'}
- Theme Preference: ${formData.themePreference || 'Modern celebration'}
- Styling: ${formData.style}
- Colors: ${formData.preferredColors?.join(', ') || 'Harmonious palette'}
- Food & Catering Preference: ${formData.foodPreference || 'Curated delicious menu'}
- Dietary Restrictions: ${formData.dietaryRestrictions?.join(', ') || 'None specified'}
- Accessibility Requirements: ${formData.accessibilityRequirements?.join(', ') || 'Standard accessibility'}
- Special Requests: ${formData.specialRequests || 'None'}
- Logistics & Venues: ${formData.venueRequirements || 'Standard venue'}
- Constraints: ${formData.constraints || 'None'}

Return ONLY a valid JSON object matching this exact schema:
{
  "eventOverview": {
    "title": "Clear event title",
    "summary": "Detailed 2-3 sentence personalized summary for this exact event and location",
    "theme": "Recommended theme name",
    "themeReason": "Why this theme works for their date, budget, and guest count",
    "assumptions": ["Assumption 1", "Assumption 2", "Assumption 3"],
    "colorPalette": ["Color 1 with hex", "Color 2 with hex", "Color 3 with hex", "Color 4 with hex"],
    "venueApproach": "Venue recommendation and spatial layout strategy",
    "menuApproach": "Tailored catering, beverage, and dietary accommodation plan",
    "entertainmentApproach": "Entertainment and flow of celebration activities"
  },
  "budgetCategories": [
    {
      "name": "Category name (e.g. Venue & Facilities, Catering & Bar, Photography, Decor & Floral, Entertainment)",
      "estimatedCost": 12000,
      "reason": "Clear explanation of this allocation based on the ${formData.guestCount} guests"
    }
  ],
  "timeline": [
    {
      "title": "Milestone title",
      "dueDate": "YYYY-MM-DD",
      "description": "Milestone action details",
      "priority": "high"
    }
  ],
  "tasks": [
    {
      "title": "Actionable task",
      "description": "Step by step detail",
      "category": "Catering / Venue / Logistics / Decor",
      "priority": "high"
    }
  ],
  "vendors": [
    {
      "category": "Vendor category",
      "requirements": "Key technical and contractual criteria",
      "estimatedBudget": 5000,
      "selectionTips": ["Tip 1", "Tip 2"]
    }
  ],
  "recommendations": [
    {
      "title": "Practical money-saving or experience-enhancing idea",
      "description": "Concrete execution advice",
      "estimatedCost": 0
    }
  ],
  "contingencyPlan": [
    {
      "risk": "Specific risk (e.g., weather for ${formData.environment} event, power, late vendor)",
      "mitigation": "Clear actionable backup solution",
      "severity": "high"
    }
  ]
}

Ensure all costs are positive numbers. Allocate categories so their sum is close to the total budget ${formData.totalBudget}.`;
}

/**
 * Validates and repairs AI output, ensuring deterministic arithmetic.
 */
function parseAndValidateAiResponse(rawJson: string, formData: EventFormData): EventPlan | null {
  try {
    const cleaned = rawJson
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '');

    const parsed = JSON.parse(cleaned);

    const eventOverview = {
      title: parsed.eventOverview?.title || formData.name,
      summary: parsed.eventOverview?.summary || `A beautifully coordinated celebration in ${formData.location}.`,
      theme: parsed.eventOverview?.theme || formData.themePreference || 'Classic Elegance',
      themeReason: parsed.eventOverview?.themeReason || 'Chosen to complement your celebration goals and guest experience.',
      assumptions: Array.isArray(parsed.eventOverview?.assumptions) ? parsed.eventOverview.assumptions : ['Standard venue setup time included'],
      colorPalette: Array.isArray(parsed.eventOverview?.colorPalette) ? parsed.eventOverview.colorPalette : ['#2D142C', '#E06D53', '#7C699E', '#FAF8F5'],
      venueApproach: parsed.eventOverview?.venueApproach || 'Select a venue suited to your guest count and indoor/outdoor preference.',
      menuApproach: parsed.eventOverview?.menuApproach || 'Coordinate balanced menus taking into account attendee dietary requirements.',
      entertainmentApproach: parsed.eventOverview?.entertainmentApproach || 'Engage guests with curated music and celebration highlights.',
    };

    // Deterministic arithmetic on budget categories
    const rawCategories = Array.isArray(parsed.budgetCategories)
      ? parsed.budgetCategories
      : Array.isArray(parsed.budget?.categories)
      ? parsed.budget.categories
      : [];

    const calculatedBudget = calculateBudgetMetrics(
      formData.totalBudget,
      rawCategories.length > 0 ? rawCategories : getDefaultCategoriesForType(formData),
      formData.currency
    );

    // Timeline milestones
    const timeline: TimelineMilestone[] = (Array.isArray(parsed.timeline) ? parsed.timeline : []).map(
      (item: any, idx: number) => ({
        id: `time-${Date.now()}-${idx}`,
        title: item.title || `Milestone ${idx + 1}`,
        dueDate: item.dueDate || formData.date,
        description: item.description || '',
        priority: ['high', 'medium', 'low'].includes(item.priority) ? item.priority : 'medium',
        completed: false,
      })
    );

    // Tasks
    const tasks: EventTask[] = (Array.isArray(parsed.tasks) ? parsed.tasks : []).map(
      (item: any, idx: number) => ({
        id: `tsk-${Date.now()}-${idx}`,
        title: item.title || `Task ${idx + 1}`,
        description: item.description || '',
        category: item.category || 'General',
        priority: ['high', 'medium', 'low'].includes(item.priority) ? item.priority : 'medium',
        completed: false,
      })
    );

    // Vendors
    const vendors: EventVendor[] = (Array.isArray(parsed.vendors) ? parsed.vendors : []).map(
      (item: any, idx: number) => ({
        id: `ven-${Date.now()}-${idx}`,
        category: item.category || `Vendor ${idx + 1}`,
        requirements: item.requirements || 'Standard event contract',
        estimatedBudget: Math.max(0, Number(item.estimatedBudget) || 0),
        selectionTips: Array.isArray(item.selectionTips) ? item.selectionTips : ['Review portfolio and insurance'],
        status: 'uncontacted',
      })
    );

    // Recommendations
    const recommendations: Recommendation[] = (
      Array.isArray(parsed.recommendations) ? parsed.recommendations : []
    ).map((item: any, idx: number) => ({
      id: `rec-${Date.now()}-${idx}`,
      title: item.title || `Recommendation ${idx + 1}`,
      description: item.description || '',
      estimatedCost: Math.max(0, Number(item.estimatedCost) || 0),
    }));

    // Contingency Plan
    const contingencyPlan: ContingencyRisk[] = (
      Array.isArray(parsed.contingencyPlan) ? parsed.contingencyPlan : []
    ).map((item: any, idx: number) => ({
      id: `con-${Date.now()}-${idx}`,
      risk: item.risk || 'General schedule delay',
      mitigation: item.mitigation || 'Maintain a buffer in day-of timeline.',
      severity: ['high', 'medium', 'low'].includes(item.severity) ? item.severity : 'medium',
    }));

    const plan: EventPlan = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isAiGenerated: true,
      generationNotice: 'Generated with Gemini 3.8 Flash and verified with deterministic financial arithmetic.',
      formData,
      eventOverview,
      budget: calculatedBudget,
      timeline: timeline.length > 0 ? timeline : getDefaultTimeline(formData),
      tasks: tasks.length > 0 ? tasks : getDefaultTasks(formData),
      vendors: vendors.length > 0 ? vendors : getDefaultVendors(formData),
      recommendations: recommendations.length > 0 ? recommendations : getDefaultRecommendations(formData),
      contingencyPlan: contingencyPlan.length > 0 ? contingencyPlan : getDefaultContingency(formData),
    };

    return plan;
  } catch (err) {
    console.warn('Failed to parse AI response into plan:', err);
    return null;
  }
}

/**
 * Domain-specific deterministic event planner generator
 * Guarantees zero fake failures and produces high-quality, mathematically sound event workspaces.
 */
export function generateDeterministicEventPlan(formData: EventFormData, notice: string): EventPlan {
  const categories = getDefaultCategoriesForType(formData);
  const calculatedBudget = calculateBudgetMetrics(formData.totalBudget, categories, formData.currency);

  const eventOverview = {
    title: formData.name,
    summary: `A carefully designed ${formData.eventType} celebration in ${formData.location} for ${formData.guestCount} guests, harmonizing your ${formData.style} aesthetic with thoughtful hospitality and organized timelines.`,
    theme: formData.themePreference || `${capitalize(formData.style)} Celebration Palette`,
    themeReason: `Selected specifically to optimize guest comfort and ambiance for a ${formData.environment} setting on ${formData.date}.`,
    assumptions: [
      `Venue reservation accommodates ${formData.guestCount} guests comfortably.`,
      `Estimated budget is distributed according to your priorities: ${(formData.spendingPriorities || []).join(', ') || 'balanced catering and venue'}.`,
      `Final RSVP deadline is set 3 weeks before ${formData.date}.`
    ],
    colorPalette: formData.preferredColors && formData.preferredColors.length > 0
      ? formData.preferredColors
      : ['#2D142C (Plum)', '#E06D53 (Coral)', '#7C699E (Lavender)', '#F2EEF9 (Ivory)'],
    venueApproach: formData.environment === 'outdoor'
      ? 'Outdoor venue with covered pavilion or tent rental option to ensure weather safety.'
      : 'Indoor banquet or celebration hall with designated flow for arrival, dining, and mingling.',
    menuApproach: `${formData.foodPreference || 'Gourmet selection'} customized for all dietary restrictions: ${(formData.dietaryRestrictions || ['Standard options']).join(', ')}.`,
    entertainmentApproach: `${formData.photographyEntertainmentNeeds || 'Curated music playlists and interactive guest moments'}.`,
  };

  return {
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isAiGenerated: false,
    generationNotice: notice,
    formData,
    eventOverview,
    budget: calculatedBudget,
    timeline: getDefaultTimeline(formData),
    tasks: getDefaultTasks(formData),
    vendors: getDefaultVendors(formData),
    recommendations: getDefaultRecommendations(formData),
    contingencyPlan: getDefaultContingency(formData),
  };
}

function getDefaultCategoriesForType(formData: EventFormData) {
  const budget = formData.totalBudget;
  const isWedding = formData.eventType === 'wedding';
  const isBirthday = formData.eventType === 'birthday';
  const isCollege = formData.eventType === 'college_corporate';

  if (isWedding) {
    return [
      { name: 'Catering & Open Bar', estimatedCost: Math.round(budget * 0.38), reason: `Plated service, bar, and canapes for ${formData.guestCount} guests` },
      { name: 'Venue & Facilities Rental', estimatedCost: Math.round(budget * 0.22), reason: 'Full-day site rental, ceremony space, and dressing suites' },
      { name: 'Photography & Videography', estimatedCost: Math.round(budget * 0.12), reason: 'Full day documentary coverage and high-res digital gallery' },
      { name: 'Floral Design & Lighting', estimatedCost: Math.round(budget * 0.11), reason: 'Ceremony arbor, table centerpieces, and ambiance lighting' },
      { name: 'Live Entertainment & Sound', estimatedCost: Math.round(budget * 0.08), reason: 'Ceremony acoustic musicians and evening band/DJ' },
      { name: 'Stationery & Signage', estimatedCost: Math.round(budget * 0.04), reason: 'Invitations, place cards, and welcome easel' },
      { name: 'Contingency Reserve', estimatedCost: Math.round(budget * 0.05), reason: 'Emergency buffer for unexpected guest or weather needs' },
    ];
  }

  if (isBirthday) {
    return [
      { name: 'Venue & Lounge Rental', estimatedCost: Math.round(budget * 0.32), reason: `Party space suitable for ${formData.guestCount} guests` },
      { name: 'Food, Drinks & Specialty Cake', estimatedCost: Math.round(budget * 0.38), reason: 'Heavy appetizers, beverage package, and custom themed cake' },
      { name: 'Entertainment, DJ & Games', estimatedCost: Math.round(budget * 0.14), reason: 'Sound equipment, music curation, and activities' },
      { name: 'Decor, Balloons & Photobooth', estimatedCost: Math.round(budget * 0.11), reason: 'Custom photo wall backdrop and table accents' },
      { name: 'Favors & Incidentals', estimatedCost: Math.round(budget * 0.05), reason: 'Personalized guest mementos and party supplies' },
    ];
  }

  if (isCollege) {
    return [
      { name: 'Audio Visual & Staging Production', estimatedCost: Math.round(budget * 0.35), reason: 'Stage rigging, lighting, high-power sound, and engineer' },
      { name: 'Venue & Security Infrastructure', estimatedCost: Math.round(budget * 0.25), reason: 'Auditorium/grounds rental, crowd control barriers, and security' },
      { name: 'Artist & Guest Speaker Honorariums', estimatedCost: Math.round(budget * 0.20), reason: 'Travel, lodging, and fees for featured performers' },
      { name: 'Refreshments & Volunteer Meals', estimatedCost: Math.round(budget * 0.12), reason: `Snacks and hydration stations for ${formData.guestCount} participants` },
      { name: 'Marketing, Badges & Trophies', estimatedCost: Math.round(budget * 0.08), reason: 'Promotional banners, delegate kits, and awards' },
    ];
  }

  // General / Anniversary / Community / Custom
  return [
    { name: 'Venue & Space Hire', estimatedCost: Math.round(budget * 0.30), reason: 'Primary gathering hall and parking access' },
    { name: 'Catering & Refreshments', estimatedCost: Math.round(budget * 0.35), reason: `Buffet or plated dining for ${formData.guestCount} attendees` },
    { name: 'Photography & Memory Keepsakes', estimatedCost: Math.round(budget * 0.12), reason: 'Photographer to capture milestone moments' },
    { name: 'Decorations & Theming', estimatedCost: Math.round(budget * 0.12), reason: 'Table dressing, focal wall, and entrance florals' },
    { name: 'Music & Audio Setup', estimatedCost: Math.round(budget * 0.06), reason: 'Microphones, playlist curation, and speakers' },
    { name: 'Contingency Fund', estimatedCost: Math.round(budget * 0.05), reason: 'Safety reserve for unplanned logistical costs' },
  ];
}

function getDefaultTimeline(formData: EventFormData): TimelineMilestone[] {
  const eventDate = new Date(formData.date + 'T00:00:00');
  const now = new Date();

  // Compute realistic milestone dates spaced before the event
  const daysUntil = Math.max(7, Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  const formatDate = (daysBefore: number) => {
    const d = new Date(eventDate.getTime() - daysBefore * 24 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  };

  return [
    {
      id: `time-1`,
      title: 'Confirm Venue Contract & Security Deposit',
      dueDate: formatDate(Math.floor(daysUntil * 0.8)),
      description: `Finalize rental terms in ${formData.location} and review indoor/outdoor policies.`,
      priority: 'high',
      completed: true,
    },
    {
      id: `time-2`,
      title: 'Lock In Catering & Beverage Service',
      dueDate: formatDate(Math.floor(daysUntil * 0.65)),
      description: `Agree on menu selections respecting dietary preferences (${formData.dietaryRestrictions?.join(', ') || 'Standard'}).`,
      priority: 'high',
      completed: false,
    },
    {
      id: `time-3`,
      title: 'Send Official Invitations & RSVP Deadline',
      dueDate: formatDate(Math.floor(daysUntil * 0.5)),
      description: `Distribute invitations to target ${formData.guestCount} attendees.`,
      priority: 'high',
      completed: false,
    },
    {
      id: `time-4`,
      title: 'Book Music, Photography & Entertainment',
      dueDate: formatDate(Math.floor(daysUntil * 0.35)),
      description: `Contract core entertainment and photography team to document the event.`,
      priority: 'medium',
      completed: false,
    },
    {
      id: `time-5`,
      title: 'Finalize Decor & Floor Plan Walkthrough',
      dueDate: formatDate(Math.floor(daysUntil * 0.15)),
      description: `Confirm table layouts, signage placement, and accessibility pathways.`,
      priority: 'medium',
      completed: false,
    },
    {
      id: `time-6`,
      title: 'Final Vendor Confirmation & Schedule Distribution',
      dueDate: formatDate(2),
      description: `Distribute run-of-show timeline to all vendors and core party coordinators.`,
      priority: 'high',
      completed: false,
    },
  ];
}

function getDefaultTasks(formData: EventFormData): EventTask[] {
  return [
    {
      id: `tsk-1`,
      title: 'Draft guest list and collect contact details',
      description: `Targeting ${formData.guestCount} guests with dietary preferences noted.`,
      category: 'Guest Coordination',
      priority: 'high',
      completed: true,
    },
    {
      id: `tsk-2`,
      title: 'Review and sign primary venue contract',
      description: `Ensure sound curfew, loading access, and parking are documented.`,
      category: 'Venue',
      priority: 'high',
      completed: false,
    },
    {
      id: `tsk-3`,
      title: 'Coordinate menu tasting with caterer',
      description: `Test appetizer options and main dishes with chef.`,
      category: 'Catering',
      priority: 'high',
      completed: false,
    },
    {
      id: `tsk-4`,
      title: 'Prepare music playlist and speech cue sheet',
      description: `Organize entrance song, milestone moments, and background tracks.`,
      category: 'Entertainment',
      priority: 'medium',
      completed: false,
    },
    {
      id: `tsk-5`,
      title: 'Confirm accessibility requirements with venue coordinator',
      description: `Ensure step-free pathways and appropriate seating for all attendees.`,
      category: 'Accessibility',
      priority: 'medium',
      completed: false,
    },
  ];
}

function getDefaultVendors(formData: EventFormData): EventVendor[] {
  return [
    {
      id: `ven-1`,
      category: 'Venue & Facilities',
      requirements: `Capacity for ${formData.guestCount} guests with ${formData.environment} capabilities.`,
      estimatedBudget: Math.round(formData.totalBudget * 0.25),
      selectionTips: ['Ask about cleanup fee and setup window', 'Verify noise restrictions and curfew'],
      status: 'shortlisted',
      notes: 'Initial venue inquiries dispatched.',
    },
    {
      id: `ven-2`,
      category: 'Catering & Beverages',
      requirements: `Catering service capable of accommodating dietary requirements.`,
      estimatedBudget: Math.round(formData.totalBudget * 0.35),
      selectionTips: ['Request all-inclusive per-guest quote with glassware', 'Check vendor liability insurance'],
      status: 'uncontacted',
      notes: '',
    },
    {
      id: `ven-3`,
      category: 'Photography / Videography',
      requirements: `Professional event documentation during key moments and candid guest portraits.`,
      estimatedBudget: Math.round(formData.totalBudget * 0.12),
      selectionTips: ['Review full previous event galleries', 'Confirm copyright release for printing'],
      status: 'uncontacted',
      notes: '',
    },
  ];
}

function getDefaultRecommendations(formData: EventFormData): Recommendation[] {
  return [
    {
      id: `rec-1`,
      title: 'Batch Signature Welcome Drink',
      description: 'Prepare a pre-batched craft signature punch or mocktail at arrival to delight guests immediately while cutting bartender labor queues.',
      estimatedCost: 120,
    },
    {
      id: `rec-2`,
      title: 'Digital QR Code Photo Collection',
      description: 'Place elegant acrylic cards with a QR code on tables so guests can upload candid photos directly to a shared celebration album in real time.',
      estimatedCost: 25,
    },
    {
      id: `rec-3`,
      title: 'Repurpose Ceremony Florals to Reception Tables',
      description: 'Transfer focal ceremony arrangements onto head tables or bar corners to double their visual impact at zero added cost.',
      estimatedCost: 0,
    },
  ];
}

function getDefaultContingency(formData: EventFormData): ContingencyRisk[] {
  const isOutdoor = formData.environment === 'outdoor';
  return [
    {
      id: `con-1`,
      risk: isOutdoor ? 'Adverse Weather (Rain or High Heat)' : 'Traffic or Access Delays',
      mitigation: isOutdoor
        ? 'Contract includes tenting canopy option with 48-hour weather call window.'
        : 'Publish clear parking guidance and staggered arrival windows for guests.',
      severity: 'high',
    },
    {
      id: `con-2`,
      risk: 'Power Surge or Sound Equipment Glitch',
      mitigation: 'Verify backup wireless microphone and portable battery-powered speaker on-site.',
      severity: 'medium',
    },
    {
      id: `con-3`,
      risk: 'Unconfirmed Last-Minute Dietary Needs',
      mitigation: 'Instruct caterer to prepare 5% surplus vegetarian/vegan portions as a standard safety buffer.',
      severity: 'medium',
    },
  ];
}

/**
 * Conversational event planning assistant powered by Gemini.
 * Understands active event context, answers questions, suggests budget optimizations,
 * and outputs structured action suggestions (e.g., add task, update budget).
 */
export async function chatWithEventAssistant(
  message: string,
  event: EventPlan,
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<{ reply: string; suggestedAction?: any }> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim() !== '' && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const systemPrompt = `You are Planora AI, an expert celebration architect.
You are assisting the user with their specific event:
- Name: "${event.formData.name}" (${event.formData.eventType})
- Date: ${event.formData.date}
- Guest Count: ${event.formData.guestCount}
- Location: ${event.formData.location}
- Total Budget: ${event.budget.totalBudget} ${event.budget.currency}
- Estimated Total: ${event.budget.estimatedTotal} ${event.budget.currency}
- Remaining Budget: ${event.budget.remainingBudget} ${event.budget.currency}
- Budget Categories: ${event.budget.categories.map((c) => `${c.name}: ${c.estimatedCost}`).join(', ')}
- Theme: ${event.eventOverview.theme}
- Priorities: ${event.formData.spendingPriorities?.join(', ') || 'Balanced'}

Provide a helpful, concise, actionable response.
If the user asks to add a task, adjust budget, or add a vendor, offer concrete practical recommendations.
Keep response friendly, professional, and directly focused on their event details.`;

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Question: ${message}` }] },
        ],
        config: {
          temperature: 0.5,
        },
      });

      const replyText = response.text || 'I am ready to help refine your celebration details.';

      // Check if message asks to add a specific task
      const lower = message.toLowerCase();
      let suggestedAction: any = undefined;

      if (lower.includes('task') || lower.includes('remind') || lower.includes('todo')) {
        suggestedAction = {
          type: 'add_task',
          label: 'Add suggested task to plan',
          data: {
            title: `Follow up: ${message.slice(0, 45)}...`,
            description: `Generated from assistant advice: ${replyText.slice(0, 120)}...`,
            category: 'Planning',
            priority: 'high',
          },
        };
      }

      return { reply: replyText, suggestedAction };
    } catch (err) {
      console.warn('Gemini chat assistant failed:', err);
    }
  }

  // Graceful rule-based assistant fallback
  return getRuleBasedAssistantResponse(message, event);
}

function getRuleBasedAssistantResponse(message: string, event: EventPlan) {
  const lower = message.toLowerCase();
  const currency = event.budget.currency;

  if (lower.includes('reduce') || lower.includes('budget') || lower.includes('cut') || lower.includes('save')) {
    const targetSavings = Math.round(event.budget.totalBudget * 0.15);
    return {
      reply: `To reduce this celebration budget by ~15% (${currency} ${targetSavings.toLocaleString()}):
1. **Catering Strategy**: Switch from a multi-course plated dinner to an elevated grazing station or passed gourmet sliders, typically saving 20-25% on waitstaff and kitchen fees.
2. **Repurpose Florals**: Move ceremony arrangements to reception sweetheart tables instead of paying for duplicate arrangements.
3. **Bar Package**: Focus on 2 signature craft cocktails plus wine & beer rather than an expensive full top-shelf liquor open bar.
4. **Digital Stationery**: Send elegant animated digital invitations and keep printed letterpress only for day-of table menus.`,
      suggestedAction: {
        type: 'update_budget',
        label: 'Review budget allocations',
        data: { savingsGoal: targetSavings },
      },
    };
  }

  if (lower.includes('menu') || lower.includes('food') || lower.includes('dietary') || lower.includes('vegetarian')) {
    return {
      reply: `For ${event.formData.guestCount} guests with dietary accommodations:
- **Arrival Appetizers**: Crispy wild mushroom arancini with truffle aioli (V), grilled fig and goat cheese crostini (GF), sweet chili glazed roasted vegetable skewers (VG).
- **Entrée**: Roasted butternut squash ravioli in brown butter sage reduction, or herb-crusted Chilean sea bass.
- **Family Sharing**: Roasted heirloom carrots with pomegranate glaze, warm rustic sourdough with rosemary whipped sea-salt butter.
All menu items can easily be pre-labeled with allergy indicators for guest peace of mind.`,
    };
  }

  if (lower.includes('rain') || lower.includes('weather') || lower.includes('contingency') || lower.includes('cold')) {
    return {
      reply: `Contingency Protocol for ${event.formData.location} (${event.formData.environment} setting):
1. **Weather Call Window**: Establish a formal 48-hour pre-event decision deadline with your tent rental or indoor backup coordinator.
2. **Comfort Amenities**: If temperatures drop in the evening, arrange 4-6 outdoor patio heat lamps and a basket of ivory fleece blankets.
3. **Floor Protection**: For wet grass or gravel, order interlocking bamboo or vinyl walkway rolls to protect dresses and footwear.`,
    };
  }

  if (lower.includes('task') || lower.includes('this week') || lower.includes('timeline') || lower.includes('what should i do')) {
    const pendingTasks = event.tasks.filter((t) => !t.completed).slice(0, 3);
    const taskList = pendingTasks.length > 0
      ? pendingTasks.map((t, idx) => `${idx + 1}. **${t.title}** (${t.category} - ${t.priority} priority)`).join('\n')
      : '1. Verify vendor arrival arrival schedules\n2. Confirm final headcount with caterer\n3. Pack celebration emergency kit';

    return {
      reply: `Here are the top priority action items to focus on right now:
${taskList}

Would you like me to add a quick follow-up task to your checklist?`,
      suggestedAction: {
        type: 'add_task',
        label: 'Add priority check-in task',
        data: {
          title: `Weekly celebration check-in for ${event.formData.name}`,
          description: `Review upcoming milestones and confirm vendor deadlines.`,
          category: 'Management',
          priority: 'high',
        },
      },
    };
  }

  return {
    reply: `Regarding "${event.formData.name}": With ${event.formData.guestCount} guests scheduled for ${event.formData.date} and a total budget of ${currency} ${event.budget.totalBudget.toLocaleString()}, everything is currently tracked. You can ask me how to optimize catering, adjust specific vendor line items, review weather backup plans, or generate specialized menu ideas!`,
  };
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
