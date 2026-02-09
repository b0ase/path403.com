/**
 * Memoization & Performance Optimization Utilities
 *
 * Helpers for preventing unnecessary re-renders and optimizing performance
 */

import React, { useMemo, useCallback, useRef, useEffect } from 'react';

/**
 * Memoize a value based on dependency changes
 * Prevents expensive recalculations
 *
 * Usage:
 * ```typescript
 * const expensiveValue = useMemoized(() => {
 *   return items.filter(i => i.active).map(i => i.value);
 * }, [items]);
 * ```
 */
export function useMemoized<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return useMemo(factory, deps);
}

/**
 * Memoize a callback function
 * Prevents function recreation on every render
 *
 * Usage:
 * ```typescript
 * const handleClick = useMemoCallback((id: string) => {
 *   console.log('Clicked:', id);
 * }, []);
 * ```
 */
export function useMemoCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps) as T;
}

/**
 * Debounce a value change
 * Useful for search inputs, form changes, etc.
 *
 * Usage:
 * ```typescript
 * const [query, setQuery] = useState('');
 * const debouncedQuery = useDebounce(query, 500);
 *
 * useEffect(() => {
 *   // This effect runs 500ms after query stops changing
 *   searchAPI(debouncedQuery);
 * }, [debouncedQuery]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttle a value change
 * Useful for scroll events, resize events, etc.
 *
 * Usage:
 * ```typescript
 * const handleScroll = useThrottle(() => {
 *   console.log('Scrolled!');
 * }, 250);
 *
 * useEffect(() => {
 *   window.addEventListener('scroll', handleScroll);
 *   return () => window.removeEventListener('scroll', handleScroll);
 * }, [handleScroll]);
 * ```
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 250
): T {
  const lastRunRef = useRef<number>(Date.now());

  return useCallback(
    (...args: any[]) => {
      const now = Date.now();
      if (now - lastRunRef.current >= delay) {
        lastRunRef.current = now;
        callback(...args);
      }
    },
    [callback, delay]
  ) as T;
}

/**
 * Detect if value actually changed (with custom equality)
 *
 * Usage:
 * ```typescript
 * const hasUserChanged = useValueChanged(user, (prev, next) => {
 *   return prev?.id === next?.id;
 * });
 * ```
 */
export function useValueChanged<T>(
  value: T,
  isEqual?: (prev: T, next: T) => boolean
): boolean {
  const prevValueRef = useRef<T>(value);
  const [changed, setChanged] = React.useState(false);

  useEffect(() => {
    const defaultIsEqual = (a: T, b: T) => a === b;
    const compareFn = isEqual || defaultIsEqual;

    if (!compareFn(prevValueRef.current, value)) {
      setChanged(true);
      prevValueRef.current = value;
    }
  }, [value, isEqual]);

  return changed;
}

/**
 * Create a selector from an object
 * Prevents re-renders when unrelated properties change
 *
 * Usage:
 * ```typescript
 * const user = useSelector((state) => state.user);
 * const userName = useSelector(state => state.user?.name); // Only updates if name changes
 * ```
 */
export function useSelector<T, S>(
  obj: T,
  selector: (obj: T) => S,
  equalityFn?: (a: S, b: S) => boolean
): S {
  const selectedRef = useRef<S>();

  return useMemo(() => {
    const selected = selector(obj);
    const isEqual = equalityFn ? equalityFn(selectedRef.current!, selected) : selectedRef.current === selected;

    if (!isEqual) {
      selectedRef.current = selected;
    }

    return selectedRef.current!;
  }, [obj, selector, equalityFn]);
}

/**
 * Prevent re-render if props haven't changed
 *
 * Usage:
 * ```typescript
 * export const MyComponent = React.memo(MyComponentImpl, (prev, next) => {
 *   return shallowEqual(prev, next);
 * });
 * ```
 */
export function shallowEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (!a || !b) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (let key of keysA) {
    if (a[key] !== b[key]) return false;
  }

  return true;
}

/**
 * Memoize component with shallow equality check
 *
 * Usage:
 * ```typescript
 * export const MyList = memoizeComponent(MyListImpl);
 * ```
 */
