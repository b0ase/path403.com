/**
 * Commerce Types for b0ase.com
 *
 * Types for the e-commerce system including pricing, orders, and payments.
 */

// Pricing structure for 1/3-1/3-1/3 payment model
export interface ProductPricing {
  basePrice: number;
  elevatedPrice: number;  // basePrice * 1.25 (25% margin protection)
  deposit: number;        // 1/3 of elevatedPrice
  deliveryPayment: number; // 1/3 of elevatedPrice
  finalPayment: number;   // 1/3 of elevatedPrice
  currency: 'GBP' | 'USD' | 'EUR';
  deliveryWeeks: {
    min: number;
    max: number;
  };
}

// Extended cart item with pricing breakdown
export interface CartItemWithPricing {
  item_type: 'service' | 'module' | 'template' | 'package';
  item_id: string;
  item_name: string;
  item_description?: string;
  quantity: number;
  custom_options?: Record<string, any>;
  pricing: ProductPricing;
}

// Product package (bundle of components or content)
export interface ProductPackage {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  description: string;
  package_type: 'component' | 'content';
  items: string[];  // Array of included item slugs
  features: string[];
  base_price: number;
  elevated_price: number;
  discount_percentage: number;
  delivery_weeks_min: number;
  delivery_weeks_max: number;
  complexity: 'Basic' | 'Intermediate' | 'Advanced' | 'Enterprise';
  icon?: string;
  color?: string;
  is_active: boolean;
  is_featured: boolean;
}

// Order with payment schedule
export interface OrderWithSchedule {
  id: string;
  user_id: string;
  base_price: number;
  elevated_price: number;
  deposit_amount: number;
  delivery_amount: number;
  final_amount: number;
  deposit_paid_at?: Date;
  delivery_paid_at?: Date;
  final_paid_at?: Date;
  estimated_delivery_date?: Date;
  actual_delivery_date?: Date;
  final_payment_due_date?: Date;
  delivery_weeks_min: number;
  delivery_weeks_max: number;
  payment_status: 'pending' | 'deposit_paid' | 'in_progress' | 'delivered' | 'completed' | 'overdue';
  items: OrderItem[];
  created_at: Date;
}

// Order item
export interface OrderItem {
  id: string;
  order_id: string;
  item_type: string;
  item_id: string;
  item_name: string;
  item_description?: string;
  price: number;
  quantity: number;
  custom_options?: Record<string, any>;
}

// Payment transaction
export interface PaymentTransaction {
  id: string;
  order_id: string;
  payment_type: 'deposit' | 'delivery' | 'final';
  amount: number;
  currency: string;
  payment_method?: string;
  payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
  payment_address?: string;
  created_at: Date;
  completed_at?: Date;
  error_message?: string;
}

// Payment schedule display
export interface PaymentSchedule {
  deposit: {
    amount: number;
    dueDate: Date;
    status: 'due' | 'paid' | 'overdue';
    paidAt?: Date;
  };
  delivery: {
    amount: number;
    dueDate?: Date;  // Set when delivery is scheduled
    status: 'pending' | 'due' | 'paid' | 'overdue';
    paidAt?: Date;
  };
  final: {
    amount: number;
    dueDate?: Date;  // 30 days after delivery
    status: 'pending' | 'due' | 'paid' | 'overdue';
    paidAt?: Date;
  };
  total: number;
  remaining: number;
}

// Component/Service item from modules
export interface ComponentItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  price: {
    min: number;
    max: number;
    currency: string;
  };
  deliveryWeeks: {
    min: number;
    max: number;
  };
  complexity: 'Basic' | 'Intermediate' | 'Advanced' | 'Enterprise';
  features: string[];
  technologies: string[];
}

// Content service item
export interface ContentServiceItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  price: {
    min: number;
    max: number;
    unit: string;  // 'per article', 'per project', 'per month'
    currency: string;
  };
  deliveryDays: {
    min: number;
    max: number;
  };
  features: string[];
}
