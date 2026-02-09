/**
 * @b0ase/state-machine
 *
 * Type-safe finite state machine with guards and actions.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** State machine context */
export type MachineContext = Record<string, unknown>;

/** Event object */
export interface MachineEvent<T extends string = string> {
  type: T;
  data?: unknown;
}

/** Guard function */
export type Guard<TContext extends MachineContext, TEvent extends MachineEvent> = (
  context: TContext,
  event: TEvent
) => boolean;

/** Action function */
export type Action<TContext extends MachineContext, TEvent extends MachineEvent> = (
  context: TContext,
  event: TEvent
) => void | Partial<TContext> | Promise<void | Partial<TContext>>;

/** Transition definition */
export interface Transition<
  TContext extends MachineContext = MachineContext,
  TEvent extends MachineEvent = MachineEvent
> {
  target: string;
  guard?: Guard<TContext, TEvent>;
  actions?: Array<Action<TContext, TEvent>>;
}

/** State definition */
export interface StateDefinition<
  TContext extends MachineContext = MachineContext,
  TEvent extends MachineEvent = MachineEvent
> {
  on?: Record<string, string | Transition<TContext, TEvent> | Array<Transition<TContext, TEvent>>>;
  entry?: Array<Action<TContext, TEvent>>;
  exit?: Array<Action<TContext, TEvent>>;
  meta?: Record<string, unknown>;
}

/** Machine configuration */
export interface MachineConfig<
  TContext extends MachineContext = MachineContext,
  TEvent extends MachineEvent = MachineEvent
> {
  id: string;
  initial: string;
  context: TContext;
  states: Record<string, StateDefinition<TContext, TEvent>>;
}

/** Machine snapshot */
export interface MachineSnapshot<TContext extends MachineContext = MachineContext> {
  value: string;
  context: TContext;
  history: string[];
}

/** Transition listener */
export type TransitionListener<TContext extends MachineContext = MachineContext> = (
  snapshot: MachineSnapshot<TContext>
) => void;

// ============================================================================
// State Machine
// ============================================================================

export class StateMachine<
  TContext extends MachineContext = MachineContext,
  TEvent extends MachineEvent = MachineEvent
