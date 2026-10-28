export type EventType =
  | 'wedding'
  | 'birthday'
  | 'anniversary'
  | 'college_corporate'
  | 'community'
  | 'custom';

export type EventStyle =
  | 'elegant'
  | 'traditional'
  | 'modern'
  | 'minimalist'
  | 'festive'
  | 'custom';

export type BudgetFlexibility = 'strict' | 'moderate' | 'flexible';

export interface EventFormData {
  name: string;
  eventType: EventType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  durationHours: number;
  location: string;
  environment: 'indoor' | 'outdoor' | 'hybrid';
  totalBudget: number;
  currency: string;
  guestCount: number;
  spendingPriorities: string[];
  budgetFlexibility: BudgetFlexibility;
  themePreference: string;
  preferredColors: string[];
  style: EventStyle;
  foodPreference: string;
  dietaryRestrictions: string[];
  accessibilityRequirements: string[];
  specialRequests: string;
  venueRequirements: string;
  decorationRequirements: string;
  cateringRequirements: string;
  photographyEntertainmentNeeds: string;
  vendorRequirements: string;
  constraints: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  estimatedCost: number;
  percentage: number;
  reason: string;
}

export interface EventBudget {
  currency: string;
  totalBudget: number;
  estimatedTotal: number;
  remainingBudget: number;
  categories: BudgetCategory[];
  isOverBudget: boolean;
}

export interface TimelineMilestone {
  id: string;
  title: string;
  dueDate: string; // YYYY-MM-DD
  description: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

export interface EventTask {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  completed: boolean;
}

export type VendorStatus = 'uncontacted' | 'shortlisted' | 'contacted' | 'booked';

export interface EventVendor {
  id: string;
  category: string;
  requirements: string;
  estimatedBudget: number;
  selectionTips: string[];
  status: VendorStatus;
  notes?: string;
  quoteComparison?: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  estimatedCost?: number;
}

export interface ContingencyRisk {
  id: string;
  risk: string;
  mitigation: string;
  severity: 'high' | 'medium' | 'low';
}

export interface EventOverview {
  title: string;
  summary: string;
  theme: string;
  themeReason: string;
  assumptions: string[];
  colorPalette?: string[];
  venueApproach?: string;
  menuApproach?: string;
  entertainmentApproach?: string;
}

export interface EventPlan {
  id: string;
  createdAt: string;
  updatedAt: string;
  isAiGenerated: boolean;
  generationNotice?: string;
  formData: EventFormData;
  eventOverview: EventOverview;
  budget: EventBudget;
  timeline: TimelineMilestone[];
  tasks: EventTask[];
  vendors: EventVendor[];
  recommendations: Recommendation[];
  contingencyPlan: ContingencyRisk[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedAction?: {
    type: 'add_task' | 'update_budget' | 'add_vendor';
    data: any;
    label: string;
  };
}
