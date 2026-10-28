import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Calculator,
  Clock,
  Briefcase,
  ShieldAlert,
  Heart,
  Cake,
  GlassWater,
  GraduationCap,
  Users,
  Compass,
  CheckCircle2,
  DollarSign,
  ChevronRight,
} from 'lucide-react';
import { EventType, EventPlan } from '../types';

interface LandingPageProps {
  onStartPlanning: (initialType?: EventType) => void;
  onPreviewSampleEvent: (sampleId: string) => void;
  onGoToDashboard: () => void;
  sampleEvents: EventPlan[];
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartPlanning,
  onPreviewSampleEvent,
  onGoToDashboard,
  sampleEvents,
}) => {
  const categories = [
    {
      type: 'wedding' as EventType,
      title: 'Weddings & Receptions',
      tagline: 'Ceremony flow, catering, decor & multi-vendor synchronization',
      icon: Heart,
      accent: 'from-[#E06D53]/15 to-[#FA8F79]/10 text-[#E06D53]',
    },
    {
      type: 'birthday' as EventType,
      title: 'Milestone Birthdays',
      tagline: 'Themes, interactive entertainment, custom cakes & venue lounges',
      icon: Cake,
      accent: 'from-[#7C699E]/15 to-[#A393BF]/10 text-[#7C699E]',
    },
    {
      type: 'anniversary' as EventType,
      title: 'Anniversaries',
      tagline: 'Intimate dinners, nostalgic storytelling & commemorative keepsakes',
      icon: GlassWater,
      accent: 'from-[#BC6C25]/15 to-[#DDA15E]/10 text-[#BC6C25]',
    },
    {
      type: 'college_corporate' as EventType,
      title: 'College & Corporate Fests',
      tagline: 'Stage production, AV rigging, crowd control & volunteer scheduling',
      icon: GraduationCap,
      accent: 'from-[#2D142C]/10 to-[#3B183B]/5 text-[#2D142C]',
    },
    {
      type: 'community' as EventType,
      title: 'Community Gatherings',
      tagline: 'Permits, food stations, family zones & weather contingencies',
      icon: Users,
      accent: 'from-emerald-700/10 to-emerald-600/5 text-emerald-800',
    },
    {
      type: 'custom' as EventType,
      title: 'Custom Celebrations',
      tagline: 'Tailored milestone celebrations with bespoke scheduling & budget',
      icon: Compass,
      accent: 'from-sky-700/10 to-sky-600/5 text-sky-800',
    },
  ];

  const features = [
    {
      title: 'Deterministic Budget Breakdown',
      description: 'Zero math hallucinations. Category estimates, remaining funds, and percentage allocations are verified mathematically with deterministic code.',
      icon: Calculator,
      badge: 'Verified Math',
    },
    {
      title: 'Chronological Preparation Timeline',
      description: 'Milestones dynamically spaced backwards from your celebration date with priority tags and overdue tracking.',
      icon: Clock,
      badge: 'Dynamic Scheduling',
    },
    {
      title: 'Comprehensive Vendor Briefs',
      description: 'Pre-drafted requirement checklists, interview questions, and budget allocations for catering, sound, venue, and photography.',
      icon: Briefcase,
      badge: 'Vendor Readiness',
    },
    {
      title: 'Actionable Contingency Planning',
      description: 'Context-aware risk mitigations for outdoor weather shifts, electrical overloads, and last-minute dietary additions.',
      icon: ShieldAlert,
      badge: 'Risk Mitigation',
    },
  ];

  const previewEvent = sampleEvents.find((e) => e.formData.eventType === 'wedding') || sampleEvents[0];

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-16 sm:pb-20">
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E06D53]/10 border border-[#E06D53]/20 text-[#E06D53] text-xs font-semibold uppercase tracking-wider mb-8 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Event Planning Architecture</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-[#2D142C] tracking-tight leading-[1.1] mb-6">
            Your celebration,{' '}
            <span className="italic font-normal text-[#E06D53]">perfectly planned.</span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-[#2D142C]/75 font-normal leading-relaxed mb-10">
            From intimate birthday soirées to 200-guest botanical weddings. Turn your vision, budget, and guest count into a comprehensive, mathematically verified event blueprint in seconds.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onStartPlanning()}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#2D142C] text-white hover:bg-[#1E0D1E] active:scale-98 text-base font-semibold shadow-lg shadow-[#2D142C]/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Create My Event</span>
              <ArrowRight className="w-5 h-5 text-[#FA8F79] group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onGoToDashboard}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white border border-[#2D142C]/15 text-[#2D142C] hover:bg-[#FAF8F5] active:scale-98 text-base font-medium transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View Saved Celebrations</span>
              <ChevronRight className="w-4 h-4 text-[#7C699E]" />
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="mt-14 pt-8 border-t border-[#2D142C]/10 flex flex-wrap items-center justify-center gap-y-3 gap-x-8 text-xs font-medium text-[#2D142C]/70">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Real Mathematical Budgets
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Dynamic Timeline Generator
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Zero Browser API Key Exposure
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Instant Print & Markdown Export
            </span>
          </div>
        </div>
      </section>

      {/* Supported Event Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2D142C] mb-3">
            Tailored For Every Gathering
          </h2>
          <p className="text-base text-[#2D142C]/70">
            Select a celebration category to initiate a guided planning workflow tailored to that event’s unique logistical needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.type}
                className="group relative bg-white border border-[#2D142C]/10 rounded-2xl p-6 hover:shadow-md hover:border-[#2D142C]/25 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${cat.accent} flex items-center justify-center mb-5 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#2D142C] mb-2">
                    {cat.title}
                  </h3>
                  <p className="text-sm text-[#2D142C]/70 leading-relaxed mb-6">
                    {cat.tagline}
                  </p>
                </div>

                <button
                  onClick={() => onStartPlanning(cat.type)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider bg-[#FAF8F5] text-[#2D142C] hover:bg-[#2D142C] hover:text-white transition-colors flex items-center justify-between"
                >
                  <span>Plan {cat.title.split(' ')[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Sample Event Plan Preview */}
      {previewEvent && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-[#2D142C]/15 rounded-3xl p-6 sm:p-10 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-[#2D142C]/10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E06D53]/15 text-[#E06D53] uppercase tracking-wider">
                    Interactive Plan Preview
                  </span>
                  <span className="text-xs text-[#2D142C]/60">•</span>
                  <span className="text-xs text-[#2D142C]/70 font-medium">
                    {previewEvent.formData.location} • {previewEvent.formData.guestCount} Guests
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D142C]">
                  {previewEvent.formData.name}
                </h3>
                <p className="text-sm text-[#2D142C]/75 mt-1 max-w-2xl">
                  {previewEvent.eventOverview.summary}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onPreviewSampleEvent(previewEvent.id)}
                  className="px-6 py-3 rounded-xl bg-[#2D142C] text-white hover:bg-[#1E0D1E] active:scale-95 text-sm font-semibold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <span>Open Full Workspace</span>
                  <ArrowRight className="w-4 h-4 text-[#FA8F79]" />
                </button>
              </div>
            </div>

            {/* Preview Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
              {/* Budget snippet */}
              <div className="bg-[#FAF8F5] rounded-2xl p-5 border border-[#2D142C]/8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2D142C]/60">Budget Breakdown</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Within Limit
                  </span>
                </div>
                <div className="text-2xl font-serif font-bold text-[#2D142C]">
                  ${previewEvent.budget.estimatedTotal.toLocaleString()}{' '}
                  <span className="text-xs font-sans font-normal text-[#2D142C]/60">
                    / ${previewEvent.budget.totalBudget.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-[#2D142C]/70 mt-2">
                  Remaining reserve: ${previewEvent.budget.remainingBudget.toLocaleString()} ({previewEvent.budget.categories.length} categories)
                </p>
              </div>

              {/* Timeline snippet */}
              <div className="bg-[#FAF8F5] rounded-2xl p-5 border border-[#2D142C]/8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2D142C]/60">Timeline Roadmap</span>
                  <span className="text-xs font-medium text-[#7C699E]">
                    {previewEvent.timeline.length} Milestones
                  </span>
                </div>
                <div className="text-sm font-semibold text-[#2D142C] truncate">
                  Next: {previewEvent.timeline[2]?.title || 'Venue walkthrough'}
                </div>
                <p className="text-xs text-[#2D142C]/70 mt-2">
                  Target Due Date: {previewEvent.timeline[2]?.dueDate || previewEvent.formData.date}
                </p>
              </div>

              {/* Theme & Palette snippet */}
              <div className="bg-[#FAF8F5] rounded-2xl p-5 border border-[#2D142C]/8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2D142C]/60">Theme & Palette</span>
                  <span className="text-xs font-medium text-[#E06D53]">Curated</span>
                </div>
                <div className="text-sm font-semibold text-[#2D142C] truncate">
                  {previewEvent.eventOverview.theme}
                </div>
                <div className="flex items-center gap-1.5 mt-2.5">
                  {(previewEvent.formData.preferredColors || ['#3A5A40', '#DDA15E', '#BC6C25']).map((c, i) => (
                    <span
                      key={i}
                      className="w-4 h-4 rounded-full border border-black/10 inline-block shadow-xs"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                  <span className="text-xs text-[#2D142C]/60 ml-2">Harmonized</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Feature Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2D142C] mb-3">
            Built for Reliable Event Execution
          </h2>
          <p className="text-base text-[#2D142C]/70">
            Unlike generic AI chat windows, Planora produces an organized, persistent workspace with real calculations, task states, and exportable documentation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-[#2D142C]/10 rounded-2xl p-8 hover:shadow-md transition-all flex gap-5"
              >
                <div className="w-12 h-12 rounded-xl bg-[#2D142C]/5 text-[#2D142C] flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-[#E06D53]" />
                </div>
                <div>
                  <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#7C699E]/10 text-[#7C699E] mb-2">
                    {feat.badge}
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#2D142C] mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-[#2D142C]/75 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it Works: 4 Steps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF8F5] border border-[#2D142C]/10 rounded-3xl p-8 sm:p-12">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-serif font-bold text-[#2D142C] mb-2">
              How Planora AI Operates
            </h2>
            <p className="text-sm text-[#2D142C]/70">
              A systematic workflow from initial dream to day-of execution.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Capture Event Vision',
                desc: 'Input your celebration type, date, location, guest headcount, budget cap, and dietary preferences.',
              },
              {
                step: '02',
                title: 'AI Blueprint Engine',
                desc: 'Gemini models synthesize the requirements into structured budgets, vendor profiles, and timelines.',
              },
              {
                step: '03',
                title: 'Interactive Refinement',
                desc: 'Check off tasks, adjust line item costs, log vendor quotes, and consult the event assistant anytime.',
              },
              {
                step: '04',
                title: 'Print & Coordinate',
                desc: 'Generate clean executive briefs, print runs-of-show, or export complete data for family and coordinators.',
              },
            ].map((st, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-[#2D142C]/8 relative">
                <span className="font-serif text-3xl font-bold text-[#E06D53]/40 mb-3 block">
                  {st.step}
                </span>
                <h4 className="font-serif text-lg font-bold text-[#2D142C] mb-1.5">{st.title}</h4>
                <p className="text-xs text-[#2D142C]/75 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => onStartPlanning()}
              className="px-8 py-3.5 rounded-xl bg-[#2D142C] text-white hover:bg-[#1E0D1E] active:scale-95 text-sm font-semibold transition-all shadow-md inline-flex items-center gap-2"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4 text-[#FA8F79]" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
