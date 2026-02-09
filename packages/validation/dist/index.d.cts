/**
 * @b0ase/validation
 *
 * Input validation utilities and schema builders.
 *
 * @packageDocumentation
 */
/** Validation result */
interface ValidationResult<T = unknown> {
    success: boolean;
    data?: T;
    errors: ValidationError[];
}
/** Validation error */
interface ValidationError {
    path: string;
    message: string;
    code: string;
    value?: unknown;
}
/** Validator function */
type ValidatorFn<T = unknown> = (value: T, path: string) => ValidationError | null;
/** Schema interface */
interface Schema<T = unknown> {
    optional: boolean;
    nullable: boolean;
    validate(value: unknown, path?: string): ValidationResult<T>;
}
declare class SchemaBuilder<T> implements Schema<T> {
    optional: boolean;
    nullable: boolean;
    protected defaultValue?: T;
    protected validators: ValidatorFn<T>[];
    isOptional(): this;
    isNullable(): this;
    withDefault(value: T): this;
    protected addValidator(fn: ValidatorFn<T>): this;
    validate(value: unknown, path?: string): ValidationResult<T>;
}
declare class StringSchema extends SchemaBuilder<string> {
    constructor();
    min(length: number): this;
    max(length: number): this;
    length(min: number, max?: number): this;
    pattern(regex: RegExp, message?: string): this;
    enum(values: string[]): this;
    email(): this;
    url(): this;
    uuid(): this;
    nonempty(): this;
}
declare class NumberSchema extends SchemaBuilder<number> {
    constructor();
    min(value: number): this;
    max(value: number): this;
    integer(): this;
    positive(): this;
    negative(): this;
    finite(): this;
}
declare class BooleanSchema extends SchemaBuilder<boolean> {
    constructor();
}
declare class ArraySchema<T> extends SchemaBuilder<T[]> {
    private itemSchema?;
    constructor(items?: Schema<T>);
    min(length: number): this;
    max(length: number): this;
    nonempty(): this;
    validate(value: unknown, path?: string): ValidationResult<T[]>;
}
declare class ObjectSchema<T extends Record<string, unknown>> extends SchemaBuilder<T> {
    private shape;
    private strict;
    private allowUnknown;
    constructor(shape?: Record<string, Schema<unknown>>);
    strictMode(): this;
    passthrough(): this;
    validate(value: unknown, path?: string): ValidationResult<T>;
}
declare const v: {
    string: () => StringSchema;
    number: () => NumberSchema;
    boolean: () => BooleanSchema;
    array: <T>(items?: Schema<T>) => ArraySchema<T>;
    object: <T extends Record<string, unknown>>(shape?: Record<string, Schema<unknown>>) => ObjectSchema<T>;
    email: () => StringSchema;
    url: () => StringSchema;
    uuid: () => StringSchema;
    int: () => NumberSchema;
    positive: () => NumberSchema;
};
declare function validate<T>(schema: Schema<T>, value: unknown): ValidationResult<T>;
declare function isValid<T>(schema: Schema<T>, value: unknown): boolean;
declare function parse<T>(schema: Schema<T>, value: unknown): T;
declare function safeParse<T>(schema: Schema<T>, value: unknown): {
    success: true;
    data: T;
} | {
    success: false;
    errors: ValidationError[];
};
declare class ValidationException extends Error {
    errors: ValidationError[];
    constructor(errors: ValidationError[]);
}
declare function formatErrors(errors: ValidationError[]): string;
declare const validators: {
    isEmail: (value: string) => boolean;
    isUrl: (value: string) => boolean;
    isUuid: (value: string) => boolean;
    isHex: (value: string) => boolean;
    isBase64: (value: string) => boolean;
    isAlpha: (value: string) => boolean;
    isAlphanumeric: (value: string) => boolean;
    isNumeric: (value: string) => boolean;
    isSlug: (value: string) => boolean;
    isBitcoinAddress: (value: string) => boolean;
    isEthereumAddress: (value: string) => boolean;
};
declare const sanitize: {
    trim: (value: string) => string;
    lowercase: (value: string) => string;
    uppercase: (value: string) => string;
    escape: (value: string) => string;
    stripHtml: (value: string) => string;
    normalizeEmail: (value: string) => string;
    slug: (value: string) => string;
};

export { ArraySchema, BooleanSchema, NumberSchema, ObjectSchema, type Schema, StringSchema, type ValidationError, ValidationException, type ValidationResult, type ValidatorFn, formatErrors, isValid, parse, safeParse, sanitize, v, validate, validators };
