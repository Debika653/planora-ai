import { EventPlan } from '../../src/types';
import { SAMPLE_EVENTS } from '../../src/data/sampleEvents';

class EventRepository {
  private events: Map<string, EventPlan> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    for (const evt of SAMPLE_EVENTS) {
      this.events.set(evt.id, JSON.parse(JSON.stringify(evt)));
    }
  }

  getAll(): EventPlan[] {
    return Array.from(this.events.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  getById(id: string): EventPlan | undefined {
    return this.events.get(id);
  }

  save(event: EventPlan): EventPlan {
    const existing = this.events.get(event.id);
    const now = new Date().toISOString();
    const planToSave: EventPlan = {
      ...event,
      createdAt: existing?.createdAt || event.createdAt || now,
      updatedAt: now,
    };
    this.events.set(planToSave.id, planToSave);
    return planToSave;
  }

  delete(id: string): boolean {
    return this.events.delete(id);
  }

  reset(): void {
    this.events.clear();
    this.seed();
  }
}

export const eventRepository = new EventRepository();
