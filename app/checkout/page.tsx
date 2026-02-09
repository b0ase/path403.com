'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/components/SimpleCartProvider';
import getSupabaseBrowserClient from '@/lib/supabase/client';
import { calculatePricing, formatPrice } from '@/lib/pricing';
import { formatPrice as formatClientPrice, PaymentPlan } from '@/lib/clients';
import {
  FaCreditCard,
  FaBitcoin,
  FaPaypal,
  FaEthereum,
  FaShieldAlt,
  FaArrowLeft,
  FaCheckCircle,
  FaCopy,
  FaSpinner,
  FaClock,
  FaCalendarAlt
} from 'react-icons/fa';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  enabled: boolean;
}

// Client checkout data interface
interface ClientCheckoutItem {
  category: string;
  service: string;
  price: number;
  unit: string;
  quantity: number;
}

interface ClientCheckoutData {
  clientSlug: string;
  clientName: string;
  projectSlug: string;
  projectName: string;
  items: ClientCheckoutItem[];
  total: number;
  paymentPlan: PaymentPlan;
  paymentBreakdown: { label: string; amount: number; when: string }[];
}

export default function CheckoutPage() {
  const { items, total, itemCount, clearCart } = useCart();
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  // Client project checkout data
  const [clientCheckoutData, setClientCheckoutData] = useState<ClientCheckoutData | null>(null);

  const [selectedPayment, setSelectedPayment] = useState<string>('crypto');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [paymentAddress, setPaymentAddress] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [specialRequirements, setSpecialRequirements] = useState<string>('');

  // Calculate payment schedule using 1/3-1/3-1/3 structure with 25% margin protection
  const paymentSchedule = useMemo(() => {
    const pricing = calculatePricing(total, { min: 2, max: 4 }, 'GBP');
    return {
      total: pricing.elevatedPrice,
      deposit: pricing.deposit,
      deliveryPayment: pricing.deliveryPayment,
      finalPayment: pricing.finalPayment,
      deliveryWeeks: pricing.deliveryWeeks
    };
  }, [total]);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      icon: <FaBitcoin className="text-orange-400" />,
      description: 'Pay with Bitcoin, Ethereum, or other cryptocurrencies',
      enabled: true
    },
    {
      id: 'stripe',
      name: 'Credit Card',
      icon: <FaCreditCard className="text-gray-400" />,
      description: 'Visa, Mastercard, American Express',
      enabled: false // You'll need to implement Stripe integration
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: <FaPaypal className="text-blue-400" />,
      description: 'Pay securely with your PayPal account',
      enabled: false // You'll need to implement PayPal integration
    }
  ];

  useEffect(() => {
    // Check for client project checkout data
    const storedData = sessionStorage.getItem('checkoutData');
    if (storedData) {
      setClientCheckoutData(JSON.parse(storedData));
      return; // Don't redirect if we have client checkout data
    }

    if (items.length === 0) {
      router.push('/modules');
    }

    // Get user email for order
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };
    getUserData();
  }, [items, router, supabase]);

  const handlePlaceOrder = async () => {
    if (!userEmail) {
      alert('Please log in to place an order');
      return;
    }

    setIsProcessing(true);

    try {
      // Calculate delivery dates
      const orderDate = new Date();
      const estimatedDeliveryMin = new Date(orderDate);
      estimatedDeliveryMin.setDate(estimatedDeliveryMin.getDate() + paymentSchedule.deliveryWeeks.min * 7);
      const estimatedDeliveryMax = new Date(orderDate);
      estimatedDeliveryMax.setDate(estimatedDeliveryMax.getDate() + paymentSchedule.deliveryWeeks.max * 7);

      // Create order in database with payment schedule
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          total_amount: paymentSchedule.total,
          base_price: total,
          elevated_price: paymentSchedule.total,
          deposit_amount: paymentSchedule.deposit,
          delivery_amount: paymentSchedule.deliveryPayment,
          final_amount: paymentSchedule.finalPayment,
          delivery_weeks_min: paymentSchedule.deliveryWeeks.min,
          delivery_weeks_max: paymentSchedule.deliveryWeeks.max,
          estimated_delivery_date: estimatedDeliveryMax.toISOString().split('T')[0],
          currency: 'GBP',
          payment_method: selectedPayment,
          payment_status: 'pending',
          special_requirements: specialRequirements,
          billing_info: {
            email: userEmail
          }
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Add order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        item_type: item.item_type,
        item_id: item.item_id,
        item_name: item.item_name,
        item_description: item.item_description,
        price: item.price,
        quantity: item.quantity,
        custom_options: item.custom_options
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Generate payment address for crypto payments
      if (selectedPayment === 'crypto') {
        setPaymentAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'); // Example Bitcoin address
      }

      setOrderNumber(order.order_number);
      setOrderComplete(true);
      
      // Clear cart after successful order
      await clearCart();

    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  // Handle client project checkout
  const handleClientCheckout = async () => {
    if (!clientCheckoutData || !userEmail) return;

    setIsProcessing(true);

    try {
      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          total_amount: clientCheckoutData.total,
          base_price: clientCheckoutData.total,
          elevated_price: clientCheckoutData.total,
          deposit_amount: clientCheckoutData.paymentBreakdown[0]?.amount || clientCheckoutData.total * 0.3,
          delivery_amount: clientCheckoutData.paymentBreakdown[1]?.amount || clientCheckoutData.total * 0.3,
          final_amount: clientCheckoutData.paymentBreakdown[2]?.amount || clientCheckoutData.total * 0.4,
          currency: 'GBP',
          payment_method: selectedPayment,
          payment_status: 'pending',
          special_requirements: `Client: ${clientCheckoutData.clientName}, Project: ${clientCheckoutData.projectName}, Payment Plan: ${clientCheckoutData.paymentPlan}`,
          billing_info: { email: userEmail }
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Add order items
      const orderItems = clientCheckoutData.items.map(item => ({
        order_id: order.id,
        item_type: 'service',
        item_id: item.service.toLowerCase().replace(/\s+/g, '-'),
        item_name: item.service,
        item_description: `${item.category} - ${item.unit}`,
        price: item.price,
        quantity: item.quantity,
        custom_options: {}
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      if (selectedPayment === 'crypto') {
        setPaymentAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
      }

      setOrderNumber(order.order_number);
      setOrderComplete(true);
      sessionStorage.removeItem('checkoutData');

    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Render client project checkout UI
  if (clientCheckoutData) {
    const firstPayment = clientCheckoutData.paymentBreakdown[0];

    if (orderComplete) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="max-w-2xl mx-auto p-8 text-center">
            <FaCheckCircle className="text-6xl text-green-400 mx-auto mb-6" />
            <h1 className="text-4xl font-bold mb-4">Order Placed Successfully!</h1>
            <p className="text-xl text-gray-300 mb-6">
              Thank you for your order. We'll begin work on your project right away!
            </p>

            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Order Details</h2>
              <div className="text-left space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-400">Order Number:</span>
                  <span className="font-mono">{orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Project:</span>
                  <span>{clientCheckoutData.projectName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Client:</span>
                  <span>{clientCheckoutData.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total:</span>
                  <span className="font-semibold">{formatClientPrice(clientCheckoutData.total)}</span>
                </div>
              </div>
            </div>

            <Link
              href={`/client/${clientCheckoutData.clientSlug}`}
              className="inline-block bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Back to Client
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-black text-white">
        <section className="px-4 md:px-8 py-16">
          <div className="max-w-4xl mx-auto">
            <Link
              href={`/client/${clientCheckoutData.clientSlug}/project/${clientCheckoutData.projectSlug}/checklist`}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8"
            >
              <FaArrowLeft size={14} />
              <span className="text-sm">Back to Checklist</span>
            </Link>

            <div className="mb-12 border-b border-gray-800 pb-8">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-2">
                CHECKOUT
              </h1>
              <p className="text-gray-400">
                Complete payment for <span className="text-white">{clientCheckoutData.projectName}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Payment Form */}
              <div className="space-y-6">
                <div className="p-6 border border-gray-800">
                  <h3 className="text-sm font-bold uppercase tracking-tight mb-4 text-gray-400">
                    Payment Method
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {paymentMethods.filter(m => m.enabled).map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedPayment(method.id)}
                        className={`p-4 border text-center transition-colors ${
                          selectedPayment === method.id
                            ? 'border-white bg-white/5'
                            : 'border-gray-800 hover:border-gray-600'
                        }`}
                      >
                        <div className="text-2xl mb-2">{method.icon}</div>
                        <p className="font-bold">{method.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 border border-gray-800 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-tight mb-4 text-gray-400">
                    Contact Details
                  </h3>
                  <div>
                    <label className="block text-xs text-gray-500 uppercase tracking-widest mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full p-3 bg-black border border-gray-800 focus:border-white outline-none transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>

                  <button
                    onClick={handleClientCheckout}
                    disabled={isProcessing || !userEmail}
                    className={`w-full py-4 text-sm font-bold uppercase tracking-widest transition-colors ${
                      isProcessing || !userEmail ? 'bg-gray-800 text-gray-500' : 'hover:opacity-80'
                    }`}
                    style={!isProcessing && userEmail ? { backgroundColor: '#fff', color: '#000' } : undefined}
                  >
                    {isProcessing ? 'Processing...' : `Pay ${formatClientPrice(firstPayment.amount)} Now`}
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-6">
                <div className="p-6 border border-gray-800">
                  <h3 className="text-sm font-bold uppercase tracking-tight mb-4 text-gray-400">
                    Project
                  </h3>
                  <p className="text-xl font-bold">{clientCheckoutData.projectName}</p>
                  <p className="text-gray-500 text-sm">{clientCheckoutData.clientName}</p>
                </div>

                <div className="p-6 border border-gray-800">
                  <h3 className="text-sm font-bold uppercase tracking-tight mb-4 text-gray-400">
                    Items ({clientCheckoutData.items.length})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {clientCheckoutData.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-400">
                          {item.service} {item.quantity > 1 && `×${item.quantity}`}
                        </span>
                        <span>{formatClientPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>{formatClientPrice(clientCheckoutData.total)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 border border-white/20 bg-white/5">
                  <h3 className="text-sm font-bold uppercase tracking-tight mb-4 text-gray-400">
                    Payment Schedule
                  </h3>
                  <div className="space-y-3">
                    {clientCheckoutData.paymentBreakdown.map((payment, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <div>
                          <span className="text-white">{payment.label}</span>
                          <span className="text-gray-500 text-xs ml-2">({payment.when})</span>
                        </div>
                        <span className="font-bold">{formatClientPrice(payment.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-8 text-center">
          <FaCheckCircle className="text-6xl text-green-400 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Order Placed Successfully!</h1>
          <p className="text-xl text-gray-300 mb-6">
            Thank you for your order. We'll get started on your crypto project modules right away!
          </p>
          
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>
            <div className="text-left space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-400">Order Number:</span>
                <span className="font-mono">{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Project Cost:</span>
                <span className="font-semibold">{formatPrice(paymentSchedule.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Items:</span>
                <span>{itemCount} modules/services</span>
              </div>
            </div>

            {/* Payment Schedule Summary */}
            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Payment Schedule</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-400">Deposit (Due Today)</span>
                  <span className="font-semibold text-emerald-400">{formatPrice(paymentSchedule.deposit)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-400">On Delivery ({paymentSchedule.deliveryWeeks.min}-{paymentSchedule.deliveryWeeks.max} weeks)</span>
                  <span className="font-semibold text-blue-400">{formatPrice(paymentSchedule.deliveryPayment)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-purple-400">Final (30 days after delivery)</span>
                  <span className="font-semibold text-purple-400">{formatPrice(paymentSchedule.finalPayment)}</span>
                </div>
              </div>
            </div>
          </div>

          {selectedPayment === 'crypto' && paymentAddress && (
            <div className="bg-orange-900/20 border border-orange-400 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-orange-400 mb-4">
                <FaBitcoin className="inline mr-2" />
                Pay Your Deposit
              </h3>
              <p className="text-gray-300 mb-4">
                Send <strong>{formatPrice(paymentSchedule.deposit)}</strong> worth of Bitcoin to begin your project:
              </p>
              <div className="bg-black border border-gray-600 rounded p-3 font-mono text-sm break-all mb-4">
                {paymentAddress}
                <button
                  onClick={() => copyToClipboard(paymentAddress)}
                  className="ml-2 text-cyan-400 hover:text-cyan-300"
                >
                  <FaCopy />
                </button>
              </div>
              <p className="text-xs text-gray-400">
                Your project will begin once the deposit payment is confirmed on the blockchain.
                You'll be invoiced for the remaining payments according to the schedule above.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <Link 
              href="/modules"
              className="inline-block bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Browse More Modules
            </Link>
            <p className="text-sm text-gray-400">
              Need help? Contact us at <a href="mailto:support@b0ase.com" className="text-cyan-400">support@b0ase.com</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/modules" className="flex items-center text-gray-400 hover:text-white transition-colors mr-4">
            <FaArrowLeft className="mr-2" />
            Back to Modules
          </Link>
          <h1 className="text-3xl font-bold">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Payment Method */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Payment Method</h2>
              
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div 
                    key={method.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedPayment === method.id 
                        ? 'border-cyan-400 bg-cyan-400/5' 
                        : method.enabled 
                          ? 'border-gray-600 hover:border-gray-500' 
                          : 'border-gray-700 opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => method.enabled && setSelectedPayment(method.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          checked={selectedPayment === method.id}
                          onChange={() => method.enabled && setSelectedPayment(method.id)}
                          disabled={!method.enabled}
                          className="text-cyan-400"
                        />
                        <div className="text-2xl">{method.icon}</div>
                        <div>
                          <div className="font-medium">{method.name}</div>
                          <div className="text-sm text-gray-400">{method.description}</div>
                        </div>
                      </div>
                      {!method.enabled && (
                        <span className="text-xs bg-gray-700 text-gray-400 px-2 py-1 rounded">
                          Coming Soon
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Special Requirements (Optional)
                  </label>
                  <textarea
                    value={specialRequirements}
                    onChange={(e) => setSpecialRequirements(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                    placeholder="Any specific requirements, custom features, or additional notes for your order..."
                  />
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-green-900/20 border border-green-400 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-green-400">
                <FaShieldAlt />
                <span className="font-semibold">Secure Checkout</span>
              </div>
              <p className="text-sm text-gray-300 mt-2">
                Your order and payment information is encrypted and secure. We never store your payment details.
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={`${item.item_type}-${item.item_id}`} className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{item.item_name}</div>
                      <div className="text-xs text-gray-400">
                        {item.item_type} × {item.quantity}
                      </div>
                    </div>
                    <div className="text-sm font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Schedule */}
              <div className="border-t border-gray-700 pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <FaCalendarAlt className="text-cyan-400" />
                  <span className="font-semibold text-white">Payment Schedule</span>
                </div>

                <div className="space-y-3 mb-4">
                  {/* Deposit */}
                  <div className="bg-emerald-900/20 border border-emerald-500/30 rounded p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium text-emerald-400">Deposit (Today)</div>
                        <div className="text-xs text-gray-400">Due now to start your project</div>
                      </div>
                      <div className="text-lg font-bold text-emerald-400">
                        {formatPrice(paymentSchedule.deposit)}
                      </div>
                    </div>
                  </div>

                  {/* Delivery Payment */}
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded p-3 opacity-70">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium text-blue-400">On Delivery</div>
                        <div className="text-xs text-gray-400">
                          <FaClock className="inline mr-1" />
                          Est. {paymentSchedule.deliveryWeeks.min}-{paymentSchedule.deliveryWeeks.max} weeks
                        </div>
                      </div>
                      <div className="text-lg font-bold text-blue-400">
                        {formatPrice(paymentSchedule.deliveryPayment)}
                      </div>
                    </div>
                  </div>

                  {/* Final Payment */}
                  <div className="bg-purple-900/20 border border-purple-500/30 rounded p-3 opacity-70">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium text-purple-400">Final Payment</div>
                        <div className="text-xs text-gray-400">Within 30 days of delivery</div>
                      </div>
                      <div className="text-lg font-bold text-purple-400">
                        {formatPrice(paymentSchedule.finalPayment)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-gray-700 pt-3">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total Project Cost:</span>
                    <span className="text-cyan-400">{formatPrice(paymentSchedule.total)}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {itemCount} item{itemCount !== 1 ? 's' : ''} · Paid in 3 installments
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing || !userEmail}
                className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <FaSpinner className="animate-spin inline mr-2" />
                    Processing...
                  </>
                ) : (
                  `Pay Deposit - ${formatPrice(paymentSchedule.deposit)}`
                )}
              </button>

              <p className="text-xs text-gray-400 mt-4 text-center">
                By placing this order, you agree to our terms of service and the 1/3-1/3-1/3 payment structure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 