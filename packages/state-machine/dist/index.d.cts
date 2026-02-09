/**
 * @b0ase/state-machine
 *
 * Type-safe finite state machine with guards and actions.
 *
 * @packageDocumentation
 */
/** State machine context */
type MachineContext = Record<string, unknown>;
/** Event object */
interface MachineEvent<T extends string = string> {
    type: T;
    data?: unknown;
}
/** Guard function */
type Guard<TContext extends MachineContext, TEvent extends MachineEvent> = (context: TContext, event: TEvent) => boolean;
/** Action function */
type Action<TContext extends MachineContext, TEvent extends MachineEvent> = (context: TContext, event: TEvent) => void | Partial<TContext> | Promise<void | Partial<TContext>>;
/** Transition definition */
interface Transition<TContext extends MachineContext = MachineContext, TEvent extends MachineEvent = MachineEvent> {
    target: string;
    guard?: Guard<TContext, TEvent>;
    actions?: Array<Action<TContext, TEvent>>;
}
/** State definition */
interface StateDefinition<TContext extends MachineContext = MachineContext, TEvent extends MachineEvent = MachineEvent> {
    on?: Record<string, string | Transition<TContext, TEvent> | Array<Transition<TContext, TEvent>>>;
    entry?: Array<Action<TContext, TEvent>>;
    exit?: Array<Action<TContext, TEvent>>;
    meta?: Record<string, unknown>;
}
/** Machine configuration */
interface MachineConfig<TContext extends MachineContext = MachineContext, TEvent extends MachineEvent = MachineEvent> {
    id: string;
    initial: string;
    context: TContext;
    states: Record<string, StateDefinition<TContext, TEvent>>;
}
/** Machine snapshot */
interface MachineSnapshot<TContext extends MachineContext = MachineContext> {
    value: string;
    context: TContext;
    history: string[];
}
/** Transition listener */
type TransitionListener<TContext extends MachineContext = MachineContext> = (snapshot: MachineSnapshot<TContext>) => void;
declare class StateMachine<TContext extends MachineContext = MachineContext, TEvent extends MachineEvent = MachineEvent> {
    private config;
    private currentState;
    private context;
    private history;
    private listeners;
    constructor(config: MachineConfig<TContext, TEvent>);
    getState(): string;
    getContext(): TContext;
    getSnapshot(): MachineSnapshot<TContext>;
    matches(state: string): boolean;
    can(eventType: string): boolean;
    send(event: TEvent | string): Promise<MachineSnapshot<TContext>>;
    private normalizeTransitions;
    private executeActions;
    setContext(update: Partial<TContext> | ((context: TContext) => Partial<TContext>)): void;
    subscribe(listener: TransitionListener<TContext>): () => void;
    private notifyListeners;
    getStates(): string[];
    getEvents(): string[];
    getTransitions(): Array<{
        from: string;
        to: string;
        event: string;
    }>;
    getMeta(state?: string): Record<string, unknown> | undefined;
    reset(): MachineSnapshot<TContext>;
}
declare function createMachine<TContext extends MachineContext = MachineContext, TEvent extends MachineEvent = MachineEvent>(config: MachineConfig<TContext, TEvent>): StateMachine<TContext, TEvent>;
declare function assign<TContext extends MachineContext, TEvent extends MachineEvent>(assignment: Partial<TContext> | ((context: TContext, event: TEvent) => Partial<TContext>)): Action<TContext, TEvent>;
declare function log<TContext extends MachineContext, TEvent extends MachineEvent>(message: string | ((context: TContext, event: TEvent) => string)): Action<TContext, TEvent>;
declare function not<TContext extends MachineContext, TEvent extends MachineEvent>(guard: Guard<TContext, TEvent>): Guard<TContext, TEvent>;
declare function and<TContext extends MachineContext, TEvent extends MachineEvent>(...guards: Array<Guard<TContext, TEvent>>): Guard<TContext, TEvent>;
declare function or<TContext extends MachineContext, TEvent extends MachineEvent>(...guards: Array<Guard<TContext, TEvent>>): Guard<TContext, TEvent>;
declare const commonMachines: {
    /** Toggle machine (on/off) */
    toggle: () => StateMachine<{}, MachineEvent<string>>;
    /** Loading machine (idle, loading, success, error) */
    loading: <T>(initial?: T | null) => StateMachine<{
        data: T | null;
        error: Error | null;
    }, MachineEvent<string>>;
    /** Form machine (editing, submitting, success, error) */
    form: <T extends Record<string, unknown>>(initialData: T) => StateMachine<{
        data: T;
        errors: Record<string, string>;
        submitError: Error | null;
    }, MachineEvent<string>>;
};

export { type Action, type Guard, type MachineConfig, type MachineContext, type MachineEvent, type MachineSnapshot, type StateDefinition, StateMachine, type Transition, type TransitionListener, and, assign, commonMachines, createMachine, log, not, or };
