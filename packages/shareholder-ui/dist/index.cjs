"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  CapTableManager: () => CapTableManager,
  calculateDilution: () => calculateDilution,
  createCapTableManager: () => createCapTableManager,
  formatPercent: () => formatPercent,
  formatShares: () => formatShares,
  getNextVestingAmount: () => getNextVestingAmount,
  getVestingProgress: () => getVestingProgress
});
module.exports = __toCommonJS(index_exports);
var CapTableManager = class {
  constructor(companyName, totalShares) {
    this.capTable = {
      companyName,
      totalShares,
      issuedShares: BigInt(0),
      reservedShares: BigInt(0),
      shareholders: [],
      shareClasses: [],
      lastUpdated: /* @__PURE__ */ new Date()
    };
  }
  generateId() {
    return `sh-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  addShareholder(input) {
    const shareholder = {
      ...input,
      id: this.generateId(),
      percentOwnership: 0
    };
    this.capTable.shareholders.push(shareholder);
    this.capTable.issuedShares += input.shares;
    this.recalculateOwnership();
    this.capTable.lastUpdated = /* @__PURE__ */ new Date();
    return shareholder;
  }
  removeShareholder(id) {
    const index = this.capTable.shareholders.findIndex((s) => s.id === id);
    if (index === -1) return false;
    const shareholder = this.capTable.shareholders[index];
    this.capTable.issuedShares -= shareholder.shares;
    this.capTable.shareholders.splice(index, 1);
    this.recalculateOwnership();
    this.capTable.lastUpdated = /* @__PURE__ */ new Date();
    return true;
  }
  updateShares(id, newShares) {
    const shareholder = this.capTable.shareholders.find((s) => s.id === id);
    if (!shareholder) return void 0;
    const diff = newShares - shareholder.shares;
    shareholder.shares = newShares;
    this.capTable.issuedShares += diff;
    this.recalculateOwnership();
    this.capTable.lastUpdated = /* @__PURE__ */ new Date();
    return shareholder;
  }
  recalculateOwnership() {
    const total = Number(this.capTable.issuedShares);
    for (const shareholder of this.capTable.shareholders) {
      shareholder.percentOwnership = total > 0 ? Number(shareholder.shares) / total * 100 : 0;
    }
  }
  getCapTable() {
    return { ...this.capTable };
  }
  getShareholder(id) {
    return this.capTable.shareholders.find((s) => s.id === id);
  }
  getOwnershipSummary() {
    const byType = {};
    const byClass = {};
    for (const sh of this.capTable.shareholders) {
      if (!byType[sh.type]) {
        byType[sh.type] = { count: 0, shares: BigInt(0), percent: 0 };
      }
      byType[sh.type].count++;
      byType[sh.type].shares += sh.shares;
      byType[sh.type].percent += sh.percentOwnership;
      if (!byClass[sh.shareClass]) {
        byClass[sh.shareClass] = { count: 0, shares: BigInt(0), percent: 0 };
      }
      byClass[sh.shareClass].count++;
      byClass[sh.shareClass].shares += sh.shares;
      byClass[sh.shareClass].percent += sh.percentOwnership;
    }
    const topHolders = [...this.capTable.shareholders].sort((a, b) => Number(b.shares - a.shares)).slice(0, 10);
    return {
      byType,
      byClass,
      topHolders,
      totalHolders: this.capTable.shareholders.length
    };
  }
  calculateDistribution(totalAmount, currency = "USD") {
    const payments = [];
    const eligibleShares = this.capTable.issuedShares;
    if (eligibleShares === BigInt(0)) return payments;
    const perShareAmount = totalAmount / Number(eligibleShares);
    for (const sh of this.capTable.shareholders) {
      payments.push({
        shareholderId: sh.id,
        shareholderName: sh.name,
        shares: sh.shares,
        amount: Number(sh.shares) * perShareAmount,
        status: "pending"
      });
    }
    return payments;
  }
  setValuation(valuation) {
    this.capTable.valuation = valuation;
    this.capTable.pricePerShare = valuation / Number(this.capTable.totalShares);
    this.capTable.lastUpdated = /* @__PURE__ */ new Date();
  }
};
function createCapTableManager(companyName, totalShares) {
  return new CapTableManager(companyName, totalShares);
}
function formatShares(shares) {
  const num = Number(shares);
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toLocaleString();
}
function formatPercent(percent, decimals = 2) {
  return `${percent.toFixed(decimals)}%`;
}
function calculateDilution(currentShares, newShares) {
  const total = currentShares + newShares;
  return Number(newShares) / Number(total) * 100;
}
function getVestingProgress(schedule) {
  return Number(schedule.vestedShares) / Number(schedule.totalShares) * 100;
}
function getNextVestingAmount(schedule) {
  const monthlyVest = schedule.totalShares / BigInt(schedule.vestingPeriodMonths - schedule.cliffMonths);
  return monthlyVest;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CapTableManager,
  calculateDilution,
  createCapTableManager,
  formatPercent,
  formatShares,
  getNextVestingAmount,
  getVestingProgress
});
//# sourceMappingURL=index.cjs.map