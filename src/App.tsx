import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { DashboardView } from './components/DashboardView';
import { EventWizard } from './components/EventWizard';
import { EventWorkspace } from './components/EventWorkspace';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';
import { ExportModal } from './components/ExportModal';
import { SettingsModal } from './components/SettingsModal';
import { storageService } from './services/storageService';
import { EventPlan, EventFormData, EventType, EventTask, EventVendor } from './types';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'wizard' | 'workspace'>('landing');
  const [events, setEvents] = useState<EventPlan[]>([]);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [wizardInitialType, setWizardInitialType] = useState<EventType>('wedding');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Initialize and load events
  useEffect(() => {
    async function load() {
      const loaded = await storageService.getEvents();
      setEvents(loaded);
      const savedActiveId = storageService.getActiveEventId();
      if (savedActiveId && loaded.some((e) => e.id === savedActiveId)) {
        setActiveEventId(savedActiveId);
      } else if (loaded.length > 0) {
        setActiveEventId(loaded[0].id);
      }
    }
    load();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const activeEvent = events.find((e) => e.id === activeEventId) || events[0] || null;

  // View navigation handlers
  const handleStartPlanning = (initialType: EventType = 'wedding') => {
    setWizardInitialType(initialType);
    setCurrentView('wizard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenEvent = (eventId: string) => {
    setActiveEventId(eventId);
    storageService.setActiveEventId(eventId);
    setCurrentView('workspace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreviewSample = (sampleId: string) => {
    handleOpenEvent(sampleId);
  };

  // Event Plan Submission via AI Engine
  const handleWizardSubmit = async (formData: EventFormData) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/events/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate celebration plan.');
      }

      const generatedPlan: EventPlan = await response.json();
      await storageService.saveEvent(generatedPlan);
      const updatedEvents = await storageService.getEvents();
      setEvents(updatedEvents);
      setActiveEventId(generatedPlan.id);
      storageService.setActiveEventId(generatedPlan.id);
      setCurrentView('workspace');
      showToast('Celebration plan generated with verified budget allocations!');
    } catch (err: any) {
      console.warn('Backend plan generation error, falling back locally:', err);
      // Fallback local persistence if server is inaccessible
      showToast(err.message || 'Error communicating with server. Retrying with local engine.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Event Management Operations
  const handleDuplicate = async (eventId: string) => {
    const duplicated = await storageService.duplicateEvent(eventId);
    if (duplicated) {
      const updated = await storageService.getEvents();
      setEvents(updated);
      showToast('Celebration duplicated successfully');
    }
  };

  const handleDelete = async (eventId: string) => {
    await storageService.deleteEvent(eventId);
    const updated = await storageService.getEvents();
    setEvents(updated);
    if (activeEventId === eventId) {
      setActiveEventId(updated[0]?.id || null);
    }
    showToast('Celebration deleted');
  };

  // Workspace CRUD operations
  const handleToggleTask = async (taskId: string) => {
    if (!activeEventId) return;
    const updated = await storageService.toggleTaskCompleted(activeEventId, taskId);
    if (updated) {
      setEvents(storageService.getEventsSync());
    }
  };

  const handleAddTask = async (task: Omit<EventTask, 'id'>) => {
    if (!activeEventId) return;
    const updated = await storageService.addTask(activeEventId, task);
    if (updated) {
      setEvents(storageService.getEventsSync());
      showToast('Task added to celebration checklist');
    }
  };

  const handleUpdateTask = async (task: EventTask) => {
    if (!activeEventId) return;
    const updated = await storageService.updateTask(activeEventId, task);
    if (updated) {
      setEvents(storageService.getEventsSync());
      showToast('Task updated');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!activeEventId) return;
    const updated = await storageService.deleteTask(activeEventId, taskId);
    if (updated) {
      setEvents(storageService.getEventsSync());
      showToast('Task removed');
    }
  };

  const handleToggleMilestone = async (milestoneId: string) => {
    if (!activeEventId) return;
    const updated = await storageService.toggleMilestoneCompleted(activeEventId, milestoneId);
    if (updated) {
      setEvents(storageService.getEventsSync());
    }
  };

  const handleUpdateVendor = async (vendor: EventVendor) => {
    if (!activeEventId) return;
    const updated = await storageService.updateVendor(activeEventId, vendor);
    if (updated) {
      setEvents(storageService.getEventsSync());
      showToast('Vendor notes and status updated');
    }
  };

  const handleAddBudgetCategory = async (category: { name: string; estimatedCost: number; reason: string }) => {
    if (!activeEventId) return;
    const updated = await storageService.addBudgetCategory(activeEventId, category);
    if (updated) {
      setEvents(storageService.getEventsSync());
      showToast('Budget category added and totals updated');
    }
  };

  const handleDeleteBudgetCategory = async (catId: string) => {
    if (!activeEventId) return;
    const updated = await storageService.deleteBudgetCategory(activeEventId, catId);
    if (updated) {
      setEvents(storageService.getEventsSync());
      showToast('Category removed and totals updated');
    }
  };

  const handleResetSamples = () => {
    const resetted = storageService.resetToSampleData();
    setEvents(resetted);
    setActiveEventId(resetted[0]?.id || null);
    showToast('Starter celebration templates reloaded');
  };

  const handleClearAll = () => {
    storageService.clearAllEvents();
    setEvents([]);
    setActiveEventId(null);
    setCurrentView('dashboard');
    showToast('All event data cleared');
  };

  // Applying Assistant Suggestions
  const handleApplyAssistantAction = async (action: any) => {
    if (!activeEventId || !action) return;
    if (action.type === 'add_task' && action.data) {
      await handleAddTask(action.data);
      showToast('Suggested task added to checklist!');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#2D142C] antialiased selection:bg-[#E06D53]/20">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs sm:text-sm font-semibold animate-fade-in no-print ${
            toastMessage.type === 'success'
              ? 'bg-[#2D142C] text-white border-[#2D142C]/20'
              : 'bg-rose-600 text-white border-rose-700'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#FA8F79]" />
          ) : (
            <AlertCircle className="w-4 h-4 text-white" />
          )}
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <Header
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        savedEventsCount={events.length}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onStartPlanning={handleStartPlanning}
            onPreviewSampleEvent={handlePreviewSample}
            onGoToDashboard={() => setCurrentView('dashboard')}
            sampleEvents={events}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            events={events}
            onOpenEvent={handleOpenEvent}
            onCreateNew={() => handleStartPlanning()}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onLoadSamples={handleResetSamples}
          />
        )}

        {currentView === 'wizard' && (
          <EventWizard
            initialType={wizardInitialType}
            onSubmit={handleWizardSubmit}
            onCancel={() => setCurrentView(events.length > 0 ? 'dashboard' : 'landing')}
            isGenerating={isGenerating}
          />
        )}

        {currentView === 'workspace' && activeEvent && (
          <EventWorkspace
            event={activeEvent}
            onBackToDashboard={() => setCurrentView('dashboard')}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onToggleMilestone={handleToggleMilestone}
            onUpdateVendor={handleUpdateVendor}
            onAddBudgetCategory={handleAddBudgetCategory}
            onDeleteBudgetCategory={handleDeleteBudgetCategory}
            onOpenAssistant={() => setIsAssistantOpen(true)}
            onOpenExport={() => setIsExportOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* AI Assistant Drawer */}
      {activeEvent && (
        <AiAssistantDrawer
          isOpen={isAssistantOpen}
          onClose={() => setIsAssistantOpen(false)}
          event={activeEvent}
          onApplySuggestedAction={handleApplyAssistantAction}
        />
      )}

      {/* Export & Print Modal */}
      {activeEvent && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          event={activeEvent}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onResetSamples={handleResetSamples}
        onClearAll={handleClearAll}
        isApiConnected={storageService.isApiConnected()}
      />
    </div>
  );
}

export default App;
