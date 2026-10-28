import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Palette,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Printer,
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Filter,
  Check,
  ChevronDown,
  ShieldAlert,
  Lightbulb,
  ArrowLeft,
  X,
} from 'lucide-react';
import { EventPlan, EventTask, EventVendor, BudgetCategory, TimelineMilestone } from '../types';
import { formatCurrency, validateCategoryInput } from '../utils/budgetCalculations';

interface EventWorkspaceProps {
  event: EventPlan;
  onBackToDashboard: () => void;
  onToggleTask: (taskId: string) => void;
  onAddTask: (task: Omit<EventTask, 'id'>) => void;
  onUpdateTask: (task: EventTask) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleMilestone: (milestoneId: string) => void;
  onUpdateVendor: (vendor: EventVendor) => void;
  onAddBudgetCategory: (category: { name: string; estimatedCost: number; reason: string }) => void;
  onDeleteBudgetCategory: (catId: string) => void;
  onOpenAssistant: () => void;
  onOpenExport: () => void;
}

type TabType = 'overview' | 'budget' | 'timeline' | 'tasks' | 'vendors' | 'recommendations' | 'contingency';

export const EventWorkspace: React.FC<EventWorkspaceProps> = ({
  event,
  onBackToDashboard,
  onToggleTask,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleMilestone,
  onUpdateVendor,
  onAddBudgetCategory,
  onDeleteBudgetCategory,
  onOpenAssistant,
  onOpenExport,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Task filtering state
  const [taskCategoryFilter, setTaskCategoryFilter] = useState<string>('all');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<string>('all');
  const [taskSearchQuery, setTaskSearchQuery] = useState('');

  // Add Task Modal State
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('Planning');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newTaskDesc, setNewTaskDesc] = useState('');

  // Add Budget Category Modal State
  const [isAddBudgetModalOpen, setIsAddBudgetModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatCost, setNewCatCost] = useState('');
  const [newCatReason, setNewCatReason] = useState('');
  const [budgetCatError, setBudgetCatError] = useState<string | null>(null);

  // Edit Vendor Notes State
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);
  const [vendorNotesInput, setVendorNotesInput] = useState('');

  const curr = event.formData.currency || 'USD';
  const totalTasks = event.tasks.length;
  const completedTasks = event.tasks.filter((t) => t.completed).length;
  const taskProgressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Filter tasks
  const filteredTasks = event.tasks.filter((t) => {
    const matchesCat = taskCategoryFilter === 'all' || t.category === taskCategoryFilter;
    const matchesPriority = taskPriorityFilter === 'all' || t.priority === taskPriorityFilter;
    const matchesSearch =
      t.title.toLowerCase().includes(taskSearchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(taskSearchQuery.toLowerCase());
    return matchesCat && matchesPriority && matchesSearch;
  });

  const uniqueTaskCategories = Array.from(new Set(event.tasks.map((t) => t.category)));

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    onAddTask({
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      category: newTaskCategory,
      priority: newTaskPriority,
      completed: false,
    });

    setNewTaskTitle('');
    setNewTaskDesc('');
    setIsAddTaskModalOpen(false);
  };

  const handleCreateBudgetCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const costNum = parseFloat(newCatCost);
    const validation = validateCategoryInput(newCatName, costNum);
    if (!validation.isValid) {
      setBudgetCatError(validation.error || 'Invalid input');
      return;
    }

    onAddBudgetCategory({
      name: newCatName.trim(),
      estimatedCost: costNum,
      reason: newCatReason.trim() || 'Custom allocation',
    });

    setNewCatName('');
    setNewCatCost('');
    setNewCatReason('');
    setBudgetCatError(null);
    setIsAddBudgetModalOpen(false);
  };

  const startEditVendor = (v: EventVendor) => {
    setEditingVendorId(v.id);
    setVendorNotesInput(v.notes || '');
  };

  const saveVendorNotes = (vendor: EventVendor) => {
    onUpdateVendor({
      ...vendor,
      notes: vendorNotesInput,
    });
    setEditingVendorId(null);
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview' },
    { id: 'budget' as TabType, label: 'Budget Breakdown' },
    { id: 'timeline' as TabType, label: 'Timeline' },
    { id: 'tasks' as TabType, label: `Tasks (${completedTasks}/${totalTasks})` },
    { id: 'vendors' as TabType, label: `Vendors (${event.vendors.length})` },
    { id: 'recommendations' as TabType, label: 'Ideas & Tips' },
    { id: 'contingency' as TabType, label: 'Contingency' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print pb-2">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2D142C]/70 hover:text-[#2D142C] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Celebrations</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenAssistant}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2D142C] to-[#3B183B] text-white hover:opacity-95 active:scale-95 text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FA8F79]" />
            <span>Ask AI Assistant</span>
          </button>

          <button
            onClick={onOpenExport}
            className="px-4 py-2 rounded-xl bg-white border border-[#2D142C]/15 hover:bg-[#FAF8F5] text-[#2D142C] active:scale-95 text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#7C699E]" />
            <span>Export & Print</span>
          </button>
        </div>
      </div>

      {/* Workspace Hero Header */}
      <div className="bg-white border border-[#2D142C]/12 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#2D142C] text-white">
                {event.formData.eventType.replace('_', ' ')}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E06D53]/15 text-[#E06D53]">
                {event.eventOverview.theme}
              </span>
              {event.isAiGenerated && (
                <span className="text-[11px] text-[#7C699E] font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#FA8F79]" />
                  AI Verified Architecture
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#2D142C]">
              {event.formData.name}
            </h1>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-[#2D142C]/75 font-medium mt-3">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#7C699E]" />
                {event.formData.date} at {event.formData.startTime} ({event.formData.durationHours}h)
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#BC6C25]" />
                {event.formData.location} ({event.formData.environment})
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#E06D53]" />
                {event.formData.guestCount} Guests
              </span>
            </div>
          </div>

          {/* Quick Metrics Capsule */}
          <div className="flex items-center gap-4 bg-[#FAF8F5] border border-[#2D142C]/10 rounded-2xl p-4 shrink-0">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#2D142C]/60">Budget Status</div>
              <div className={`text-xl font-serif font-bold ${event.budget.isOverBudget ? 'text-rose-600' : 'text-[#2D142C]'}`}>
                {formatCurrency(event.budget.estimatedTotal, curr)}
              </div>
              <div className="text-[10px] text-[#2D142C]/60">
                Limit: {formatCurrency(event.budget.totalBudget, curr)}
              </div>
            </div>

            <div className="w-px h-10 bg-[#2D142C]/10" />

            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#2D142C]/60">Tasks Progress</div>
              <div className="text-xl font-serif font-bold text-emerald-700">
                {taskProgressPct}%
              </div>
              <div className="text-[10px] text-[#2D142C]/60">
                {completedTasks}/{totalTasks} Done
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-[#2D142C]/10 flex gap-2 overflow-x-auto no-print pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#2D142C] text-[#2D142C]'
                : 'border-transparent text-[#2D142C]/60 hover:text-[#2D142C]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Executive Summary */}
            <div className="lg:col-span-2 bg-white border border-[#2D142C]/10 rounded-3xl p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#2D142C] mb-2">
                  Executive Celebration Concept
                </h3>
                <p className="text-sm text-[#2D142C]/80 leading-relaxed">
                  {event.eventOverview.summary}
                </p>
              </div>

              {/* Theme Rationale */}
              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#2D142C]/8 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#E06D53]">
                  Theme Rationale
                </span>
                <p className="text-xs sm:text-sm text-[#2D142C]/80 leading-relaxed">
                  {event.eventOverview.themeReason}
                </p>
              </div>

              {/* Approach Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-[#2D142C]/10 space-y-1">
                  <div className="font-bold text-[#2D142C]">Venue Spatial Flow</div>
                  <p className="text-[#2D142C]/70">{event.eventOverview.venueApproach || 'Dedicated entrance, dining, and mingling spaces.'}</p>
                </div>
                <div className="p-4 rounded-xl border border-[#2D142C]/10 space-y-1">
                  <div className="font-bold text-[#2D142C]">Culinary & Dietary</div>
                  <p className="text-[#2D142C]/70">{event.eventOverview.menuApproach || 'Balanced menu respecting attendee dietary requirements.'}</p>
                </div>
                <div className="p-4 rounded-xl border border-[#2D142C]/10 space-y-1">
                  <div className="font-bold text-[#2D142C]">Entertainment Flow</div>
                  <p className="text-[#2D142C]/70">{event.eventOverview.entertainmentApproach || 'Engaging music and celebration moments.'}</p>
                </div>
              </div>

              {/* Key Planning Assumptions */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D142C]/60 mb-2.5">
                  Planning Assumptions & Parameters
                </h4>
                <ul className="space-y-1.5 text-xs text-[#2D142C]/75 list-disc list-inside">
                  {event.eventOverview.assumptions.map((assump, i) => (
                    <li key={i}>{assump}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sidebar Overview Details */}
            <div className="space-y-6">
              {/* Color Palette */}
              <div className="bg-white border border-[#2D142C]/10 rounded-3xl p-6 space-y-3">
                <h3 className="font-serif text-base font-bold text-[#2D142C] flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-[#7C699E]" />
                  <span>Harmonized Palette</span>
                </h3>
                <div className="space-y-2">
                  {(event.eventOverview.colorPalette || ['#2D142C', '#E06D53', '#7C699E', '#FAF8F5']).map((col, i) => {
                    // Extract hex if contains hex
                    const hexMatch = col.match(/#[0-9a-fA-F]{6}/);
                    const hex = hexMatch ? hexMatch[0] : '#2D142C';
                    return (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-[#FAF8F5] border border-[#2D142C]/6">
                        <span
                          className="w-6 h-6 rounded-lg border border-black/10 shrink-0 shadow-xs"
                          style={{ backgroundColor: hex }}
                        />
                        <span className="text-xs font-medium text-[#2D142C] truncate">
                          {col}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick AI Tip card */}
              <div className="bg-[#FAF8F5] border border-[#2D142C]/10 rounded-3xl p-6 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#E06D53]">
                  <Lightbulb className="w-4 h-4" />
                  <span>Planner Tip</span>
                </div>
                <p className="text-xs text-[#2D142C]/75 leading-relaxed">
                  Use the Assistant drawer anytime to run "what-if" simulations, such as cutting the catering budget by 10% or creating a wet-weather alternative setup.
                </p>
                <button
                  onClick={onOpenAssistant}
                  className="mt-2 text-xs font-semibold text-[#2D142C] hover:underline"
                >
                  Consult Planora Assistant →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. BUDGET BREAKDOWN TAB */}
      {activeTab === 'budget' && (
        <div className="space-y-6">
          {/* Budget Overview Header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-[#2D142C]/10 rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2D142C]/60 block mb-1">Total Budget Target</span>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#2D142C]">
                {formatCurrency(event.budget.totalBudget, curr)}
              </div>
            </div>

            <div className="bg-white border border-[#2D142C]/10 rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2D142C]/60 block mb-1">Estimated Total Sum</span>
              <div className={`text-2xl sm:text-3xl font-serif font-bold ${event.budget.isOverBudget ? 'text-rose-600' : 'text-[#2D142C]'}`}>
                {formatCurrency(event.budget.estimatedTotal, curr)}
              </div>
            </div>

            <div className="bg-white border border-[#2D142C]/10 rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2D142C]/60 block mb-1">Remaining Buffer</span>
              <div className={`text-2xl sm:text-3xl font-serif font-bold ${event.budget.remainingBudget < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {formatCurrency(event.budget.remainingBudget, curr)}
              </div>
            </div>
          </div>

          {/* Overspending Alert if applicable */}
          {event.budget.isOverBudget && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
              <div>
                <strong>Overspending Warning:</strong> The sum of estimated categories exceeds your planned total budget by {formatCurrency(Math.abs(event.budget.remainingBudget), curr)}. You can adjust line items or ask the assistant to rebalance.
              </div>
            </div>
          )}

          {/* Categories Table */}
          <div className="bg-white border border-[#2D142C]/12 rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#2D142C]/10 mb-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#2D142C]">
                  Allocations by Category
                </h3>
                <p className="text-xs text-[#2D142C]/65">
                  All category sums and percentages are calculated deterministically.
                </p>
              </div>
              <button
                onClick={() => setIsAddBudgetModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#2D142C] text-white hover:bg-[#1E0D1E] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[#2D142C]/10 text-xs font-bold uppercase tracking-wider text-[#2D142C]/60">
                    <th className="pb-3 pr-4">Category</th>
                    <th className="pb-3 px-4">Estimated Cost</th>
                    <th className="pb-3 px-4">Share</th>
                    <th className="pb-3 px-4">Rationale</th>
                    <th className="pb-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D142C]/6">
                  {event.budget.categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                      <td className="py-3.5 pr-4 font-semibold text-[#2D142C]">{cat.name}</td>
                      <td className="py-3.5 px-4 font-bold text-[#2D142C]">
                        {formatCurrency(cat.estimatedCost, curr)}
                      </td>
                      <td className="py-3.5 px-4 text-[#7C699E] font-medium">
                        {cat.percentage}%
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#2D142C]/70 max-w-xs">{cat.reason}</td>
                      <td className="py-3.5 pl-4 text-right">
                        <button
                          onClick={() => onDeleteBudgetCategory(cat.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. TIMELINE TAB */}
      {activeTab === 'timeline' && (
        <div className="bg-white border border-[#2D142C]/12 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#2D142C]/10">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#2D142C]">
                Chronological Milestone Roadmap
              </h3>
              <p className="text-xs text-[#2D142C]/65">
                Target milestones organized chronologically leading up to celebration day.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {event.timeline.map((mile, idx) => {
              const isPast = new Date(mile.dueDate + 'T00:00:00') < new Date() && !mile.completed;
              return (
                <div
                  key={mile.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                    mile.completed
                      ? 'bg-emerald-50/40 border-emerald-200 opacity-80'
                      : isPast
                      ? 'bg-amber-50/40 border-amber-300'
                      : 'bg-[#FAF8F5] border-[#2D142C]/10'
                  }`}
                >
                  <button
                    onClick={() => onToggleMilestone(mile.id)}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors cursor-pointer ${
                      mile.completed
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-[#2D142C]/20 bg-white hover:border-[#2D142C]'
                    }`}
                  >
                    {mile.completed && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <h4 className={`text-sm sm:text-base font-bold ${mile.completed ? 'line-through text-[#2D142C]/50' : 'text-[#2D142C]'}`}>
                        {mile.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        {isPast && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-200 text-amber-900">
                            Action Due
                          </span>
                        )}
                        <span className="text-xs font-semibold text-[#7C699E] flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {mile.dueDate}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          mile.priority === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {mile.priority}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-[#2D142C]/75">{mile.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. TASKS TAB */}
      {activeTab === 'tasks' && (
        <div className="bg-white border border-[#2D142C]/12 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2D142C]/10">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#2D142C]">
                Task Checklist & Operations
              </h3>
              <p className="text-xs text-[#2D142C]/65">
                Add, manage, and complete tasks with priority and category tags.
              </p>
            </div>
            <button
              onClick={() => setIsAddTaskModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#2D142C] text-white hover:bg-[#1E0D1E] text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3 bg-[#FAF8F5] p-3 rounded-2xl border border-[#2D142C]/8 text-xs">
            <input
              type="text"
              placeholder="Search tasks..."
              value={taskSearchQuery}
              onChange={(e) => setTaskSearchQuery(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#2D142C]/12 focus:outline-none focus:border-[#E06D53] w-full sm:w-56"
            />

            <select
              value={taskCategoryFilter}
              onChange={(e) => setTaskCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#2D142C]/12 focus:outline-none text-[#2D142C]"
            >
              <option value="all">All Categories</option>
              {uniqueTaskCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={taskPriorityFilter}
              onChange={(e) => setTaskPriorityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#2D142C]/12 focus:outline-none text-[#2D142C]"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          {/* Tasks List */}
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#2D142C]/60">
                No matching tasks found. Click "Create Task" above to add one.
              </div>
            ) : (
              filteredTasks.map((t) => (
                <div
                  key={t.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                    t.completed
                      ? 'bg-emerald-50/30 border-emerald-200'
                      : 'bg-[#FAF8F5] border-[#2D142C]/10 hover:border-[#2D142C]/20'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => onToggleTask(t.id)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors cursor-pointer ${
                        t.completed
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-[#2D142C]/25 bg-white hover:border-[#2D142C]'
                      }`}
                    >
                      {t.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`text-sm font-semibold ${t.completed ? 'line-through text-[#2D142C]/50' : 'text-[#2D142C]'}`}>
                          {t.title}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#2D142C]/8 text-[#2D142C]">
                          {t.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          t.priority === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {t.priority}
                        </span>
                      </div>
                      <p className="text-xs text-[#2D142C]/70">{t.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteTask(t.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. VENDORS TAB */}
      {activeTab === 'vendors' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#2D142C]/12 rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="pb-4 border-b border-[#2D142C]/10 mb-6">
              <h3 className="font-serif text-xl font-bold text-[#2D142C]">
                Vendor Requirements & Selection Briefs
              </h3>
              <p className="text-xs text-[#2D142C]/65">
                Track candidate vendors, requirement specifications, and log quotes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {event.vendors.map((ven) => {
                const isEditing = editingVendorId === ven.id;
                return (
                  <div
                    key={ven.id}
                    className="p-5 rounded-2xl border border-[#2D142C]/10 bg-[#FAF8F5] space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-serif font-bold text-base text-[#2D142C]">
                          {ven.category}
                        </span>
                        <select
                          value={ven.status}
                          onChange={(e) =>
                            onUpdateVendor({
                              ...ven,
                              status: e.target.value as any,
                            })
                          }
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-[#2D142C]/15 bg-white text-[#2D142C]"
                        >
                          <option value="uncontacted">Uncontacted</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="contacted">Contacted</option>
                          <option value="booked">Booked</option>
                        </select>
                      </div>

                      <div className="text-xs font-semibold text-[#E06D53] mb-3">
                        Est. Budget: {formatCurrency(ven.estimatedBudget, curr)}
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <strong className="text-[#2D142C]">Contract Criteria:</strong>
                          <p className="text-[#2D142C]/75 mt-0.5">{ven.requirements}</p>
                        </div>

                        <div>
                          <strong className="text-[#2D142C]">Selection Checklist:</strong>
                          <ul className="list-disc list-inside text-[#2D142C]/70 space-y-0.5 mt-0.5">
                            {ven.selectionTips.map((tip, idx) => (
                              <li key={idx}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Notes & Quote Section */}
                    <div className="pt-3 border-t border-[#2D142C]/8">
                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            rows={3}
                            value={vendorNotesInput}
                            onChange={(e) => setVendorNotesInput(e.target.value)}
                            placeholder="Log contact names, phone numbers, quotes, or contract terms..."
                            className="w-full p-2 text-xs rounded-xl border border-[#2D142C]/20 focus:outline-none focus:border-[#E06D53] bg-white"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingVendorId(null)}
                              className="px-2.5 py-1 rounded text-xs text-[#2D142C]/60 hover:text-[#2D142C]"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => saveVendorNotes(ven)}
                              className="px-3 py-1 rounded bg-[#2D142C] text-white text-xs font-semibold"
                            >
                              Save Notes
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-xs text-[#2D142C]/70">
                            <strong>Notes & Quotes:</strong>{' '}
                            <span>{ven.notes || 'No quotes or contact notes recorded yet.'}</span>
                          </div>
                          <button
                            onClick={() => startEditVendor(ven)}
                            className="p-1 text-[#7C699E] hover:text-[#2D142C]"
                            title="Edit vendor notes"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 6. RECOMMENDATIONS TAB */}
      {activeTab === 'recommendations' && (
        <div className="bg-white border border-[#2D142C]/12 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="pb-4 border-b border-[#2D142C]/10">
            <h3 className="font-serif text-xl font-bold text-[#2D142C]">
              Personalized Planning Recommendations
            </h3>
            <p className="text-xs text-[#2D142C]/65">
              Cost-saving and guest experience suggestions tailored to your parameters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {event.recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-5 rounded-2xl border border-[#2D142C]/10 bg-[#FAF8F5] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#E06D53] mb-2">
                    <Lightbulb className="w-4 h-4" />
                    <span>Personalized Idea</span>
                  </div>
                  <h4 className="font-serif font-bold text-base text-[#2D142C] mb-2">
                    {rec.title}
                  </h4>
                  <p className="text-xs text-[#2D142C]/75 leading-relaxed mb-4">
                    {rec.description}
                  </p>
                </div>
                <div className="pt-3 border-t border-[#2D142C]/8 text-xs font-semibold text-[#7C699E]">
                  Est. Cost Impact: {formatCurrency(rec.estimatedCost || 0, curr)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. CONTINGENCY TAB */}
      {activeTab === 'contingency' && (
        <div className="bg-white border border-[#2D142C]/12 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="pb-4 border-b border-[#2D142C]/10">
            <h3 className="font-serif text-xl font-bold text-[#2D142C]">
              Contingency & Risk Mitigation
            </h3>
            <p className="text-xs text-[#2D142C]/65">
              Proactive contingency measures for weather, equipment, and logistical disruptions.
            </p>
          </div>

          <div className="space-y-4">
            {event.contingencyPlan.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl border border-[#2D142C]/10 bg-[#FAF8F5] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#2D142C] flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Potential Risk: {c.risk}</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    c.severity === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {c.severity} Severity
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#2D142C]/75 pl-6">
                  <strong>Actionable Mitigation:</strong> {c.mitigation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD TASK */}
      {isAddTaskModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="addTaskModalTitle"
          className="fixed inset-0 z-50 bg-[#2D142C]/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in no-print"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#2D142C]/10">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#2D142C]/10">
              <h3 id="addTaskModalTitle" className="font-serif text-lg font-bold text-[#2D142C]">
                Add Celebration Task
              </h3>
              <button
                onClick={() => setIsAddTaskModalOpen(false)}
                className="p-1 rounded-lg text-[#2D142C]/60 hover:text-[#2D142C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-[#2D142C] mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule wine tasting with sommelier"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#2D142C]/20 focus:outline-none focus:border-[#E06D53]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2D142C] mb-1">Category</label>
                  <input
                    type="text"
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#2D142C]/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2D142C] mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-[#2D142C]/20 bg-white"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2D142C] mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Additional execution details..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#2D142C]/20 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-[#2D142C]/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#2D142C]/15 text-[#2D142C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2D142C] text-white font-semibold"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD BUDGET CATEGORY */}
      {isAddBudgetModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="addBudgetModalTitle"
          className="fixed inset-0 z-50 bg-[#2D142C]/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in no-print"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#2D142C]/10">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#2D142C]/10">
              <h3 id="addBudgetModalTitle" className="font-serif text-lg font-bold text-[#2D142C]">
                Add Budget Allocation
              </h3>
              <button
                onClick={() => setIsAddBudgetModalOpen(false)}
                className="p-1 rounded-lg text-[#2D142C]/60 hover:text-[#2D142C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBudgetCategory} className="space-y-4 text-xs sm:text-sm">
              {budgetCatError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {budgetCatError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-[#2D142C] mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wedding Cake & Dessert Station"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#2D142C]/20 focus:outline-none focus:border-[#E06D53]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2D142C] mb-1">
                  Estimated Cost ({curr}) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  required
                  placeholder="e.g. 1500"
                  value={newCatCost}
                  onChange={(e) => setNewCatCost(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#2D142C]/20 focus:outline-none focus:border-[#E06D53]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2D142C] mb-1">
                  Allocation Reason / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Multi-tier customized vegan cake"
                  value={newCatReason}
                  onChange={(e) => setNewCatReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#2D142C]/20 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-[#2D142C]/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddBudgetModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#2D142C]/15 text-[#2D142C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2D142C] text-white font-semibold"
                >
                  Add Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