export function memoizeComponent<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return React.memo(Component, shallowEqual) as React.ComponentType<P>;
}

/**
 * Use a value that persists across renders but doesn't trigger re-renders
 *
 * Usage:
 * ```typescript
 * const timerRef = usePersistentRef(null);
 *
 * const startTimer = () => {
 *   timerRef.current = setInterval(() => console.log('tick'), 1000);
 * };
 * ```
 */
export function usePersistentRef<T>(initialValue: T): React.MutableRefObject<T> {
  return useRef(initialValue);
}

/**
 * Track render count (for debugging performance)
 *
 * Usage:
 * ```typescript
 * export function ExpensiveComponent() {
 *   useRenderCount('ExpensiveComponent');
 *   return <div>Component</div>;
 * }
 *
 * // In console: "ExpensiveComponent rendered 5 times"
 * ```
 */
export function useRenderCount(componentName: string = 'Component'): void {
  const renderCountRef = useRef(0);

  useEffect(() => {
    renderCountRef.current++;
    console.log(`${componentName} rendered ${renderCountRef.current} times`);
  });
}

/**
 * Performance hook - measures component render time
 *
 * Usage:
 * ```typescript
 * export function SlowComponent() {
 *   usePerformanceMetrics('SlowComponent');
 *   return <div>Component</div>;
 * }
 * ```
 */
export function usePerformanceMetrics(componentName: string = 'Component'): void {
  const startTimeRef = useRef(performance.now());

  useEffect(() => {
    const renderTime = performance.now() - startTimeRef.current;
    if (renderTime > 16.67) { // Longer than one frame (60fps)
      console.warn(
        `[Performance] ${componentName} took ${renderTime.toFixed(2)}ms to render`
      );
    }
  });
}

/**
 * Prevent inline function creation
 *
 * Usage:
 * ```typescript
 * // BEFORE: New function created on every render
 * <button onClick={() => handleClick(id)} />
 *
 * // AFTER: Same function reference
 * const handleClickWithId = useCallback(() => handleClick(id), [id, handleClick]);
 * <button onClick={handleClickWithId} />
 * ```
 */
export function useFunctionMemo<T extends (...args: any[]) => any>(
  fn: T,
  deps: React.DependencyList
): T {
  return useCallback(fn, deps) as T;
}

/**
 * Lazy initialize state with expensive computation
 *
 * Usage:
 * ```typescript
 * const [heavyState, setHeavyState] = useLazyState(() => {
 *   return expensiveComputation();
 * });
 * ```
 */
export function useLazyState<T>(
  initializer: () => T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  return React.useState(() => initializer());
}

/**
 * Reference documentation with examples
 */
export const MEMOIZATION_GUIDE = `
# Performance Optimization Patterns

## Common Performance Issues

1. **Unnecessary Re-renders**
   - Every render recreates functions
   - Every render recalculates values
   - Children re-render when parent state changes

2. **Memory Leaks**
   - Event listeners not cleaned up
   - Timers not cleared
   - Subscriptions not unsubscribed

3. **Large Computations**
   - Filtering large lists
   - Sorting data
   - Complex calculations in render

## Solutions

### Use useMemo for Expensive Calculations
\`\`\`typescript
const filteredItems = useMemo(() => {
  return items.filter(i => i.category === activeCategory);
}, [items, activeCategory]);
\`\`\`

### Use useCallback for Event Handlers
\`\`\`typescript
const handleClick = useCallback((id) => {
  deleteItem(id);
}, [deleteItem]);
\`\`\`

### Memoize Components
\`\`\`typescript
export const UserCard = React.memo(({user}) => {
  return <div>{user.name}</div>;
});
\`\`\`

### Use useSelector to Prevent Re-renders
\`\`\`typescript
const userName = useSelector(state => state.user?.name);
// Only re-renders if name actually changes
\`\`\`

### Debounce Expensive Updates
\`\`\`typescript
const debouncedSearch = useDebounce(searchQuery, 500);
useEffect(() => {
  performSearch(debouncedSearch);
}, [debouncedSearch]);
\`\`\`
`;
