// src/index.ts
var SchemaBuilder = class {
  constructor() {
    this.optional = false;
    this.nullable = false;
    this.validators = [];
  }
  isOptional() {
    this.optional = true;
    return this;
  }
  isNullable() {
    this.nullable = true;
    return this;
  }
  withDefault(value) {
    this.defaultValue = value;
    this.optional = true;
    return this;
  }
  addValidator(fn) {
    this.validators.push(fn);
    return this;
  }
  validate(value, path = "") {
    const errors = [];
    if (value === void 0) {
      if (this.defaultValue !== void 0) {
        return { success: true, data: this.defaultValue, errors: [] };
      }
      if (this.optional) {
        return { success: true, data: void 0, errors: [] };
      }
      errors.push({ path, message: "Value is required", code: "required" });
      return { success: false, errors };
    }
    if (value === null) {
      if (this.nullable) {
        return { success: true, data: null, errors: [] };
      }
      errors.push({ path, message: "Value cannot be null", code: "null" });
      return { success: false, errors };
    }
    for (const validator of this.validators) {
      const error = validator(value, path);
      if (error) {
        errors.push(error);
      }
    }
    if (errors.length > 0) {
      return { success: false, errors };
    }
    return { success: true, data: value, errors: [] };
  }
};
var StringSchema = class extends SchemaBuilder {
  constructor() {
    super();
    this.addValidator((value, path) => {
      if (typeof value !== "string") {
        return { path, message: "Expected string", code: "type", value };
      }
      return null;
    });
  }
  min(length) {
    return this.addValidator((value, path) => {
      if (typeof value === "string" && value.length < length) {
        return { path, message: `Minimum length is ${length}`, code: "minLength", value };
      }
      return null;
    });
  }
  max(length) {
    return this.addValidator((value, path) => {
      if (typeof value === "string" && value.length > length) {
        return { path, message: `Maximum length is ${length}`, code: "maxLength", value };
      }
      return null;
    });
  }
  length(min, max) {
    this.min(min);
    if (max !== void 0) {
      this.max(max);
    }
    return this;
  }
  pattern(regex, message) {
    return this.addValidator((value, path) => {
      if (typeof value === "string" && !regex.test(value)) {
        return { path, message: message || "Does not match pattern", code: "pattern", value };
      }
      return null;
    });
  }
  enum(values) {
    return this.addValidator((value, path) => {
      if (typeof value === "string" && !values.includes(value)) {
        return { path, message: `Must be one of: ${values.join(", ")}`, code: "enum", value };
      }
      return null;
    });
  }
  email() {
    return this.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address");
  }
  url() {
    return this.pattern(/^https?:\/\/[^\s/$.?#].[^\s]*$/, "Invalid URL");
  }
  uuid() {
    return this.pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, "Invalid UUID");
  }
  nonempty() {
    return this.min(1);
  }
};
var NumberSchema = class extends SchemaBuilder {
  constructor() {
    super();
    this.addValidator((value, path) => {
      if (typeof value !== "number" || isNaN(value)) {
        return { path, message: "Expected number", code: "type", value };
      }
      return null;
    });
  }
  min(value) {
    return this.addValidator((v2, path) => {
      if (typeof v2 === "number" && v2 < value) {
        return { path, message: `Minimum value is ${value}`, code: "min", value: v2 };
      }
      return null;
    });
  }
  max(value) {
    return this.addValidator((v2, path) => {
      if (typeof v2 === "number" && v2 > value) {
        return { path, message: `Maximum value is ${value}`, code: "max", value: v2 };
      }
      return null;
    });
  }
  integer() {
    return this.addValidator((value, path) => {
      if (typeof value === "number" && !Number.isInteger(value)) {
        return { path, message: "Must be an integer", code: "integer", value };
      }
      return null;
    });
  }
  positive() {
    return this.addValidator((value, path) => {
      if (typeof value === "number" && value <= 0) {
        return { path, message: "Must be positive", code: "positive", value };
      }
      return null;
    });
  }
  negative() {
    return this.addValidator((value, path) => {
      if (typeof value === "number" && value >= 0) {
        return { path, message: "Must be negative", code: "negative", value };
      }
      return null;
    });
  }
  finite() {
    return this.addValidator((value, path) => {
      if (typeof value === "number" && !Number.isFinite(value)) {
        return { path, message: "Must be finite", code: "finite", value };
      }
      return null;
    });
  }
};
var BooleanSchema = class extends SchemaBuilder {
  constructor() {
    super();
    this.addValidator((value, path) => {
      if (typeof value !== "boolean") {
        return { path, message: "Expected boolean", code: "type", value };
      }
      return null;
    });
  }
};
var ArraySchema = class extends SchemaBuilder {
  constructor(items) {
    super();
    this.itemSchema = items;
    this.addValidator((value, path) => {
      if (!Array.isArray(value)) {
        return { path, message: "Expected array", code: "type", value };
      }
      return null;
    });
  }
  min(length) {
    return this.addValidator((value, path) => {
      if (Array.isArray(value) && value.length < length) {
        return { path, message: `Minimum length is ${length}`, code: "minLength", value };
      }
      return null;
    });
  }
  max(length) {
    return this.addValidator((value, path) => {
      if (Array.isArray(value) && value.length > length) {
        return { path, message: `Maximum length is ${length}`, code: "maxLength", value };
      }
      return null;
    });
  }
  nonempty() {
    return this.min(1);
  }
  validate(value, path = "") {
    const baseResult = super.validate(value, path);
    if (!baseResult.success || !baseResult.data) {
      return baseResult;
    }
    if (this.itemSchema && Array.isArray(baseResult.data)) {
      const errors = [];
      const validatedItems = [];
      for (let i = 0; i < baseResult.data.length; i++) {
        const itemPath = `${path}[${i}]`;
        const itemResult = this.itemSchema.validate(baseResult.data[i], itemPath);
        if (!itemResult.success) {
          errors.push(...itemResult.errors);
        } else if (itemResult.data !== void 0) {
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
};
var ObjectSchema = class extends SchemaBuilder {
  constructor(shape = {}) {
    super();
    this.strict = false;
    this.allowUnknown = false;
    this.shape = shape;
    this.addValidator((value, path) => {
      if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return { path, message: "Expected object", code: "type", value };
      }
      return null;
    });
  }
  strictMode() {
    this.strict = true;
    return this;
  }
  passthrough() {
    this.allowUnknown = true;
    return this;
  }
  validate(value, path = "") {
    const baseResult = super.validate(value, path);
    if (!baseResult.success || !baseResult.data) {
      return baseResult;
    }
    const obj = baseResult.data;
    const errors = [];
    const validated = {};
    for (const [key, schema] of Object.entries(this.shape)) {
      const keyPath = path ? `${path}.${key}` : key;
      const result = schema.validate(obj[key], keyPath);
      if (!result.success) {
        errors.push(...result.errors);
      } else if (result.data !== void 0) {
        validated[key] = result.data;
      }
    }
    if (this.strict) {
      for (const key of Object.keys(obj)) {
        if (!(key in this.shape)) {
          const keyPath = path ? `${path}.${key}` : key;
          errors.push({ path: keyPath, message: "Unknown key", code: "unknown", value: obj[key] });
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
    return { success: true, data: validated, errors: [] };
  }
};
var v = {
  string: () => new StringSchema(),
  number: () => new NumberSchema(),
  boolean: () => new BooleanSchema(),
  array: (items) => new ArraySchema(items),
  object: (shape) => new ObjectSchema(shape),
  // Shortcuts
  email: () => new StringSchema().email(),
  url: () => new StringSchema().url(),
  uuid: () => new StringSchema().uuid(),
  int: () => new NumberSchema().integer(),
  positive: () => new NumberSchema().positive()
};
function validate(schema, value) {
  return schema.validate(value);
}
function isValid(schema, value) {
  return schema.validate(value).success;
}
function parse(schema, value) {
  const result = schema.validate(value);
  if (!result.success) {
    throw new ValidationException(result.errors);
  }
  return result.data;
}
function safeParse(schema, value) {
  const result = schema.validate(value);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.errors };
}
var ValidationException = class extends Error {
  constructor(errors) {
    super(`Validation failed: ${errors.map((e) => e.message).join(", ")}`);
    this.name = "ValidationException";
    this.errors = errors;
  }
};
function formatErrors(errors) {
  return errors.map((e) => `${e.path || "value"}: ${e.message}`).join("\n");
}
var validators = {
  isEmail: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  isUrl: (value) => /^https?:\/\/[^\s/$.?#].[^\s]*$/.test(value),
  isUuid: (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value),
  isHex: (value) => /^[0-9a-fA-F]+$/.test(value),
  isBase64: (value) => /^[A-Za-z0-9+/]*={0,2}$/.test(value),
  isAlpha: (value) => /^[a-zA-Z]+$/.test(value),
  isAlphanumeric: (value) => /^[a-zA-Z0-9]+$/.test(value),
  isNumeric: (value) => /^[0-9]+$/.test(value),
  isSlug: (value) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
  isBitcoinAddress: (value) => /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(value),
  isEthereumAddress: (value) => /^0x[a-fA-F0-9]{40}$/.test(value)
};
var sanitize = {
  trim: (value) => value.trim(),
  lowercase: (value) => value.toLowerCase(),
  uppercase: (value) => value.toUpperCase(),
  escape: (value) => value.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] || c
  ),
  stripHtml: (value) => value.replace(/<[^>]*>/g, ""),
  normalizeEmail: (value) => value.toLowerCase().trim(),
  slug: (value) => value.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "")
};
export {
  ArraySchema,
  BooleanSchema,
  NumberSchema,
  ObjectSchema,
  StringSchema,
  ValidationException,
  formatErrors,
  isValid,
  parse,
  safeParse,
  sanitize,
  v,
  validate,
  validators
};
//# sourceMappingURL=index.js.map