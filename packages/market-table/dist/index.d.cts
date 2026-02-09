/**
 * @b0ase/market-table
 *
 * Trading interface types and utilities for token markets.
 *
 * @packageDocumentation
 */
/** Order side */
type OrderSide = 'buy' | 'sell';
/** Order type */
type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit';
/** Order status */
type OrderStatus = 'pending' | 'open' | 'partial' | 'filled' | 'cancelled' | 'expired';
/** Time in force */
type TimeInForce = 'gtc' | 'ioc' | 'fok' | 'day';
/** Trade status */
type TradeStatus = 'pending' | 'settled' | 'failed';
/** Market status */
type MarketStatus = 'active' | 'paused' | 'closed';
/** Token pair */
interface TokenPair {
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
interface TokenInfo {
    id: string;
    symbol: string;
    name: string;
    decimals: number;
    contractAddress?: string;
    iconUrl?: string;
}
/** Order */
interface Order {
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
interface Trade {
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
interface OrderBookLevel {
    price: bigint;
    amount: bigint;
    orderCount: number;
}
/** Order book */
interface OrderBook {
    pairId: string;
    bids: OrderBookLevel[];
    asks: OrderBookLevel[];
    spread: bigint;
    spreadPercent: number;
    lastUpdated: Date;
}
/** Market ticker */
interface MarketTicker {
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
interface Candlestick {
    timestamp: Date;
    open: bigint;
    high: bigint;
    low: bigint;
    close: bigint;
    volume: bigint;
}
/** Time interval */
type TimeInterval = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';
/** Market stats */
interface MarketStats {
    pairId: string;
    totalTrades: number;
    totalVolume: bigint;
    avgTradeSize: bigint;
    makers: number;
    takers: number;
}
/** User portfolio */
interface UserPortfolio {
    userId: string;
    balances: TokenBalance[];
    openOrders: Order[];
    totalValueQuote: bigint;
}
/** Token balance */
interface TokenBalance {
    tokenId: string;
    symbol: string;
    available: bigint;
    locked: bigint;
    total: bigint;
    valueInQuote?: bigint;
}
/** Create order input */
interface CreateOrderInput {
    pairId: string;
    side: OrderSide;
    type: OrderType;
    price?: bigint;
    amount: bigint;
    timeInForce?: TimeInForce;
    stopPrice?: bigint;
}
declare class MarketManager {
    private pairs;
    private orders;
    private trades;
    private orderBooks;
    private tickers;
    private matchCallback?;
    registerPair(pair: TokenPair): void;
    getPair(pairId: string): TokenPair | undefined;
    getAllPairs(): TokenPair[];
    getActivePairs(): TokenPair[];
    createOrder(input: CreateOrderInput, userId: string): Promise<Order>;
    cancelOrder(orderId: string, userId: string): Order;
    getOrder(orderId: string): Order | undefined;
    getUserOrders(userId: string, pairId?: string): Order[];
    getOpenOrders(userId: string, pairId?: string): Order[];
    setMatchCallback(callback: (buyOrder: Order, sellOrder: Order, amount: bigint, price: bigint) => Promise<Trade>): void;
    private matchOrder;
    private executeTrade;
    private updateOrderFill;
    private initializeOrderBook;
    private addToOrderBook;
    private removeFromOrderBook;
    private updateOrderBook;
    private updateSpread;
    getOrderBook(pairId: string, depth?: number): OrderBook | undefined;
    private initializeTicker;
    private updateTicker;
    getTicker(pairId: string): MarketTicker | undefined;
    getAllTickers(): MarketTicker[];
    getTrades(pairId: string, limit?: number): Trade[];
    private validateOrder;
    private generateId;
}
declare function createMarketManager(): MarketManager;
declare function formatPrice(price: bigint, decimals: number): string;
declare function parsePrice(price: string, decimals: number): bigint;
declare function calculateTotal(price: bigint, amount: bigint, decimals: number): bigint;
declare function getPriceChangeColor(change: number): string;
declare function formatVolume(volume: bigint): string;

export { type Candlestick, type CreateOrderInput, MarketManager, type MarketStats, type MarketStatus, type MarketTicker, type Order, type OrderBook, type OrderBookLevel, type OrderSide, type OrderStatus, type OrderType, type TimeInForce, type TimeInterval, type TokenBalance, type TokenInfo, type TokenPair, type Trade, type TradeStatus, type UserPortfolio, calculateTotal, createMarketManager, formatPrice, formatVolume, getPriceChangeColor, parsePrice };
