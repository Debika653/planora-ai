import React, { useState } from 'react';
import {
  PlusCircle,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Trash2,
  Copy,
  FolderOpen,
  Search,
  Filter,
  Sparkles,
} from 'lucide-react';
import { EventPlan, EventType } from '../types';
import { formatCurrency } from '../utils/budgetCalculations';

interface DashboardViewProps {
  events: EventPlan[];
  onOpenEvent: (eventId: string) => void;
  onCreateNew: () => void;
  onDuplicate: (eventId: string) => void;
  onDelete: (eventId: string) => void;
  onLoadSamples: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  events,
  onOpenEvent,
  onCreateNew,
  onDuplicate,
  onDelete,
  onLoadSamples,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);

  // Compute real metrics from actual saved events
  const totalBudgetAcrossEvents = events.reduce((sum, e) => sum + (e.budget?.totalBudget || 0), 0);
  const totalEstimatedCosts = events.reduce((sum, e) => sum + (e.budget?.estimatedTotal || 0), 0);

  const allTasks = events.flatMap((e) => e.tasks || []);
  const completedTasks = allTasks.filter((t) => t.completed).length;
  const overallTaskProgress = allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0;
  const outstandingTasksCount = allTasks.length - completedTasks;

  // Filter events
  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.formData.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.formData.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.eventOverview?.theme || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      selectedTypeFilter === 'all' || e.formData.eventType === selectedTypeFilter;
    return matchesSearch && matchesType;
  });

  const confirmDelete = () => {
    if (deleteCandidateId) {
      onDelete(deleteCandidateId);
      setDeleteCandidateId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#2D142C]/10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2D142C]">
            Celebration Workspace
          </h1>
          <p className="text-sm text-[#2D142C]/70 mt-1">
            Real-time management for all your planned gatherings, budgets, and milestones.
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="px-5 py-3 rounded-2xl bg-[#2D142C] text-white hover:bg-[#1E0D1E] active:scale-95 text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-[#FA8F79]" />
          <span>Plan New Event</span>
        </button>
      </div>

      {/* Metrics Row (Derived from real event records) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-[#2D142C]/10 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#2D142C]/60 mb-2">
            <span>Celebrations</span>
            <Calendar className="w-4 h-4 text-[#7C699E]" />
          </div>
          <div className="text-3xl font-serif font-bold text-[#2D142C]">
            {events.length}
          </div>
          <p className="text-xs text-[#2D142C]/65 mt-1">
            {events.length === 1 ? '1 active celebration' : `${events.length} planned gatherings`}
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-[#2D142C]/10 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#2D142C]/60 mb-2">
            <span>Total Budget Tracked</span>
            <DollarSign className="w-4 h-4 text-[#E06D53]" />
          </div>
          <div className="text-3xl font-serif font-bold text-[#2D142C]">
            {formatCurrency(totalBudgetAcrossEvents, events[0]?.formData?.currency || 'USD')}
          </div>
          <p className="text-xs text-[#2D142C]/65 mt-1">
            Allocated: {formatCurrency(totalEstimatedCosts, events[0]?.formData?.currency || 'USD')}
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-[#2D142C]/10 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#2D142C]/60 mb-2">
            <span>Task Completion</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-serif font-bold text-[#2D142C]">
            {overallTaskProgress}%
          </div>
          <div className="w-full bg-[#2D142C]/10 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${overallTaskProgress}%` }}
            />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-[#2D142C]/10 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#2D142C]/60 mb-2">
            <span>Outstanding Tasks</span>
            <Clock className="w-4 h-4 text-[#BC6C25]" />
          </div>
          <div className="text-3xl font-serif font-bold text-[#2D142C]">
            {outstandingTasksCount}
          </div>
          <p className="text-xs text-[#2D142C]/65 mt-1">
            {completedTasks} completed across plans
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      {events.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#2D142C]/10 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2D142C]/40" />
            <input
              type="text"
              placeholder="Search by name, location, or theme..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[#FAF8F5] border border-transparent focus:border-[#E06D53] focus:bg-white focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <Filter className="w-3.5 h-3.5 text-[#2D142C]/50 shrink-0" />
            {['all', 'wedding', 'birthday', 'anniversary', 'college_corporate', 'community'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedTypeFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                  selectedTypeFilter === cat
                    ? 'bg-[#2D142C] text-white'
                    : 'bg-[#FAF8F5] text-[#2D142C]/70 hover:text-[#2D142C]'
                }`}
              >
                {cat === 'all' ? 'All Events' : cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Events List / Grid */}
      {events.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-[#2D142C]/12 rounded-3xl p-10 sm:p-16 text-center max-w-xl mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#E06D53]/10 text-[#E06D53] flex items-center justify-center mx-auto mb-5">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#2D142C] mb-2">
            No Celebrations Planned Yet
          </h2>
          <p className="text-sm text-[#2D142C]/75 leading-relaxed mb-8">
            Create your first celebration plan with our AI architecture, or load an inspiring sample wedding or birthday to explore the interactive dashboard immediately.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onCreateNew}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2D142C] text-white hover:bg-[#1E0D1E] active:scale-95 text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#FA8F79]" />
              <span>Create My First Event</span>
            </button>

            <button
              onClick={onLoadSamples}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#FAF8F5] border border-[#2D142C]/15 text-[#2D142C] hover:bg-white active:scale-95 text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Load Sample Celebrations</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => {
            const completedCount = (evt.tasks || []).filter((t) => t.completed).length;
            const totalTasks = (evt.tasks || []).length;
            const taskPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
            const isOver = evt.budget?.isOverBudget;

            return (
              <div
                key={evt.id}
                className="bg-white border border-[#2D142C]/12 rounded-3xl p-6 shadow-xs hover:shadow-md hover:border-[#2D142C]/25 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#2D142C]/6 text-[#2D142C]">
                      {evt.formData.eventType.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-semibold text-[#7C699E] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {evt.formData.date}
                    </span>
                  </div>

                  <h3 className="text-xl font-serif font-bold text-[#2D142C] line-clamp-1 mb-1">
                    {evt.formData.name}
                  </h3>
                  <p className="text-xs text-[#2D142C]/65 mb-4">
                    {evt.formData.location} • {evt.formData.guestCount} guests • {evt.formData.environment}
                  </p>

                  {/* Budget summary */}
                  <div className="bg-[#FAF8F5] rounded-xl p-3 mb-4 space-y-1 text-xs">
                    <div className="flex justify-between items-center text-[#2D142C]/70">
                      <span>Budget Utilization:</span>
                      <span className={`font-semibold ${isOver ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {formatCurrency(evt.budget?.estimatedTotal || 0, evt.formData.currency)} / {formatCurrency(evt.budget?.totalBudget || 0, evt.formData.currency)}
                      </span>
                    </div>
                    {isOver && (
                      <div className="flex items-center gap-1 text-[11px] text-rose-600 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>Estimates exceed planned limit</span>
                      </div>
                    )}
                  </div>

                  {/* Task progress */}
                  <div className="space-y-1.5 mb-6">
                    <div className="flex justify-between text-xs text-[#2D142C]/70 font-medium">
                      <span>Tasks Complete</span>
                      <span>
                        {completedCount}/{totalTasks} ({taskPct}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#2D142C]/10 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${taskPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="pt-4 border-t border-[#2D142C]/8 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onOpenEvent(evt.id)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#2D142C] text-white hover:bg-[#1E0D1E] active:scale-95 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-[#FA8F79]" />
                    <span>Open Workspace</span>
                  </button>

                  <button
                    onClick={() => onDuplicate(evt.id)}
                    title="Duplicate Event"
                    aria-label="Duplicate Event"
                    className="p-2 rounded-xl border border-[#2D142C]/10 hover:bg-[#FAF8F5] text-[#2D142C]/70 hover:text-[#2D142C] transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setDeleteCandidateId(evt.id)}
                    title="Delete Event"
                    aria-label="Delete Event"
                    className="p-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Accessible Confirmation Dialog for Deletion */}
      {deleteCandidateId && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="deleteDialogTitle"
          className="fixed inset-0 z-50 bg-[#2D142C]/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#2D142C]/10">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 id="deleteDialogTitle" className="font-serif text-xl font-bold text-[#2D142C] mb-2">
              Confirm Event Deletion
            </h3>
            <p className="text-sm text-[#2D142C]/70 leading-relaxed mb-6">
              Are you sure you want to delete this celebration? This will remove all associated budgets, task checklists, and timeline milestones. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteCandidateId(null)}
                className="px-4 py-2.5 rounded-xl border border-[#2D142C]/15 text-sm font-semibold text-[#2D142C] hover:bg-[#FAF8F5] transition-colors"
              >
                Keep Celebration
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition-colors shadow-sm"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
