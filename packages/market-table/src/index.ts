/**
 * @b0ase/market-table
 *
 * Trading interface types and utilities for token markets.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Order side */
export type OrderSide = 'buy' | 'sell';

/** Order type */
export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit';

/** Order status */
export type OrderStatus =
  | 'pending'
  | 'open'
  | 'partial'
  | 'filled'
  | 'cancelled'
  | 'expired';

/** Time in force */
export type TimeInForce = 'gtc' | 'ioc' | 'fok' | 'day';

/** Trade status */
export type TradeStatus = 'pending' | 'settled' | 'failed';

/** Market status */
export type MarketStatus = 'active' | 'paused' | 'closed';

/** Token pair */
export interface TokenPair {
  id: string;
  baseToken: TokenInfo;
  quoteToken: TokenInfo;
  status: MarketStatus;
  minOrderSize: bigint;
  maxOrderSize: bigint;
  tickSize: bigint;
  makerFee: number;
  takerFee: number;
}

/** Token info */
export interface TokenInfo {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  contractAddress?: string;
  iconUrl?: string;
}

/** Order */
export interface Order {
  id: string;
  pairId: string;
  userId: string;
  side: OrderSide;
  type: OrderType;
  status: OrderStatus;
  price: bigint;
  amount: bigint;
  filled: bigint;
  remaining: bigint;
  avgFillPrice?: bigint;
  timeInForce: TimeInForce;
  stopPrice?: bigint;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

/** Trade */
export interface Trade {
  id: string;
  pairId: string;
  buyOrderId: string;
  sellOrderId: string;
  buyerId: string;
  sellerId: string;
  price: bigint;
  amount: bigint;
  buyerFee: bigint;
  sellerFee: bigint;
  status: TradeStatus;
  txid?: string;
  createdAt: Date;
  settledAt?: Date;
}

/** Order book level */
export interface OrderBookLevel {
  price: bigint;
  amount: bigint;
  orderCount: number;
}

/** Order book */
export interface OrderBook {
  pairId: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  spread: bigint;
  spreadPercent: number;
  lastUpdated: Date;
}

/** Market ticker */
export interface MarketTicker {
  pairId: string;
  lastPrice: bigint;
  priceChange24h: bigint;
  priceChangePercent24h: number;
  high24h: bigint;
  low24h: bigint;
  volume24h: bigint;
  quoteVolume24h: bigint;
  openPrice24h: bigint;
  bestBid: bigint;
  bestAsk: bigint;
  lastUpdated: Date;
}

/** Candlestick (OHLCV) */
export interface Candlestick {
  timestamp: Date;
  open: bigint;
  high: bigint;
  low: bigint;
  close: bigint;
  volume: bigint;
}

/** Time interval */
export type TimeInterval = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';

/** Market stats */
export interface MarketStats {
  pairId: string;
  totalTrades: number;
  totalVolume: bigint;
  avgTradeSize: bigint;
  makers: number;
  takers: number;
}

/** User portfolio */
export interface UserPortfolio {
  userId: string;
  balances: TokenBalance[];
  openOrders: Order[];
  totalValueQuote: bigint;
}

/** Token balance */
export interface TokenBalance {
  tokenId: string;
  symbol: string;
  available: bigint;
  locked: bigint;
  total: bigint;
  valueInQuote?: bigint;
}

/** Create order input */
export interface CreateOrderInput {
  pairId: string;
  side: OrderSide;
  type: OrderType;
  price?: bigint;
  amount: bigint;
  timeInForce?: TimeInForce;
  stopPrice?: bigint;
}

// ============================================================================
// Market Manager
// ============================================================================

export class MarketManager {
  private pairs: Map<string, TokenPair> = new Map();
  private orders: Map<string, Order> = new Map();
  private trades: Trade[] = [];
  private orderBooks: Map<string, OrderBook> = new Map();
  private tickers: Map<string, MarketTicker> = new Map();
  private matchCallback?: (buyOrder: Order, sellOrder: Order, amount: bigint, price: bigint) => Promise<Trade>;

  // ==========================================================================
  // Pair Management
  // ==========================================================================

  registerPair(pair: TokenPair): void {
    this.pairs.set(pair.id, pair);
    this.initializeOrderBook(pair.id);
    this.initializeTicker(pair.id);
  }

  getPair(pairId: string): TokenPair | undefined {
    return this.pairs.get(pairId);
  }

  getAllPairs(): TokenPair[] {
    return Array.from(this.pairs.values());
  }

  getActivePairs(): TokenPair[] {
    return Array.from(this.pairs.values()).filter(p => p.status === 'active');
  }

  // ==========================================================================
  // Order Management
  // ==========================================================================

