/**
 * Pricing Utility for b0ase.com
 *
 * Calculates the 1/3-1/3-1/3 payment structure with 25% margin protection.
 *
 * Payment Structure:
 * - Deposit: 1/3 of elevated price (due at order)
 * - Delivery: 1/3 of elevated price (due on delivery)
 * - Final: 1/3 of elevated price (due 30 days after delivery)
 *
 * The 25% elevation protects margins if a customer refuses the final payment.
 * If they pay all three installments, they're paying 25% more than base.
 * If they only pay two, we still make our margin on the base price.
 */

import type { ProductPricing, PaymentSchedule } from './types/commerce';

// Margin protection multiplier (25% = 1.25)
const MARGIN_PROTECTION = 1.25;

// Number of installments
const INSTALLMENTS = 3;

/**
 * Calculate full pricing breakdown for a product
 */
export function calculatePricing(
  basePrice: number,
  deliveryWeeks: { min: number; max: number } = { min: 2, max: 4 },
  currency: 'GBP' | 'USD' | 'EUR' = 'GBP'
): ProductPricing {
  // Apply 25% margin protection
  const elevatedPrice = roundToTwoDecimals(basePrice * MARGIN_PROTECTION);

  // Calculate each installment (1/3 of elevated price)
  const installmentAmount = roundToTwoDecimals(elevatedPrice / INSTALLMENTS);

  // The final payment absorbs any rounding differences
  const finalPayment = roundToTwoDecimals(
    elevatedPrice - (installmentAmount * 2)
  );

  return {
    basePrice: roundToTwoDecimals(basePrice),
    elevatedPrice,
    deposit: installmentAmount,
    deliveryPayment: installmentAmount,
    finalPayment,
    currency,
    deliveryWeeks
  };
}

/**
 * Calculate pricing for a package with discount applied
 */
export function calculatePackagePricing(
  basePrice: number,
  discountPercentage: number,
  deliveryWeeks: { min: number; max: number }
): ProductPricing {
  // Apply discount to base price
  const discountedBase = basePrice * (1 - discountPercentage / 100);
  return calculatePricing(discountedBase, deliveryWeeks);
}

/**
 * Calculate total from cart items
 */
export function calculateCartTotal(items: { pricing: ProductPricing; quantity: number }[]): {
  baseTotal: number;
  elevatedTotal: number;
  depositTotal: number;
  deliveryTotal: number;
  finalTotal: number;
  savings: number;
} {
  const totals = items.reduce(
    (acc, item) => ({
      baseTotal: acc.baseTotal + item.pricing.basePrice * item.quantity,
      elevatedTotal: acc.elevatedTotal + item.pricing.elevatedPrice * item.quantity,
      depositTotal: acc.depositTotal + item.pricing.deposit * item.quantity,
      deliveryTotal: acc.deliveryTotal + item.pricing.deliveryPayment * item.quantity,
      finalTotal: acc.finalTotal + item.pricing.finalPayment * item.quantity
    }),
    { baseTotal: 0, elevatedTotal: 0, depositTotal: 0, deliveryTotal: 0, finalTotal: 0 }
  );

  return {
    ...totals,
    savings: 0  // No savings in standard pricing; packages may have discounts
  };
}

/**
 * Generate payment schedule from order dates
 */
