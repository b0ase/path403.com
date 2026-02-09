// src/index.ts
var MarketManager = class {
  constructor() {
    this.pairs = /* @__PURE__ */ new Map();
    this.orders = /* @__PURE__ */ new Map();
    this.trades = [];
    this.orderBooks = /* @__PURE__ */ new Map();
    this.tickers = /* @__PURE__ */ new Map();
  }
  // ==========================================================================
  // Pair Management
  // ==========================================================================
  registerPair(pair) {
    this.pairs.set(pair.id, pair);
    this.initializeOrderBook(pair.id);
    this.initializeTicker(pair.id);
  }
  getPair(pairId) {
    return this.pairs.get(pairId);
  }
  getAllPairs() {
    return Array.from(this.pairs.values());
  }
  getActivePairs() {
    return Array.from(this.pairs.values()).filter((p) => p.status === "active");
  }
  // ==========================================================================
  // Order Management
  // ==========================================================================
  async createOrder(input, userId) {
    const pair = this.pairs.get(input.pairId);
    if (!pair) throw new Error("Pair not found");
    if (pair.status !== "active") throw new Error("Market is not active");
    this.validateOrder(input, pair);
    const order = {
      id: this.generateId("order"),
      pairId: input.pairId,
      userId,
      side: input.side,
      type: input.type,
      status: "pending",
      price: input.price || BigInt(0),
      amount: input.amount,
      filled: BigInt(0),
      remaining: input.amount,
      timeInForce: input.timeInForce || "gtc",
      stopPrice: input.stopPrice,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.orders.set(order.id, order);
    if (input.type === "market" || input.type === "limit") {
      await this.matchOrder(order);
    }
    if (order.remaining > BigInt(0) && order.status !== "filled") {
      order.status = "open";
      this.addToOrderBook(order);
    }
    return order;
  }
  cancelOrder(orderId, userId) {
    const order = this.orders.get(orderId);
    if (!order) throw new Error("Order not found");
    if (order.userId !== userId) throw new Error("Not your order");
    if (order.status !== "open" && order.status !== "partial") {
      throw new Error("Order cannot be cancelled");
    }
    order.status = "cancelled";
    order.updatedAt = /* @__PURE__ */ new Date();
    this.removeFromOrderBook(order);
    return order;
  }
  getOrder(orderId) {
    return this.orders.get(orderId);
  }
  getUserOrders(userId, pairId) {
    return Array.from(this.orders.values()).filter((o) => {
      if (o.userId !== userId) return false;
      if (pairId && o.pairId !== pairId) return false;
      return true;
    });
  }
  getOpenOrders(userId, pairId) {
    return this.getUserOrders(userId, pairId).filter(
      (o) => o.status === "open" || o.status === "partial"
    );
  }
  // ==========================================================================
  // Order Matching
  // ==========================================================================
  setMatchCallback(callback) {
    this.matchCallback = callback;
  }
  async matchOrder(order) {
    const orderBook = this.orderBooks.get(order.pairId);
    if (!orderBook) return;
    const oppositeBook = order.side === "buy" ? orderBook.asks : orderBook.bids;
    for (const level of oppositeBook) {
      if (order.remaining <= BigInt(0)) break;
      if (order.type === "limit") {
        if (order.side === "buy" && level.price > order.price) break;
        if (order.side === "sell" && level.price < order.price) break;
      }
      const matchingOrders = Array.from(this.orders.values()).filter(
        (o) => o.pairId === order.pairId && o.side !== order.side && o.price === level.price && (o.status === "open" || o.status === "partial")
      );
      for (const matchOrder of matchingOrders) {
        if (order.remaining <= BigInt(0)) break;
        const matchAmount = order.remaining < matchOrder.remaining ? order.remaining : matchOrder.remaining;
        await this.executeTrade(order, matchOrder, matchAmount, level.price);
      }
    }
  }
  async executeTrade(buyOrder, sellOrder, amount, price) {
    const pair = this.pairs.get(buyOrder.pairId);
    const trade = {
      id: this.generateId("trade"),
      pairId: buyOrder.pairId,
      buyOrderId: buyOrder.id,
      sellOrderId: sellOrder.id,
      buyerId: buyOrder.userId,
      sellerId: sellOrder.userId,
      price,
      amount,
      buyerFee: amount * BigInt(Math.floor(pair.takerFee * 1e4)) / BigInt(1e4),
      sellerFee: amount * BigInt(Math.floor(pair.makerFee * 1e4)) / BigInt(1e4),
      status: "pending",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.updateOrderFill(buyOrder, amount, price);
    this.updateOrderFill(sellOrder, amount, price);
    if (this.matchCallback) {
      const result = await this.matchCallback(buyOrder, sellOrder, amount, price);
      trade.txid = result.txid;
      trade.status = result.status;
      trade.settledAt = result.settledAt;
    } else {
      trade.status = "settled";
      trade.settledAt = /* @__PURE__ */ new Date();
    }
    this.trades.push(trade);
    this.updateTicker(buyOrder.pairId, price, amount);
    return trade;
  }
  updateOrderFill(order, amount, price) {
    order.filled += amount;
    order.remaining -= amount;
    order.updatedAt = /* @__PURE__ */ new Date();
    const totalValue = (order.avgFillPrice || BigInt(0)) * (order.filled - amount) + price * amount;
    order.avgFillPrice = totalValue / order.filled;
    if (order.remaining <= BigInt(0)) {
      order.status = "filled";
      this.removeFromOrderBook(order);
    } else {
      order.status = "partial";
      this.updateOrderBook(order.pairId);
    }
  }
  // ==========================================================================
  // Order Book
  // ==========================================================================
  initializeOrderBook(pairId) {
    this.orderBooks.set(pairId, {
      pairId,
      bids: [],
      asks: [],
      spread: BigInt(0),
      spreadPercent: 0,
      lastUpdated: /* @__PURE__ */ new Date()
    });
  }
  addToOrderBook(order) {
    const book = this.orderBooks.get(order.pairId);
    if (!book) return;
    const levels = order.side === "buy" ? book.bids : book.asks;
    const existingLevel = levels.find((l) => l.price === order.price);
    if (existingLevel) {
      existingLevel.amount += order.remaining;
      existingLevel.orderCount++;
    } else {
      levels.push({
        price: order.price,
        amount: order.remaining,
        orderCount: 1
      });
      if (order.side === "buy") {
        levels.sort((a, b) => Number(b.price - a.price));
      } else {
        levels.sort((a, b) => Number(a.price - b.price));
      }
    }
    this.updateSpread(book);
  }
  removeFromOrderBook(order) {
    const book = this.orderBooks.get(order.pairId);
    if (!book) return;
    const levels = order.side === "buy" ? book.bids : book.asks;
    const levelIndex = levels.findIndex((l) => l.price === order.price);
    if (levelIndex >= 0) {
      levels[levelIndex].amount -= order.remaining;
      levels[levelIndex].orderCount--;
      if (levels[levelIndex].amount <= BigInt(0)) {
        levels.splice(levelIndex, 1);
      }
    }
    this.updateSpread(book);
  }
  updateOrderBook(pairId) {
    const book = this.orderBooks.get(pairId);
    if (book) {
      book.lastUpdated = /* @__PURE__ */ new Date();
      this.updateSpread(book);
    }
  }
  updateSpread(book) {
    if (book.bids.length > 0 && book.asks.length > 0) {
      const bestBid = book.bids[0].price;
      const bestAsk = book.asks[0].price;
      book.spread = bestAsk - bestBid;
      book.spreadPercent = Number(book.spread * BigInt(1e4) / bestAsk) / 100;
    } else {
      book.spread = BigInt(0);
      book.spreadPercent = 0;
    }
  }
  getOrderBook(pairId, depth) {
    const book = this.orderBooks.get(pairId);
    if (!book) return void 0;
    return {
      ...book,
      bids: depth ? book.bids.slice(0, depth) : book.bids,
      asks: depth ? book.asks.slice(0, depth) : book.asks
    };
  }
  // ==========================================================================
  // Ticker & Stats
  // ==========================================================================
  initializeTicker(pairId) {
    this.tickers.set(pairId, {
      pairId,
      lastPrice: BigInt(0),
      priceChange24h: BigInt(0),
      priceChangePercent24h: 0,
      high24h: BigInt(0),
      low24h: BigInt(0),
      volume24h: BigInt(0),
      quoteVolume24h: BigInt(0),
      openPrice24h: BigInt(0),
      bestBid: BigInt(0),
      bestAsk: BigInt(0),
      lastUpdated: /* @__PURE__ */ new Date()
    });
  }
  updateTicker(pairId, price, volume) {
    const ticker = this.tickers.get(pairId);
    if (!ticker) return;
    ticker.lastPrice = price;
    ticker.volume24h += volume;
    ticker.quoteVolume24h += price * volume;
    if (ticker.high24h === BigInt(0) || price > ticker.high24h) {
      ticker.high24h = price;
    }
    if (ticker.low24h === BigInt(0) || price < ticker.low24h) {
      ticker.low24h = price;
    }
    const book = this.orderBooks.get(pairId);
    if (book) {
      ticker.bestBid = book.bids[0]?.price || BigInt(0);
      ticker.bestAsk = book.asks[0]?.price || BigInt(0);
    }
    ticker.lastUpdated = /* @__PURE__ */ new Date();
  }
  getTicker(pairId) {
    return this.tickers.get(pairId);
  }
  getAllTickers() {
    return Array.from(this.tickers.values());
  }
  getTrades(pairId, limit) {
    const trades = this.trades.filter((t) => t.pairId === pairId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return limit ? trades.slice(0, limit) : trades;
  }
  // ==========================================================================
  // Validation
  // ==========================================================================
  validateOrder(input, pair) {
    if (input.amount < pair.minOrderSize) {
      throw new Error(`Minimum order size is ${pair.minOrderSize}`);
    }
    if (input.amount > pair.maxOrderSize) {
      throw new Error(`Maximum order size is ${pair.maxOrderSize}`);
    }
    if (input.type === "limit" && !input.price) {
      throw new Error("Limit orders require a price");
    }
    if (input.price && input.price % pair.tickSize !== BigInt(0)) {
      throw new Error(`Price must be a multiple of tick size ${pair.tickSize}`);
    }
  }
  generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
};
function createMarketManager() {
  return new MarketManager();
}
function formatPrice(price, decimals) {
  const divisor = BigInt(10 ** decimals);
  const whole = price / divisor;
  const fraction = price % divisor;
  if (fraction === BigInt(0)) return whole.toString();
  return `${whole}.${fraction.toString().padStart(decimals, "0").replace(/0+$/, "")}`;
}
function parsePrice(price, decimals) {
  const [whole, fraction = ""] = price.split(".");
  const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
  return BigInt(whole + paddedFraction);
}
function calculateTotal(price, amount, decimals) {
  return price * amount / BigInt(10 ** decimals);
}
function getPriceChangeColor(change) {
  if (change > 0) return "#22C55E";
  if (change < 0) return "#EF4444";
  return "#6B7280";
}
function formatVolume(volume) {
  const num = Number(volume);
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toFixed(2);
}
export {
  MarketManager,
  calculateTotal,
  createMarketManager,
  formatPrice,
  formatVolume,
  getPriceChangeColor,
  parsePrice
};
//# sourceMappingURL=index.js.map