  async createOrder(input: CreateOrderInput, userId: string): Promise<Order> {
    const pair = this.pairs.get(input.pairId);
    if (!pair) throw new Error('Pair not found');
    if (pair.status !== 'active') throw new Error('Market is not active');

    // Validate order
    this.validateOrder(input, pair);

    const order: Order = {
      id: this.generateId('order'),
      pairId: input.pairId,
      userId,
      side: input.side,
      type: input.type,
      status: 'pending',
      price: input.price || BigInt(0),
      amount: input.amount,
      filled: BigInt(0),
      remaining: input.amount,
      timeInForce: input.timeInForce || 'gtc',
      stopPrice: input.stopPrice,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.orders.set(order.id, order);

    // Try to match immediately for market orders
    if (input.type === 'market' || input.type === 'limit') {
      await this.matchOrder(order);
    }

    // Add to order book if not fully filled
    if (order.remaining > BigInt(0) && order.status !== 'filled') {
      order.status = 'open';
      this.addToOrderBook(order);
    }

    return order;
  }

  cancelOrder(orderId: string, userId: string): Order {
    const order = this.orders.get(orderId);
    if (!order) throw new Error('Order not found');
    if (order.userId !== userId) throw new Error('Not your order');
    if (order.status !== 'open' && order.status !== 'partial') {
      throw new Error('Order cannot be cancelled');
    }

    order.status = 'cancelled';
    order.updatedAt = new Date();
    this.removeFromOrderBook(order);

    return order;
  }

  getOrder(orderId: string): Order | undefined {
    return this.orders.get(orderId);
  }

  getUserOrders(userId: string, pairId?: string): Order[] {
    return Array.from(this.orders.values()).filter(o => {
      if (o.userId !== userId) return false;
      if (pairId && o.pairId !== pairId) return false;
      return true;
    });
  }

  getOpenOrders(userId: string, pairId?: string): Order[] {
    return this.getUserOrders(userId, pairId).filter(
      o => o.status === 'open' || o.status === 'partial'
    );
  }

  // ==========================================================================
  // Order Matching
  // ==========================================================================

  setMatchCallback(callback: (buyOrder: Order, sellOrder: Order, amount: bigint, price: bigint) => Promise<Trade>): void {
    this.matchCallback = callback;
  }

  private async matchOrder(order: Order): Promise<void> {
    const orderBook = this.orderBooks.get(order.pairId);
    if (!orderBook) return;

    const oppositeBook = order.side === 'buy' ? orderBook.asks : orderBook.bids;

    for (const level of oppositeBook) {
      if (order.remaining <= BigInt(0)) break;

      // Check price match
      if (order.type === 'limit') {
        if (order.side === 'buy' && level.price > order.price) break;
        if (order.side === 'sell' && level.price < order.price) break;
      }

      // Find matching orders at this level
      const matchingOrders = Array.from(this.orders.values()).filter(o =>
        o.pairId === order.pairId &&
        o.side !== order.side &&
        o.price === level.price &&
        (o.status === 'open' || o.status === 'partial')
      );

      for (const matchOrder of matchingOrders) {
        if (order.remaining <= BigInt(0)) break;

        const matchAmount = order.remaining < matchOrder.remaining
          ? order.remaining
          : matchOrder.remaining;

        await this.executeTrade(order, matchOrder, matchAmount, level.price);
      }
    }
  }

  private async executeTrade(
    buyOrder: Order,
    sellOrder: Order,
    amount: bigint,
    price: bigint
  ): Promise<Trade> {
    const pair = this.pairs.get(buyOrder.pairId)!;

    const trade: Trade = {
      id: this.generateId('trade'),
      pairId: buyOrder.pairId,
      buyOrderId: buyOrder.id,
      sellOrderId: sellOrder.id,
      buyerId: buyOrder.userId,
      sellerId: sellOrder.userId,
      price,
      amount,
      buyerFee: (amount * BigInt(Math.floor(pair.takerFee * 10000))) / BigInt(10000),
      sellerFee: (amount * BigInt(Math.floor(pair.makerFee * 10000))) / BigInt(10000),
      status: 'pending',
      createdAt: new Date(),
    };

    // Update orders
    this.updateOrderFill(buyOrder, amount, price);
    this.updateOrderFill(sellOrder, amount, price);

    // Execute via callback if provided
    if (this.matchCallback) {
      const result = await this.matchCallback(buyOrder, sellOrder, amount, price);
      trade.txid = result.txid;
      trade.status = result.status;
      trade.settledAt = result.settledAt;
    } else {
      trade.status = 'settled';
      trade.settledAt = new Date();
    }

    this.trades.push(trade);
    this.updateTicker(buyOrder.pairId, price, amount);

    return trade;
  }

  private updateOrderFill(order: Order, amount: bigint, price: bigint): void {
    order.filled += amount;
    order.remaining -= amount;
    order.updatedAt = new Date();

    // Calculate average fill price
    const totalValue = (order.avgFillPrice || BigInt(0)) * (order.filled - amount) + price * amount;
    order.avgFillPrice = totalValue / order.filled;

    if (order.remaining <= BigInt(0)) {
      order.status = 'filled';
      this.removeFromOrderBook(order);
    } else {
      order.status = 'partial';
      this.updateOrderBook(order.pairId);
    }
  }

  // ==========================================================================
  // Order Book
  // ==========================================================================

  private initializeOrderBook(pairId: string): void {
    this.orderBooks.set(pairId, {
      pairId,
      bids: [],
      asks: [],
      spread: BigInt(0),
      spreadPercent: 0,
      lastUpdated: new Date(),
    });
  }

  private addToOrderBook(order: Order): void {
    const book = this.orderBooks.get(order.pairId);
    if (!book) return;

    const levels = order.side === 'buy' ? book.bids : book.asks;
    const existingLevel = levels.find(l => l.price === order.price);

    if (existingLevel) {
      existingLevel.amount += order.remaining;
      existingLevel.orderCount++;
    } else {
      levels.push({
        price: order.price,
        amount: order.remaining,
        orderCount: 1,
      });

      // Sort: bids descending, asks ascending
      if (order.side === 'buy') {
        levels.sort((a, b) => Number(b.price - a.price));
      } else {
        levels.sort((a, b) => Number(a.price - b.price));
      }
    }

    this.updateSpread(book);
  }

  private removeFromOrderBook(order: Order): void {
    const book = this.orderBooks.get(order.pairId);
    if (!book) return;

    const levels = order.side === 'buy' ? book.bids : book.asks;
    const levelIndex = levels.findIndex(l => l.price === order.price);

    if (levelIndex >= 0) {
      levels[levelIndex].amount -= order.remaining;
      levels[levelIndex].orderCount--;

      if (levels[levelIndex].amount <= BigInt(0)) {
        levels.splice(levelIndex, 1);
      }
    }

    this.updateSpread(book);
  }

  private updateOrderBook(pairId: string): void {
    const book = this.orderBooks.get(pairId);
    if (book) {
      book.lastUpdated = new Date();
      this.updateSpread(book);
    }
  }

  private updateSpread(book: OrderBook): void {
    if (book.bids.length > 0 && book.asks.length > 0) {
      const bestBid = book.bids[0].price;
      const bestAsk = book.asks[0].price;
      book.spread = bestAsk - bestBid;
      book.spreadPercent = Number((book.spread * BigInt(10000)) / bestAsk) / 100;
    } else {
      book.spread = BigInt(0);
      book.spreadPercent = 0;
    }
  }

  getOrderBook(pairId: string, depth?: number): OrderBook | undefined {
    const book = this.orderBooks.get(pairId);
    if (!book) return undefined;

    return {
      ...book,
      bids: depth ? book.bids.slice(0, depth) : book.bids,
      asks: depth ? book.asks.slice(0, depth) : book.asks,
    };
  }

  // ==========================================================================
  // Ticker & Stats
  // ==========================================================================

  private initializeTicker(pairId: string): void {
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
      lastUpdated: new Date(),
    });
  }