export function generatePaymentSchedule(
  pricing: ProductPricing,
  orderDate: Date,
  deliveryDate?: Date,
  depositPaidAt?: Date,
  deliveryPaidAt?: Date,
  finalPaidAt?: Date
): PaymentSchedule {
  const now = new Date();

  // Deposit is due immediately
  const depositDue = orderDate;
  const depositStatus = depositPaidAt
    ? 'paid'
    : now > depositDue
    ? 'overdue'
    : 'due';

  // Delivery payment is due on delivery
  const deliveryDue = deliveryDate;
  const deliveryStatus = deliveryPaidAt
    ? 'paid'
    : !deliveryDate
    ? 'pending'
    : now > deliveryDate
    ? 'overdue'
    : 'due';

  // Final payment is due 30 days after delivery
  const finalDue = deliveryDate
    ? new Date(deliveryDate.getTime() + 30 * 24 * 60 * 60 * 1000)
    : undefined;
  const finalStatus = finalPaidAt
    ? 'paid'
    : !finalDue
    ? 'pending'
    : now > finalDue
    ? 'overdue'
    : 'due';

  // Calculate remaining balance
  const paidAmount =
    (depositPaidAt ? pricing.deposit : 0) +
    (deliveryPaidAt ? pricing.deliveryPayment : 0) +
    (finalPaidAt ? pricing.finalPayment : 0);

  return {
    deposit: {
      amount: pricing.deposit,
      dueDate: depositDue,
      status: depositStatus,
      paidAt: depositPaidAt
    },
    delivery: {
      amount: pricing.deliveryPayment,
      dueDate: deliveryDue,
      status: deliveryStatus,
      paidAt: deliveryPaidAt
    },
    final: {
      amount: pricing.finalPayment,
      dueDate: finalDue,
      status: finalStatus,
      paidAt: finalPaidAt
    },
    total: pricing.elevatedPrice,
    remaining: pricing.elevatedPrice - paidAmount
  };
}

/**
 * Format price for display
 */
export function formatPrice(
  amount: number,
  currency: 'GBP' | 'USD' | 'EUR' = 'GBP'
): string {
  const symbols: Record<string, string> = {
    GBP: '£',
    USD: '$',
    EUR: '€'
  };

  return `${symbols[currency]}${amount.toLocaleString('en-GB', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}`;
}

/**
 * Format price range for display
 */
export function formatPriceRange(
  min: number,
  max: number,
  currency: 'GBP' | 'USD' | 'EUR' = 'GBP'
): string {
  if (min === max) {
    return formatPrice(min, currency);
  }
  const symbols: Record<string, string> = {
    GBP: '£',
    USD: '$',
    EUR: '€'
  };
  return `${symbols[currency]}${min.toLocaleString()}-${max.toLocaleString()}`;
}

/**
 * Calculate estimated delivery date
 */
export function calculateDeliveryDate(
  orderDate: Date,
  deliveryWeeks: { min: number; max: number }
): { earliest: Date; latest: Date } {
  const earliest = new Date(orderDate);
  earliest.setDate(earliest.getDate() + deliveryWeeks.min * 7);

  const latest = new Date(orderDate);
  latest.setDate(latest.getDate() + deliveryWeeks.max * 7);

  return { earliest, latest };
}

/**
 * Format delivery estimate for display
 */
export function formatDeliveryEstimate(
  deliveryWeeks: { min: number; max: number }
): string {
  if (deliveryWeeks.min === deliveryWeeks.max) {
    return `${deliveryWeeks.min} week${deliveryWeeks.min === 1 ? '' : 's'}`;
  }
  return `${deliveryWeeks.min}-${deliveryWeeks.max} weeks`;
}

/**
 * Round to two decimal places
 */
function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Get the payment protection explanation text
 */
export function getPaymentProtectionExplanation(): string {
  return `Our payment structure includes a 25% protection margin. You pay in three equal installments:
1/3 deposit to start, 1/3 on delivery, and 1/3 within 30 days of delivery.
This gives you leverage for revisions while protecting our development costs.`;
}

/**
 * Check if an order has overdue payments
 */
export function hasOverduePayments(schedule: PaymentSchedule): boolean {
  return (
    schedule.deposit.status === 'overdue' ||
    schedule.delivery.status === 'overdue' ||
    schedule.final.status === 'overdue'
  );
}

/**
 * Get next payment due
 */
export function getNextPaymentDue(schedule: PaymentSchedule): {
  type: 'deposit' | 'delivery' | 'final';
  amount: number;
  dueDate?: Date;
} | null {
  if (schedule.deposit.status === 'due' || schedule.deposit.status === 'overdue') {
    return { type: 'deposit', amount: schedule.deposit.amount, dueDate: schedule.deposit.dueDate };
  }
  if (schedule.delivery.status === 'due' || schedule.delivery.status === 'overdue') {
    return { type: 'delivery', amount: schedule.delivery.amount, dueDate: schedule.delivery.dueDate };
  }
  if (schedule.final.status === 'due' || schedule.final.status === 'overdue') {
    return { type: 'final', amount: schedule.final.amount, dueDate: schedule.final.dueDate };
  }
  return null;
}
