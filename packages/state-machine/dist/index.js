// src/index.ts
var StateMachine = class {
  constructor(config) {
    this.history = [];
    this.listeners = /* @__PURE__ */ new Set();
    this.config = config;
    this.currentState = config.initial;
    this.context = { ...config.context };
    const initialState = this.config.states[this.currentState];
    if (initialState?.entry) {
      this.executeActions(initialState.entry, { type: "__init__" });
    }
  }
  // ==========================================================================
  // State Management
  // ==========================================================================
  getState() {
    return this.currentState;
  }
  getContext() {
    return { ...this.context };
  }
  getSnapshot() {
    return {
      value: this.currentState,
      context: { ...this.context },
      history: [...this.history]
    };
  }
  matches(state) {
    return this.currentState === state;
  }
  can(eventType) {
    const stateDefinition = this.config.states[this.currentState];
    if (!stateDefinition?.on) return false;
    const transition = stateDefinition.on[eventType];
    if (!transition) return false;
    const transitions = this.normalizeTransitions(transition);
    const event = { type: eventType };
    return transitions.some((t) => !t.guard || t.guard(this.context, event));
  }
  // ==========================================================================
  // Transitions
  // ==========================================================================
  async send(event) {
    const normalizedEvent = typeof event === "string" ? { type: event } : event;
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
    if (stateDefinition.exit) {
      await this.executeActions(stateDefinition.exit, normalizedEvent);
    }
    this.history.push(this.currentState);
    if (transition.actions) {
      await this.executeActions(transition.actions, normalizedEvent);
    }
    this.currentState = transition.target;
    const newStateDefinition = this.config.states[this.currentState];
    if (newStateDefinition?.entry) {
      await this.executeActions(newStateDefinition.entry, normalizedEvent);
    }
    const snapshot = this.getSnapshot();
    this.notifyListeners(snapshot);
    return snapshot;
  }
  normalizeTransitions(config) {
    if (typeof config === "string") {
      return [{ target: config }];
    }
    if (Array.isArray(config)) {
      return config;
    }
    return [config];
  }
  async executeActions(actions, event) {
    for (const action of actions) {
      const result = await action(this.context, event);
      if (result && typeof result === "object") {
        this.context = { ...this.context, ...result };
      }
    }
  }
  // ==========================================================================
  // Context Updates
  // ==========================================================================
  setContext(update) {
    if (typeof update === "function") {
      this.context = { ...this.context, ...update(this.context) };
    } else {
      this.context = { ...this.context, ...update };
    }
  }
  // ==========================================================================
  // Subscriptions
  // ==========================================================================
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  notifyListeners(snapshot) {
    for (const listener of this.listeners) {
      try {
        listener(snapshot);
      } catch {
      }
    }
  }
  // ==========================================================================
  // Introspection
  // ==========================================================================
  getStates() {
    return Object.keys(this.config.states);
  }
  getEvents() {
    const events = /* @__PURE__ */ new Set();
    for (const state of Object.values(this.config.states)) {
      if (state.on) {
        for (const eventType of Object.keys(state.on)) {
          events.add(eventType);
        }
      }
    }
    return Array.from(events);
  }
  getTransitions() {
    const transitions = [];
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
  getMeta(state) {
    const targetState = state || this.currentState;
    return this.config.states[targetState]?.meta;
  }
  // ==========================================================================
  // Reset
  // ==========================================================================
  reset() {
    this.currentState = this.config.initial;
    this.context = { ...this.config.context };
    this.history = [];
    const initialState = this.config.states[this.currentState];
    if (initialState?.entry) {
      this.executeActions(initialState.entry, { type: "__reset__" });
    }
    const snapshot = this.getSnapshot();
    this.notifyListeners(snapshot);
    return snapshot;
  }
};
function createMachine(config) {
  return new StateMachine(config);
}
function assign(assignment) {
  return (context, event) => {
    if (typeof assignment === "function") {
      return assignment(context, event);
    }
    return assignment;
  };
}
function log(message) {
  return (context, event) => {
    const msg = typeof message === "function" ? message(context, event) : message;
    console.log(`[StateMachine] ${msg}`);
  };
}
function not(guard) {
  return (context, event) => !guard(context, event);
}
function and(...guards) {
  return (context, event) => guards.every((g) => g(context, event));
}
function or(...guards) {
  return (context, event) => guards.some((g) => g(context, event));
}
var commonMachines = {
  /** Toggle machine (on/off) */
  toggle: () => createMachine({
    id: "toggle",
    initial: "off",
    context: {},
    states: {
      off: { on: { TOGGLE: "on" } },
      on: { on: { TOGGLE: "off" } }
    }
  }),
  /** Loading machine (idle, loading, success, error) */
  loading: (initial = null) => createMachine({
    id: "loading",
    initial: "idle",
    context: { data: initial, error: null },
    states: {
      idle: {
        on: { FETCH: "loading" }
      },
      loading: {
        on: {
          SUCCESS: {
            target: "success",
            actions: [assign((_, event) => ({ data: event.data || null, error: null }))]
          },
          ERROR: {
            target: "error",
            actions: [
              assign((_, event) => ({
                error: event.data || new Error("Unknown error")
              }))
            ]
          }
        }
      },
      success: {
        on: { RESET: "idle", FETCH: "loading" }
      },
      error: {
        on: { RESET: "idle", RETRY: "loading" }
      }
    }
  }),
  /** Form machine (editing, submitting, success, error) */
  form: (initialData) => createMachine({
    id: "form",
    initial: "editing",
    context: { data: initialData, errors: {}, submitError: null },
    states: {
      editing: {
        on: {
          UPDATE: {
            target: "editing",
            actions: [
              assign((context, event) => ({
                data: { ...context.data, ...event.data }
              }))
            ]
          },
          SUBMIT: "submitting"
        }
      },
      submitting: {
        on: {
          SUCCESS: "success",
          ERROR: {
            target: "editing",
            actions: [
              assign((_, event) => ({
                submitError: event.data || new Error("Submit failed")
              }))
            ]
          }
        }
      },
      success: {
        on: { RESET: "editing" }
      }
    }
  })
};
export {
  StateMachine,
  and,
  assign,
  commonMachines,
  createMachine,
  log,
  not,
  or
};
//# sourceMappingURL=index.js.map