  private updateTicker(pairId: string, price: bigint, volume: bigint): void {
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

    ticker.lastUpdated = new Date();
  }

  getTicker(pairId: string): MarketTicker | undefined {
    return this.tickers.get(pairId);
  }

  getAllTickers(): MarketTicker[] {
    return Array.from(this.tickers.values());
  }

  getTrades(pairId: string, limit?: number): Trade[] {
    const trades = this.trades
      .filter(t => t.pairId === pairId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return limit ? trades.slice(0, limit) : trades;
  }

  // ==========================================================================
  // Validation
  // ==========================================================================

  private validateOrder(input: CreateOrderInput, pair: TokenPair): void {
    if (input.amount < pair.minOrderSize) {
      throw new Error(`Minimum order size is ${pair.minOrderSize}`);
    }
    if (input.amount > pair.maxOrderSize) {
      throw new Error(`Maximum order size is ${pair.maxOrderSize}`);
    }
    if (input.type === 'limit' && !input.price) {
      throw new Error('Limit orders require a price');
    }
    if (input.price && input.price % pair.tickSize !== BigInt(0)) {
      throw new Error(`Price must be a multiple of tick size ${pair.tickSize}`);
    }
  }

  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createMarketManager(): MarketManager {
  return new MarketManager();
}

// ============================================================================
// Utility Functions
// ============================================================================

export function formatPrice(price: bigint, decimals: number): string {
  const divisor = BigInt(10 ** decimals);
  const whole = price / divisor;
  const fraction = price % divisor;
  if (fraction === BigInt(0)) return whole.toString();
  return `${whole}.${fraction.toString().padStart(decimals, '0').replace(/0+$/, '')}`;
}

export function parsePrice(price: string, decimals: number): bigint {
  const [whole, fraction = ''] = price.split('.');
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole + paddedFraction);
}

export function calculateTotal(price: bigint, amount: bigint, decimals: number): bigint {
  return (price * amount) / BigInt(10 ** decimals);
}

export function getPriceChangeColor(change: number): string {
  if (change > 0) return '#22C55E';
  if (change < 0) return '#EF4444';
  return '#6B7280';
}

export function formatVolume(volume: bigint): string {
  const num = Number(volume);
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toFixed(2);
}
