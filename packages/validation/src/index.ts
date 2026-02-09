/**
 * @b0ase/validation
 *
 * Input validation utilities and schema builders.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Validation result */
export interface ValidationResult<T = unknown> {
  success: boolean;
  data?: T;
  errors: ValidationError[];
}

/** Validation error */
export interface ValidationError {
  path: string;
  message: string;
  code: string;
  value?: unknown;
}

/** Validator function */
export type ValidatorFn<T = unknown> = (value: T, path: string) => ValidationError | null;

/** Schema interface */
export interface Schema<T = unknown> {
  optional: boolean;
  nullable: boolean;
  validate(value: unknown, path?: string): ValidationResult<T>;
}

// ============================================================================
// Schema Builder Base
// ============================================================================

class SchemaBuilder<T> implements Schema<T> {
  optional = false;
  nullable = false;
  protected defaultValue?: T;
  protected validators: ValidatorFn<T>[] = [];

  isOptional(): this {
    this.optional = true;
    return this;
  }

  isNullable(): this {
    this.nullable = true;
    return this;
  }

  withDefault(value: T): this {
    this.defaultValue = value;
    this.optional = true;
    return this;
  }

  protected addValidator(fn: ValidatorFn<T>): this {
    this.validators.push(fn);
    return this;
  }

  validate(value: unknown, path: string = ''): ValidationResult<T> {
    const errors: ValidationError[] = [];

    // Handle undefined
    if (value === undefined) {
      if (this.defaultValue !== undefined) {
        return { success: true, data: this.defaultValue, errors: [] };
      }
      if (this.optional) {
        return { success: true, data: undefined as unknown as T, errors: [] };
      }
      errors.push({ path, message: 'Value is required', code: 'required' });
      return { success: false, errors };
    }

    // Handle null
    if (value === null) {
      if (this.nullable) {
        return { success: true, data: null as unknown as T, errors: [] };
      }
      errors.push({ path, message: 'Value cannot be null', code: 'null' });
      return { success: false, errors };
    }

    // Run validators
    for (const validator of this.validators) {
      const error = validator(value as T, path);
      if (error) {
        errors.push(error);
      }
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return { success: true, data: value as T, errors: [] };
  }
}

// ============================================================================
// String Schema
// ============================================================================

export class StringSchema extends SchemaBuilder<string> {
  constructor() {
    super();
    this.addValidator((value, path) => {
      if (typeof value !== 'string') {
        return { path, message: 'Expected string', code: 'type', value };
      }
      return null;
    });
  }

  min(length: number): this {
    return this.addValidator((value, path) => {
      if (typeof value === 'string' && value.length < length) {
        return { path, message: `Minimum length is ${length}`, code: 'minLength', value };
      }
      return null;
    });
  }

  max(length: number): this {
    return this.addValidator((value, path) => {
      if (typeof value === 'string' && value.length > length) {
        return { path, message: `Maximum length is ${length}`, code: 'maxLength', value };
      }
      return null;
    });
  }

  length(min: number, max?: number): this {
    this.min(min);
    if (max !== undefined) {
      this.max(max);
    }
    return this;
  }

  pattern(regex: RegExp, message?: string): this {
    return this.addValidator((value, path) => {
      if (typeof value === 'string' && !regex.test(value)) {
        return { path, message: message || 'Does not match pattern', code: 'pattern', value };
      }
      return null;
    });
  }

  enum(values: string[]): this {
    return this.addValidator((value, path) => {
      if (typeof value === 'string' && !values.includes(value)) {
        return { path, message: `Must be one of: ${values.join(', ')}`, code: 'enum', value };
      }
      return null;
    });
  }

  email(): this {
    return this.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address');
  }

