// src/types.ts
var HandCashError = class extends Error {
  constructor(message, code = "HANDCASH_ERROR") {
    super(message);
    this.name = "HandCashError";
    this.code = code;
  }
};
var HandCashDemoModeError = class extends HandCashError {
  constructor() {
    super("HandCash is in DEMO MODE - real operations unavailable", "DEMO_MODE");
  }
};
var HandCashAuthError = class extends HandCashError {
  constructor(message = "Authentication required") {
    super(message, "AUTH_REQUIRED");
  }
};

export {
  HandCashError,
  HandCashDemoModeError,
  HandCashAuthError
};
