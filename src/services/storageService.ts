import { EventPlan, EventTask, EventVendor, BudgetCategory } from '../types';
import { SAMPLE_EVENTS } from '../data/sampleEvents';
import { calculateBudgetMetrics } from '../utils/budgetCalculations';

const STORAGE_KEY = 'planora_ai_saved_events_v1';
const ACTIVE_EVENT_KEY = 'planora_ai_active_event_id';

class StorageService {
  private cache: EventPlan[] = [];
  private isLoaded = false;
  private isUsingApi = false;

  constructor() {
    this.initLocalCache();
  }

  private initLocalCache() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.cache = JSON.parse(stored);
      } else {
        // Seed with sample events on first launch
        this.cache = [...SAMPLE_EVENTS];
        this.saveToLocalStorage();
      }
    } catch {
      this.cache = [...SAMPLE_EVENTS];
    }
    this.isLoaded = true;
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cache));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  async getEvents(): Promise<EventPlan[]> {
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          this.cache = data;
          this.isUsingApi = true;
          this.saveToLocalStorage();
          return this.cache;
        }
      }
    } catch {
      // Backend temporarily offline or in client-side preview
    }
    this.isUsingApi = false;
    if (!this.isLoaded) this.initLocalCache();
    return this.cache;
  }

  getEventsSync(): EventPlan[] {
    if (!this.isLoaded) this.initLocalCache();
    return this.cache;
  }

  async getEventById(id: string): Promise<EventPlan | null> {
    const events = await this.getEvents();
    return events.find((e) => e.id === id) || null;
  }

  getActiveEventId(): string | null {
    try {
      const id = localStorage.getItem(ACTIVE_EVENT_KEY);
      if (id && this.cache.some((e) => e.id === id)) {
        return id;
      }
      return this.cache.length > 0 ? this.cache[0].id : null;
    } catch {
      return this.cache.length > 0 ? this.cache[0].id : null;
    }
  }

  setActiveEventId(id: string) {
    try {
      localStorage.setItem(ACTIVE_EVENT_KEY, id);
    } catch {
      // ignore
    }
  }

  async saveEvent(event: EventPlan): Promise<EventPlan> {
    // Recalculate deterministic budget
    const calculatedBudget = calculateBudgetMetrics(
      event.formData.totalBudget,
      event.budget.categories,
      event.formData.currency
    );

    const updatedEvent: EventPlan = {
      ...event,
      budget: calculatedBudget,
      updatedAt: new Date().toISOString(),
    };

    const existingIndex = this.cache.findIndex((e) => e.id === updatedEvent.id);
    if (existingIndex >= 0) {
      this.cache[existingIndex] = updatedEvent;
    } else {
      this.cache.unshift(updatedEvent);
    }
    this.saveToLocalStorage();

    // Async persist to API
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvent),
      });
    } catch {
      // safely preserved in localStorage
    }

    return updatedEvent;
  }

  async deleteEvent(id: string): Promise<boolean> {
    this.cache = this.cache.filter((e) => e.id !== id);
    this.saveToLocalStorage();

    try {
      await fetch(`/api/events/${id}`, { method: 'DELETE' });
    } catch {
      // safely deleted from local
    }

    return true;
  }

  async duplicateEvent(id: string): Promise<EventPlan | null> {
    const original = this.cache.find((e) => e.id === id);
    if (!original) return null;

    const duplicated: EventPlan = {
      ...JSON.parse(JSON.stringify(original)),
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      formData: {
        ...original.formData,
        name: `${original.formData.name} (Copy)`,
      },
      eventOverview: {
        ...original.eventOverview,
        title: `${original.eventOverview.title} (Copy)`,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.saveEvent(duplicated);
  }

  // --- Task Operations ---
  async toggleTaskCompleted(eventId: string, taskId: string): Promise<EventPlan | null> {
    const event = this.cache.find((e) => e.id === eventId);
    if (!event) return null;

    event.tasks = event.tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );

    return this.saveEvent(event);
  }

  async addTask(eventId: string, task: Omit<EventTask, 'id'>): Promise<EventPlan | null> {
    const event = this.cache.find((e) => e.id === eventId);
    if (!event) return null;

    const newTask: EventTask = {
      ...task,
      id: `tsk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };

    event.tasks.unshift(newTask);
    return this.saveEvent(event);
  }

  async updateTask(eventId: string, updatedTask: EventTask): Promise<EventPlan | null> {
    const event = this.cache.find((e) => e.id === eventId);
    if (!event) return null;

    event.tasks = event.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
    return this.saveEvent(event);
  }

  async deleteTask(eventId: string, taskId: string): Promise<EventPlan | null> {
    const event = this.cache.find((e) => e.id === eventId);
    if (!event) return null;

    event.tasks = event.tasks.filter((t) => t.id !== taskId);
    return this.saveEvent(event);
  }

  // --- Vendor Operations ---
  async updateVendor(eventId: string, updatedVendor: EventVendor): Promise<EventPlan | null> {
    const event = this.cache.find((e) => e.id === eventId);
    if (!event) return null;

    event.vendors = event.vendors.map((v) => (v.id === updatedVendor.id ? updatedVendor : v));
    return this.saveEvent(event);
  }

  async addVendor(eventId: string, vendor: Omit<EventVendor, 'id'>): Promise<EventPlan | null> {
    const event = this.cache.find((e) => e.id === eventId);
    if (!event) return null;

    const newVendor: EventVendor = {
      ...vendor,
      id: `ven-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };

    event.vendors.push(newVendor);
    return this.saveEvent(event);
  }

  // --- Budget Category Operations ---
  async updateBudgetCategory(eventId: string, updatedCategory: BudgetCategory): Promise<EventPlan | null> {
    const event = this.cache.find((e) => e.id === eventId);
    if (!event) return null;

    const updatedCategories = event.budget.categories.map((c) =>
      c.id === updatedCategory.id ? updatedCategory : c
    );

    event.budget = calculateBudgetMetrics(
      event.formData.totalBudget,
      updatedCategories,
      event.formData.currency
    );

    return this.saveEvent(event);
  }

  async addBudgetCategory(
    eventId: string,
    category: { name: string; estimatedCost: number; reason: string }
  ): Promise<EventPlan | null> {
    const event = this.cache.find((e) => e.id === eventId);
    if (!event) return null;

    const newCategories = [
      ...event.budget.categories,
      {
        id: `cat-${Date.now()}`,
        name: category.name,
        estimatedCost: category.estimatedCost,
        reason: category.reason,
        percentage: 0,
      },
    ];

    event.budget = calculateBudgetMetrics(
      event.formData.totalBudget,
      newCategories,
      event.formData.currency
    );

    return this.saveEvent(event);
  }

  async deleteBudgetCategory(eventId: string, categoryId: string): Promise<EventPlan | null> {
    const event = this.cache.find((e) => e.id === eventId);
    if (!event) return null;

    const filtered = event.budget.categories.filter((c) => c.id !== categoryId);
    event.budget = calculateBudgetMetrics(
      event.formData.totalBudget,
      filtered,
      event.formData.currency
    );

    return this.saveEvent(event);
  }

  // --- Milestone Operations ---
  async toggleMilestoneCompleted(eventId: string, milestoneId: string): Promise<EventPlan | null> {
    const event = this.cache.find((e) => e.id === eventId);
    if (!event) return null;

    event.timeline = event.timeline.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );

    return this.saveEvent(event);
  }

  // Reset to initial sample data
  resetToSampleData(): EventPlan[] {
    this.cache = [...SAMPLE_EVENTS];
    this.saveToLocalStorage();
    return this.cache;
  }

  // Clear all data
  clearAllEvents(): void {
    this.cache = [];
    this.saveToLocalStorage();
    try {
      localStorage.removeItem(ACTIVE_EVENT_KEY);
    } catch {
      // ignore
    }
  }

  isApiConnected(): boolean {
    return this.isUsingApi;
  }
}

export const storageService = new StorageService();