  url(): this {
    return this.pattern(/^https?:\/\/[^\s/$.?#].[^\s]*$/, 'Invalid URL');
  }

  uuid(): this {
    return this.pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Invalid UUID');
  }

  nonempty(): this {
    return this.min(1);
  }
}

// ============================================================================
// Number Schema
// ============================================================================

export class NumberSchema extends SchemaBuilder<number> {
  constructor() {
    super();
    this.addValidator((value, path) => {
      if (typeof value !== 'number' || isNaN(value)) {
        return { path, message: 'Expected number', code: 'type', value };
      }
      return null;
    });
  }

  min(value: number): this {
    return this.addValidator((v, path) => {
      if (typeof v === 'number' && v < value) {
        return { path, message: `Minimum value is ${value}`, code: 'min', value: v };
      }
      return null;
    });
  }

  max(value: number): this {
    return this.addValidator((v, path) => {
      if (typeof v === 'number' && v > value) {
        return { path, message: `Maximum value is ${value}`, code: 'max', value: v };
      }
      return null;
    });
  }

  integer(): this {
    return this.addValidator((value, path) => {
      if (typeof value === 'number' && !Number.isInteger(value)) {
        return { path, message: 'Must be an integer', code: 'integer', value };
      }
      return null;
    });
  }

  positive(): this {
    return this.addValidator((value, path) => {
      if (typeof value === 'number' && value <= 0) {
        return { path, message: 'Must be positive', code: 'positive', value };
      }
      return null;
    });
  }

  negative(): this {
    return this.addValidator((value, path) => {
      if (typeof value === 'number' && value >= 0) {
        return { path, message: 'Must be negative', code: 'negative', value };
      }
      return null;
    });
  }

  finite(): this {
    return this.addValidator((value, path) => {
      if (typeof value === 'number' && !Number.isFinite(value)) {
        return { path, message: 'Must be finite', code: 'finite', value };
      }
      return null;
    });
  }
}

// ============================================================================
// Boolean Schema
// ============================================================================

export class BooleanSchema extends SchemaBuilder<boolean> {
  constructor() {
    super();
    this.addValidator((value, path) => {
      if (typeof value !== 'boolean') {
        return { path, message: 'Expected boolean', code: 'type', value };
      }
      return null;
    });
  }
}

// ============================================================================
// Array Schema
// ============================================================================

export class ArraySchema<T> extends SchemaBuilder<T[]> {
  private itemSchema?: Schema<T>;

  constructor(items?: Schema<T>) {
    super();
    this.itemSchema = items;
    this.addValidator((value, path) => {
      if (!Array.isArray(value)) {
        return { path, message: 'Expected array', code: 'type', value };
      }
      return null;
    });
  }

  min(length: number): this {
    return this.addValidator((value, path) => {
      if (Array.isArray(value) && value.length < length) {
        return { path, message: `Minimum length is ${length}`, code: 'minLength', value };
      }
      return null;
    });
  }

  max(length: number): this {
    return this.addValidator((value, path) => {
      if (Array.isArray(value) && value.length > length) {
        return { path, message: `Maximum length is ${length}`, code: 'maxLength', value };
      }
      return null;
    });
  }

  nonempty(): this {
    return this.min(1);
  }

  validate(value: unknown, path: string = ''): ValidationResult<T[]> {
    const baseResult = super.validate(value, path);
    if (!baseResult.success || !baseResult.data) {
      return baseResult;
    }

    if (this.itemSchema && Array.isArray(baseResult.data)) {
      const errors: ValidationError[] = [];
      const validatedItems: T[] = [];

      for (let i = 0; i < baseResult.data.length; i++) {
        const itemPath = `${path}[${i}]`;
        const itemResult = this.itemSchema.validate(baseResult.data[i], itemPath);

        if (!itemResult.success) {
          errors.push(...itemResult.errors);
        } else if (itemResult.data !== undefined) {
          validatedItems.push(itemResult.data);
        }
      }

      if (errors.length > 0) {
        return { success: false, errors };
      }

      return { success: true, data: validatedItems, errors: [] };
    }

    return baseResult;
  }
}

// ============================================================================
// Object Schema
// ============================================================================

export class ObjectSchema<T extends Record<string, unknown>> extends SchemaBuilder<T> {
  private shape: Record<string, Schema<unknown>>;
  private strict = false;
  private allowUnknown = false;

  constructor(shape: Record<string, Schema<unknown>> = {}) {
    super();
    this.shape = shape;
    this.addValidator((value, path) => {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return { path, message: 'Expected object', code: 'type', value };
      }
      return null;
    });
  }

  strictMode(): this {
    this.strict = true;
    return this;
  }

  passthrough(): this {
    this.allowUnknown = true;
    return this;
  }

  validate(value: unknown, path: string = ''): ValidationResult<T> {
    const baseResult = super.validate(value, path);
    if (!baseResult.success || !baseResult.data) {
      return baseResult;
    }

    const obj = baseResult.data as Record<string, unknown>;
    const errors: ValidationError[] = [];
    const validated: Record<string, unknown> = {};

    // Validate known keys
    for (const [key, schema] of Object.entries(this.shape)) {
      const keyPath = path ? `${path}.${key}` : key;
      const result = schema.validate(obj[key], keyPath);

      if (!result.success) {
        errors.push(...result.errors);
      } else if (result.data !== undefined) {
        validated[key] = result.data;
      }
    }

    // Check for unknown keys
    if (this.strict) {
      for (const key of Object.keys(obj)) {
        if (!(key in this.shape)) {
          const keyPath = path ? `${path}.${key}` : key;
          errors.push({ path: keyPath, message: 'Unknown key', code: 'unknown', value: obj[key] });
        }
      }
    } else if (this.allowUnknown) {
      for (const key of Object.keys(obj)) {
        if (!(key in this.shape)) {
          validated[key] = obj[key];
        }
      }
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return { success: true, data: validated as T, errors: [] };
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export const v = {
  string: () => new StringSchema(),
  number: () => new NumberSchema(),
  boolean: () => new BooleanSchema(),
  array: <T>(items?: Schema<T>) => new ArraySchema<T>(items),
  object: <T extends Record<string, unknown>>(shape?: Record<string, Schema<unknown>>) =>
    new ObjectSchema<T>(shape),

  // Shortcuts
  email: () => new StringSchema().email(),
  url: () => new StringSchema().url(),
  uuid: () => new StringSchema().uuid(),
  int: () => new NumberSchema().integer(),
  positive: () => new NumberSchema().positive(),
};

// ============================================================================
// Utility Functions
// ============================================================================

export function validate<T>(schema: Schema<T>, value: unknown): ValidationResult<T> {
  return schema.validate(value);
}

export function isValid<T>(schema: Schema<T>, value: unknown): boolean {
  return schema.validate(value).success;
}

export function parse<T>(schema: Schema<T>, value: unknown): T {
  const result = schema.validate(value);
  if (!result.success) {
    throw new ValidationException(result.errors);
  }
  return result.data as T;
}

export function safeParse<T>(
  schema: Schema<T>,
  value: unknown
): { success: true; data: T } | { success: false; errors: ValidationError[] } {
  const result = schema.validate(value);
  if (result.success) {
    return { success: true, data: result.data as T };
  }
  return { success: false, errors: result.errors };
}

export class ValidationException extends Error {
  errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super(`Validation failed: ${errors.map(e => e.message).join(', ')}`);
    this.name = 'ValidationException';
    this.errors = errors;
  }
}

export function formatErrors(errors: ValidationError[]): string {
  return errors.map(e => `${e.path || 'value'}: ${e.message}`).join('\n');
}

// ============================================================================
// Common Validators
// ============================================================================

export const validators = {
  isEmail: (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  isUrl: (value: string): boolean => /^https?:\/\/[^\s/$.?#].[^\s]*$/.test(value),
  isUuid: (value: string): boolean =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value),
  isHex: (value: string): boolean => /^[0-9a-fA-F]+$/.test(value),
  isBase64: (value: string): boolean => /^[A-Za-z0-9+/]*={0,2}$/.test(value),
  isAlpha: (value: string): boolean => /^[a-zA-Z]+$/.test(value),
  isAlphanumeric: (value: string): boolean => /^[a-zA-Z0-9]+$/.test(value),
  isNumeric: (value: string): boolean => /^[0-9]+$/.test(value),
  isSlug: (value: string): boolean => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
  isBitcoinAddress: (value: string): boolean => /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(value),
  isEthereumAddress: (value: string): boolean => /^0x[a-fA-F0-9]{40}$/.test(value),
};

// ============================================================================
// Sanitizers
// ============================================================================

export const sanitize = {
  trim: (value: string): string => value.trim(),
  lowercase: (value: string): string => value.toLowerCase(),
  uppercase: (value: string): string => value.toUpperCase(),
  escape: (value: string): string =>
    value.replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] || c
    ),
  stripHtml: (value: string): string => value.replace(/<[^>]*>/g, ''),
  normalizeEmail: (value: string): string => value.toLowerCase().trim(),
  slug: (value: string): string =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, ''),
};
