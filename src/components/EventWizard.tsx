import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Palette,
  Utensils,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  Shield,
  Loader2,
  FileCheck,
} from 'lucide-react';
import { EventFormData, EventType, EventStyle, BudgetFlexibility } from '../types';
import { validateStep1, validateStep2, validateStep3, validateCompleteEventForm } from '../utils/validation';

interface EventWizardProps {
  initialType?: EventType;
  onSubmit: (formData: EventFormData) => Promise<void>;
  onCancel: () => void;
  isGenerating: boolean;
}

export const EventWizard: React.FC<EventWizardProps> = ({
  initialType = 'wedding',
  onSubmit,
  onCancel,
  isGenerating,
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  // Compute default future date: 6 months from today
  const defaultFutureDate = () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    eventType: initialType,
    date: defaultFutureDate(),
    startTime: '17:00',
    durationHours: 6,
    location: '',
    environment: 'indoor',
    totalBudget: 15000,
    currency: 'USD',
    guestCount: 80,
    spendingPriorities: ['Catering & Beverages', 'Venue & Space'],
    budgetFlexibility: 'moderate',
    themePreference: '',
    preferredColors: ['#2D142C', '#E06D53', '#FAF8F5'],
    style: 'elegant',
    foodPreference: 'Plated multi-course dinner with vegetarian option',
    dietaryRestrictions: ['Vegetarian option', 'Nut allergy awareness'],
    accessibilityRequirements: ['Step-free ground level pathway'],
    specialRequests: '',
    venueRequirements: 'Private hall or ballroom with sound system',
    decorationRequirements: 'Warm ambient lighting and table floral centerpieces',
    cateringRequirements: 'Cocktail appetizers and dinner beverage service',
    photographyEntertainmentNeeds: 'Full evening photography coverage and sound system for speeches/music',
    vendorRequirements: 'Licensed caterer and insured venue',
    constraints: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const eventTypes: { type: EventType; label: string }[] = [
    { type: 'wedding', label: 'Wedding' },
    { type: 'birthday', label: 'Birthday' },
    { type: 'anniversary', label: 'Anniversary' },
    { type: 'college_corporate', label: 'College / Corporate' },
    { type: 'community', label: 'Community Gathering' },
    { type: 'custom', label: 'Custom Celebration' },
  ];

  const styles: { style: EventStyle; label: string; desc: string }[] = [
    { style: 'elegant', label: 'Elegant & Sophisticated', desc: 'Timeless florals, warm ambient candlelight, refined fine dining' },
    { style: 'modern', label: 'Modern & Chic', desc: 'Clean architectural lines, contemporary palettes, sleek lounge seating' },
    { style: 'traditional', label: 'Traditional & Heritage', desc: 'Cultural customs, vibrant authentic rituals, classic festive culinary' },
    { style: 'festive', label: 'Festive & Joyful', desc: 'High energy, vibrant colors, celebratory music, active dancing' },
    { style: 'minimalist', label: 'Minimalist & Organic', desc: 'Understated organic foliage, neutral earthen tones, zero clutter' },
    { style: 'custom', label: 'Bespoke Custom', desc: 'A completely customized stylistic theme defined by your vision' },
  ];

  const availableCurrencies = [
    { code: 'USD', label: 'USD ($)' },
    { code: 'INR', label: 'INR (₹)' },
    { code: 'EUR', label: 'EUR (€)' },
    { code: 'GBP', label: 'GBP (£)' },
    { code: 'CAD', label: 'CAD ($)' },
    { code: 'AUD', label: 'AUD ($)' },
  ];

  const priorityOptions = [
    'Venue & Space',
    'Catering & Beverages',
    'Photography & Video',
    'Floral & Decor',
    'Music & Live Band / DJ',
    'Specialty Lighting & AV',
    'Guest Experience & Favors',
  ];

  const togglePriority = (p: string) => {
    setFormData((prev) => {
      const exists = prev.spendingPriorities.includes(p);
      return {
        ...prev,
        spendingPriorities: exists
          ? prev.spendingPriorities.filter((item) => item !== p)
          : [...prev.spendingPriorities, p],
      };
    });
  };

  const handleNext = () => {
    let validation;
    if (currentStep === 1) validation = validateStep1(formData);
    else if (currentStep === 2) validation = validateStep2(formData);
    else if (currentStep === 3) validation = validateStep3(formData);
    else validation = { isValid: true, errors: {} };

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setCurrentStep((prev) => Math.min(5, prev + 1));
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalValidation = validateCompleteEventForm(formData);
    if (!finalValidation.isValid) {
      setErrors(finalValidation.errors);
      // jump to first step with error
      if (finalValidation.errors.name || finalValidation.errors.date || finalValidation.errors.location) {
        setCurrentStep(1);
      } else if (finalValidation.errors.totalBudget || finalValidation.errors.guestCount) {
        setCurrentStep(2);
      }
      return;
    }

    setErrors({});
    await onSubmit(formData);
  };

  const steps = [
    { num: 1, name: 'Basics' },
    { num: 2, name: 'Budget & Guests' },
    { num: 3, name: 'Style & Dining' },
    { num: 4, name: 'Logistics' },
    { num: 5, name: 'Review & Plan' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Stepper Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#E06D53]">
              Step {currentStep} of 5
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D142C]">
              {steps[currentStep - 1].name}
            </h1>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-semibold text-[#2D142C]/60 hover:text-[#2D142C] px-3 py-1.5 rounded-lg border border-[#2D142C]/10"
          >
            Cancel & Exit
          </button>
        </div>

        {/* Progress Bar */}
        <div className="grid grid-cols-5 gap-2">
          {steps.map((st) => (
            <div key={st.num} className="space-y-1">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  st.num < currentStep
                    ? 'bg-emerald-600'
                    : st.num === currentStep
                    ? 'bg-[#E06D53]'
                    : 'bg-[#2D142C]/10'
                }`}
              />
              <span
                className={`text-[11px] font-medium hidden sm:block ${
                  st.num === currentStep
                    ? 'text-[#2D142C] font-semibold'
                    : 'text-[#2D142C]/50'
                }`}
              >
                {st.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-[#2D142C]/12 rounded-3xl p-6 sm:p-10 shadow-sm">
        {/* Step 1: Basics */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <label htmlFor="eventName" className="block text-sm font-semibold text-[#2D142C] mb-1.5">
                Celebration Name *
              </label>
              <input
                id="eventName"
                type="text"
                placeholder="e.g. Elena & Julian's Garden Wedding or Liam's 30th Rooftop Soirée"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#E06D53] ${
                  errors.name ? 'border-rose-500 bg-rose-50/30' : 'border-[#2D142C]/20'
                }`}
              />
              {errors.name && (
                <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Event Category */}
            <div>
              <label className="block text-sm font-semibold text-[#2D142C] mb-2">
                Event Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {eventTypes.map((et) => (
                  <button
                    key={et.type}
                    type="button"
                    onClick={() => setFormData({ ...formData, eventType: et.type })}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold text-left transition-all border ${
                      formData.eventType === et.type
                        ? 'border-[#2D142C] bg-[#2D142C] text-white shadow-xs'
                        : 'border-[#2D142C]/15 hover:border-[#2D142C]/30 text-[#2D142C]'
                    }`}
                  >
                    {et.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date, Time, Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="eventDate" className="block text-sm font-semibold text-[#2D142C] mb-1.5">
                  Scheduled Date *
                </label>
                <div className="relative">
                  <input
                    id="eventDate"
                    type="date"
                    value={formData.date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#E06D53] ${
                      errors.date ? 'border-rose-500 bg-rose-50/30' : 'border-[#2D142C]/20'
                    }`}
                  />
                </div>
                {errors.date && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.date}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="startTime" className="block text-sm font-semibold text-[#2D142C] mb-1.5">
                  Start Time *
                </label>
                <input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#2D142C]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#E06D53]"
                />
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-semibold text-[#2D142C] mb-1.5">
                  Duration (Hours) *
                </label>
                <input
                  id="duration"
                  type="number"
                  min="0.5"
                  max="48"
                  step="0.5"
                  value={formData.durationHours}
                  onChange={(e) => setFormData({ ...formData, durationHours: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#2D142C]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#E06D53]"
                />
              </div>
            </div>

            {/* Location & Environment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="eventLocation" className="block text-sm font-semibold text-[#2D142C] mb-1.5">
                  City or Venue Location *
                </label>
                <div className="relative">
                  <input
                    id="eventLocation"
                    type="text"
                    placeholder="e.g. San Francisco, Austin, Mumbai, London"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#E06D53] ${
                      errors.location ? 'border-rose-500 bg-rose-50/30' : 'border-[#2D142C]/20'
                    }`}
                  />
                </div>
                {errors.location && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.location}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2D142C] mb-1.5">
                  Setting / Environment
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['indoor', 'outdoor', 'hybrid'] as const).map((env) => (
                    <button
                      key={env}
                      type="button"
                      onClick={() => setFormData({ ...formData, environment: env })}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold capitalize border ${
                        formData.environment === env
                          ? 'border-[#2D142C] bg-[#2D142C] text-white'
                          : 'border-[#2D142C]/15 text-[#2D142C]'
                      }`}
                    >
                      {env}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Budget & Attendees */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="totalBudget" className="block text-sm font-semibold text-[#2D142C] mb-1.5">
                  Total Budget *
                </label>
                <div className="relative">
                  <input
                    id="totalBudget"
                    type="number"
                    min="1"
                    step="100"
                    value={formData.totalBudget || ''}
                    onChange={(e) => setFormData({ ...formData, totalBudget: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#E06D53] ${
                      errors.totalBudget ? 'border-rose-500 bg-rose-50/30' : 'border-[#2D142C]/20'
                    }`}
                  />
                </div>
                {errors.totalBudget && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.totalBudget}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="currency" className="block text-sm font-semibold text-[#2D142C] mb-1.5">
                  Currency
                </label>
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#2D142C]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#E06D53] bg-white"
                >
                  {availableCurrencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="guestCount" className="block text-sm font-semibold text-[#2D142C] mb-1.5">
                  Expected Guests *
                </label>
                <input
                  id="guestCount"
                  type="number"
                  min="1"
                  max="100000"
                  value={formData.guestCount || ''}
                  onChange={(e) => setFormData({ ...formData, guestCount: parseInt(e.target.value) || 0 })}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#E06D53] ${
                    errors.guestCount ? 'border-rose-500 bg-rose-50/30' : 'border-[#2D142C]/20'
                  }`}
                />
                {errors.guestCount && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.guestCount}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2D142C] mb-1.5">
                  Budget Flexibility
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['strict', 'moderate', 'flexible'] as BudgetFlexibility[]).map((flex) => (
                    <button
                      key={flex}
                      type="button"
                      onClick={() => setFormData({ ...formData, budgetFlexibility: flex })}
                      className={`py-3 px-2 rounded-xl text-xs font-semibold capitalize border ${
                        formData.budgetFlexibility === flex
                          ? 'border-[#2D142C] bg-[#2D142C] text-white'
                          : 'border-[#2D142C]/15 text-[#2D142C]'
                      }`}
                    >
                      {flex}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Spending Priorities */}
            <div>
              <label className="block text-sm font-semibold text-[#2D142C] mb-2">
                Preferred Spending Priorities (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {priorityOptions.map((p) => {
                  const isSelected = formData.spendingPriorities.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePriority(p)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                        isSelected
                          ? 'border-[#E06D53] bg-[#E06D53]/10 text-[#E06D53]'
                          : 'border-[#2D142C]/15 text-[#2D142C]/80 hover:border-[#2D142C]/30'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{p}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Style & Dining */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#2D142C] mb-2">
                Design & Atmosphere Aesthetic *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {styles.map((st) => (
                  <button
                    key={st.style}
                    type="button"
                    onClick={() => setFormData({ ...formData, style: st.style })}
                    className={`p-4 rounded-2xl text-left border transition-all ${
                      formData.style === st.style
                        ? 'border-[#2D142C] bg-[#2D142C]/5 ring-1 ring-[#2D142C]'
                        : 'border-[#2D142C]/15 hover:border-[#2D142C]/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-serif font-bold text-sm text-[#2D142C]">
                        {st.label}
                      </span>
                      {formData.style === st.style && (
                        <span className="w-4 h-4 rounded-full bg-[#2D142C] text-white flex items-center justify-center text-[10px]">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#2D142C]/70">{st.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="themePreference" className="block text-sm font-semibold text-[#2D142C] mb-1.5">
                Specific Theme Vision or Keywords (Optional)
              </label>
              <input
                id="themePreference"
                type="text"
                placeholder="e.g. Vintage Botanical, Tuscan Sunset, Neon Retro 90s, Bollywood Extravaganza"
                value={formData.themePreference}
                onChange={(e) => setFormData({ ...formData, themePreference: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#2D142C]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#E06D53]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="foodPreference" className="block text-sm font-semibold text-[#2D142C] mb-1.5">
                  Catering & Dining Style
                </label>
                <input
                  id="foodPreference"
                  type="text"
                  placeholder="e.g. Plated 3-course, tapas grazing table, buffet feast"
                  value={formData.foodPreference}
                  onChange={(e) => setFormData({ ...formData, foodPreference: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#2D142C]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#E06D53]"
                />
              </div>

              <div>
                <label htmlFor="dietary" className="block text-sm font-semibold text-[#2D142C] mb-1.5">
                  Dietary Restrictions to Cater For
                </label>
                <input
                  id="dietary"
                  type="text"
                  placeholder="e.g. Vegetarian, Vegan, Halal, Gluten-Free, Nut Allergies"
                  value={formData.dietaryRestrictions.join(', ')}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dietaryRestrictions: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#2D142C]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#E06D53]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="accessibility" className="block text-sm font-semibold text-[#2D142C] mb-1.5">
                Accessibility Requirements
              </label>
              <input
                id="accessibility"
                type="text"
                placeholder="e.g. Wheelchair ramp, elevator to rooftop, quiet room for sensory comfort"
                value={formData.accessibilityRequirements.join(', ')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    accessibilityRequirements: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-[#2D142C]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#E06D53]"
              />
            </div>
          </div>
        )}

        {/* Step 4: Logistics */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div>
              <label htmlFor="venueRequirements" className="block text-sm font-semibold text-[#2D142C] mb-1.5">
                Venue & Space Specifics
              </label>
              <textarea
                id="venueRequirements"
                rows={2}
                placeholder="e.g. Needs parking for 50 cars, separate bridal/green room, outdoor terrace"
                value={formData.venueRequirements}
                onChange={(e) => setFormData({ ...formData, venueRequirements: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#2D142C]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#E06D53]"
              />
            </div>

            <div>
              <label htmlFor="entertainment" className="block text-sm font-semibold text-[#2D142C] mb-1.5">
                Photography, AV & Entertainment Expectations
              </label>
              <textarea
                id="entertainment"
                rows={2}
                placeholder="e.g. Live acoustic strings for arrival, modern dance DJ, wireless mics, drone footage"
                value={formData.photographyEntertainmentNeeds}
                onChange={(e) => setFormData({ ...formData, photographyEntertainmentNeeds: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#2D142C]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#E06D53]"
              />
            </div>

            <div>
              <label htmlFor="constraints" className="block text-sm font-semibold text-[#2D142C] mb-1.5">
                Important Constraints or Curfews
              </label>
              <textarea
                id="constraints"
                rows={2}
                placeholder="e.g. Sound curfew at 22:30, eco-confetti only, zero glass around swimming pool"
                value={formData.constraints}
                onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#2D142C]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#E06D53]"
              />
            </div>
          </div>
        )}

        {/* Step 5: Review & Confirm */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#2D142C]/10">
              <h3 className="font-serif text-lg font-bold text-[#2D142C] mb-1">
                Celebration Overview Review
              </h3>
              <p className="text-xs text-[#2D142C]/70">
                Review your inputs before initializing Planora AI. You can tap on any section to jump back and adjust.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-xl border border-[#2D142C]/10 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-[#7C699E]">1. Basics</span>
                  <button type="button" onClick={() => setCurrentStep(1)} className="text-xs text-[#E06D53] hover:underline font-semibold">
                    Edit
                  </button>
                </div>
                <div><strong>Name:</strong> {formData.name || 'Untitled Event'}</div>
                <div><strong>Category:</strong> <span className="capitalize">{formData.eventType}</span></div>
                <div><strong>Date & Time:</strong> {formData.date} at {formData.startTime} ({formData.durationHours}h)</div>
                <div><strong>Location:</strong> {formData.location} ({formData.environment})</div>
              </div>

              <div className="p-4 rounded-xl border border-[#2D142C]/10 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-[#7C699E]">2. Budget & Guests</span>
                  <button type="button" onClick={() => setCurrentStep(2)} className="text-xs text-[#E06D53] hover:underline font-semibold">
                    Edit
                  </button>
                </div>
                <div><strong>Budget:</strong> {formData.currency} {formData.totalBudget.toLocaleString()}</div>
                <div><strong>Guest Count:</strong> {formData.guestCount} attendees</div>
                <div><strong>Flexibility:</strong> <span className="capitalize">{formData.budgetFlexibility}</span></div>
                <div><strong>Priorities:</strong> {formData.spendingPriorities.join(', ') || 'Balanced'}</div>
              </div>

              <div className="p-4 rounded-xl border border-[#2D142C]/10 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-[#7C699E]">3. Style & Dining</span>
                  <button type="button" onClick={() => setCurrentStep(3)} className="text-xs text-[#E06D53] hover:underline font-semibold">
                    Edit
                  </button>
                </div>
                <div><strong>Aesthetic:</strong> <span className="capitalize">{formData.style}</span></div>
                <div><strong>Theme Vision:</strong> {formData.themePreference || 'Classic celebration'}</div>
                <div><strong>Dietary:</strong> {formData.dietaryRestrictions.join(', ') || 'Standard'}</div>
              </div>

              <div className="p-4 rounded-xl border border-[#2D142C]/10 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-[#7C699E]">4. Logistics</span>
                  <button type="button" onClick={() => setCurrentStep(4)} className="text-xs text-[#E06D53] hover:underline font-semibold">
                    Edit
                  </button>
                </div>
                <div><strong>Venue:</strong> {formData.venueRequirements || 'Standard venue'}</div>
                <div><strong>Entertainment:</strong> {formData.photographyEntertainmentNeeds || 'Standard'}</div>
                <div><strong>Constraints:</strong> {formData.constraints || 'None'}</div>
              </div>
            </div>

            {/* AI Architecture Note */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-700" />
                Mathematical Verification Active
              </div>
              <p>
                All AI-generated category allocations, remaining balances, and milestones will be validated with deterministic financial logic.
              </p>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="mt-8 pt-6 border-t border-[#2D142C]/10 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-xl border border-[#2D142C]/20 text-[#2D142C] hover:bg-[#FAF8F5] active:scale-95 text-sm font-semibold transition-all flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-[#2D142C] text-white hover:bg-[#1E0D1E] active:scale-95 text-sm font-semibold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4 text-[#FA8F79]" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isGenerating}
              className="px-8 py-3 rounded-xl bg-[#2D142C] text-white hover:bg-[#1E0D1E] active:scale-95 text-sm font-semibold transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#FA8F79]" />
                  <span>Synthesizing Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#FA8F79]" />
                  <span>Generate My Event Plan</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