> {
  private config: MachineConfig<TContext, TEvent>;
  private currentState: string;
  private context: TContext;
  private history: string[] = [];
  private listeners: Set<TransitionListener<TContext>> = new Set();

  constructor(config: MachineConfig<TContext, TEvent>) {
    this.config = config;
    this.currentState = config.initial;
    this.context = { ...config.context };

    // Execute entry actions for initial state
    const initialState = this.config.states[this.currentState];
    if (initialState?.entry) {
      this.executeActions(initialState.entry, { type: '__init__' } as TEvent);
    }
  }

  // ==========================================================================
  // State Management
  // ==========================================================================

  getState(): string {
    return this.currentState;
  }

  getContext(): TContext {
    return { ...this.context };
  }

  getSnapshot(): MachineSnapshot<TContext> {
    return {
      value: this.currentState,
      context: { ...this.context },
      history: [...this.history],
    };
  }

  matches(state: string): boolean {
    return this.currentState === state;
  }

  can(eventType: string): boolean {
    const stateDefinition = this.config.states[this.currentState];
    if (!stateDefinition?.on) return false;

    const transition = stateDefinition.on[eventType];
    if (!transition) return false;

    const transitions = this.normalizeTransitions(transition);
    const event = { type: eventType } as TEvent;

    return transitions.some((t) => !t.guard || t.guard(this.context, event));
  }

  // ==========================================================================
  // Transitions
  // ==========================================================================

  async send(event: TEvent | string): Promise<MachineSnapshot<TContext>> {
    const normalizedEvent: TEvent =
      typeof event === 'string' ? ({ type: event } as TEvent) : event;

    const stateDefinition = this.config.states[this.currentState];
    if (!stateDefinition?.on) {
      return this.getSnapshot();
    }

    const transitionConfig = stateDefinition.on[normalizedEvent.type];
    if (!transitionConfig) {
      return this.getSnapshot();
    }

    const transitions = this.normalizeTransitions(transitionConfig);
    const transition = transitions.find(
      (t) => !t.guard || t.guard(this.context, normalizedEvent)
    );

    if (!transition) {
      return this.getSnapshot();
    }

    // Execute exit actions
    if (stateDefinition.exit) {
      await this.executeActions(stateDefinition.exit, normalizedEvent);
    }

    // Update history
    this.history.push(this.currentState);

    // Execute transition actions
    if (transition.actions) {
      await this.executeActions(transition.actions, normalizedEvent);
    }

    // Transition to new state
    this.currentState = transition.target;

    // Execute entry actions for new state
    const newStateDefinition = this.config.states[this.currentState];
    if (newStateDefinition?.entry) {
      await this.executeActions(newStateDefinition.entry, normalizedEvent);
    }

    // Notify listeners
    const snapshot = this.getSnapshot();
    this.notifyListeners(snapshot);

    return snapshot;
  }

  private normalizeTransitions(
    config: string | Transition<TContext, TEvent> | Array<Transition<TContext, TEvent>>
  ): Array<Transition<TContext, TEvent>> {
    if (typeof config === 'string') {
      return [{ target: config }];
    }
    if (Array.isArray(config)) {
      return config;
    }
    return [config];
  }

  private async executeActions(
    actions: Array<Action<TContext, TEvent>>,
    event: TEvent
  ): Promise<void> {
    for (const action of actions) {
      const result = await action(this.context, event);
      if (result && typeof result === 'object') {
        this.context = { ...this.context, ...result };
      }
    }
  }

  // ==========================================================================
  // Context Updates
  // ==========================================================================

  setContext(update: Partial<TContext> | ((context: TContext) => Partial<TContext>)): void {
    if (typeof update === 'function') {
      this.context = { ...this.context, ...update(this.context) };
    } else {
      this.context = { ...this.context, ...update };
    }
  }

  // ==========================================================================
  // Subscriptions
  // ==========================================================================

  subscribe(listener: TransitionListener<TContext>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(snapshot: MachineSnapshot<TContext>): void {
    for (const listener of this.listeners) {
      try {
        listener(snapshot);
      } catch {
        // Silently ignore listener errors
      }
    }
  }

  // ==========================================================================
  // Introspection
  // ==========================================================================

  getStates(): string[] {
    return Object.keys(this.config.states);
  }

  getEvents(): string[] {
    const events = new Set<string>();
    for (const state of Object.values(this.config.states)) {
      if (state.on) {
        for (const eventType of Object.keys(state.on)) {
          events.add(eventType);
        }
      }
    }
    return Array.from(events);
  }

  getTransitions(): Array<{ from: string; to: string; event: string }> {
    const transitions: Array<{ from: string; to: string; event: string }> = [];

    for (const [state, definition] of Object.entries(this.config.states)) {
      if (definition.on) {
        for (const [eventType, transitionConfig] of Object.entries(definition.on)) {
          const normalized = this.normalizeTransitions(transitionConfig);
          for (const t of normalized) {
            transitions.push({ from: state, to: t.target, event: eventType });
          }
        }
      }
    }

    return transitions;
  }

  getMeta(state?: string): Record<string, unknown> | undefined {
    const targetState = state || this.currentState;
    return this.config.states[targetState]?.meta;
  }

  // ==========================================================================
  // Reset
  // ==========================================================================

  reset(): MachineSnapshot<TContext> {
    this.currentState = this.config.initial;
    this.context = { ...this.config.context };
    this.history = [];

    // Execute entry actions for initial state
    const initialState = this.config.states[this.currentState];
    if (initialState?.entry) {
      this.executeActions(initialState.entry, { type: '__reset__' } as TEvent);
    }

    const snapshot = this.getSnapshot();
    this.notifyListeners(snapshot);
    return snapshot;
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createMachine<
  TContext extends MachineContext = MachineContext,
  TEvent extends MachineEvent = MachineEvent
>(config: MachineConfig<TContext, TEvent>): StateMachine<TContext, TEvent> {
  return new StateMachine(config);
}

// ============================================================================
// Action Helpers
// ============================================================================

export function assign<TContext extends MachineContext, TEvent extends MachineEvent>(
  assignment: Partial<TContext> | ((context: TContext, event: TEvent) => Partial<TContext>)
): Action<TContext, TEvent> {
  return (context, event) => {
    if (typeof assignment === 'function') {
      return assignment(context, event);
    }
    return assignment;
  };
}

export function log<TContext extends MachineContext, TEvent extends MachineEvent>(
  message: string | ((context: TContext, event: TEvent) => string)
): Action<TContext, TEvent> {
  return (context, event) => {
    const msg = typeof message === 'function' ? message(context, event) : message;
    console.log(`[StateMachine] ${msg}`);
  };
}

// ============================================================================
// Guard Helpers
// ============================================================================

export function not<TContext extends MachineContext, TEvent extends MachineEvent>(
  guard: Guard<TContext, TEvent>
): Guard<TContext, TEvent> {
  return (context, event) => !guard(context, event);
}

export function and<TContext extends MachineContext, TEvent extends MachineEvent>(
  ...guards: Array<Guard<TContext, TEvent>>
): Guard<TContext, TEvent> {
  return (context, event) => guards.every((g) => g(context, event));
}

export function or<TContext extends MachineContext, TEvent extends MachineEvent>(
  ...guards: Array<Guard<TContext, TEvent>>
): Guard<TContext, TEvent> {
  return (context, event) => guards.some((g) => g(context, event));
}

// ============================================================================
// Common State Machines
// ============================================================================

export const commonMachines = {
  /** Toggle machine (on/off) */
  toggle: () =>
    createMachine({
      id: 'toggle',
      initial: 'off',
      context: {},
      states: {
        off: { on: { TOGGLE: 'on' } },
        on: { on: { TOGGLE: 'off' } },
      },
    }),

  /** Loading machine (idle, loading, success, error) */
  loading: <T>(initial: T | null = null) =>
    createMachine<{ data: T | null; error: Error | null }>({
      id: 'loading',
      initial: 'idle',
      context: { data: initial, error: null },
      states: {
        idle: {
          on: { FETCH: 'loading' },
        },
        loading: {
          on: {
            SUCCESS: {
              target: 'success',
              actions: [assign((_, event) => ({ data: (event.data as T) || null, error: null }))],
            },
            ERROR: {
              target: 'error',
              actions: [
                assign((_, event) => ({
                  error: (event.data as Error) || new Error('Unknown error'),
                })),
              ],
            },
          },
        },
        success: {
          on: { RESET: 'idle', FETCH: 'loading' },
        },
        error: {
          on: { RESET: 'idle', RETRY: 'loading' },
        },
      },
    }),

  /** Form machine (editing, submitting, success, error) */
  form: <T extends Record<string, unknown>>(initialData: T) =>
    createMachine<{ data: T; errors: Record<string, string>; submitError: Error | null }>({
      id: 'form',
      initial: 'editing',
      context: { data: initialData, errors: {}, submitError: null },
      states: {
        editing: {
          on: {
            UPDATE: {
              target: 'editing',
              actions: [
                assign((context, event) => ({
                  data: { ...context.data, ...(event.data as Partial<T>) },
                })),
              ],
            },
            SUBMIT: 'submitting',
          },
        },
        submitting: {
          on: {
            SUCCESS: 'success',
            ERROR: {
              target: 'editing',
              actions: [
                assign((_, event) => ({
                  submitError: (event.data as Error) || new Error('Submit failed'),
                })),
              ],
            },
          },
        },
        success: {
          on: { RESET: 'editing' },
        },
      },
    }),
};
