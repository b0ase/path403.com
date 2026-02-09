'use client';

import { use, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import {
  getClient,
  getProject,
  pricingCategories,
  formatPrice,
  getPaymentPlanBreakdown,
  PaymentPlan
} from '@/lib/clients';
import { FiArrowLeft, FiCheck, FiMinus, FiPlus } from 'react-icons/fi';

interface SelectedItem {
  category: string;
  service: string;
  price: number;
  unit: string;
  quantity: number;
}

export default function ChecklistPage({
  params
}: {
  params: Promise<{ slug: string; projectSlug: string }>
}) {
  const { slug, projectSlug } = use(params);
  const router = useRouter();
  const client = getClient(slug);
  const project = getProject(slug, projectSlug);

  const [selectedItems, setSelectedItems] = useState<Record<string, SelectedItem>>({});
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan>('30-30-30');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  if (!client || !project) {
    notFound();
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const toggleItem = (category: string, service: string, price: number, unit: string) => {
    const key = `${category}-${service}`;
    setSelectedItems(prev => {
      if (prev[key]) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [key]: { category, service, price, unit, quantity: 1 }
      };
    });
  };

  const updateQuantity = (key: string, delta: number) => {
    setSelectedItems(prev => {
      if (!prev[key]) return prev;
      const newQuantity = Math.max(1, prev[key].quantity + delta);
      return {
        ...prev,
        [key]: { ...prev[key], quantity: newQuantity }
      };
    });
  };

  const total = useMemo(() => {
    return Object.values(selectedItems).reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }, [selectedItems]);

  const selectedCount = Object.keys(selectedItems).length;
  const paymentBreakdown = getPaymentPlanBreakdown(total, paymentPlan);

  const handleLockIn = () => {
    // Store checkout data in sessionStorage
    const checkoutData = {
      clientSlug: slug,
      clientName: client.name,
      projectSlug,
      projectName: project.name,
      items: Object.values(selectedItems),
      total,
      paymentPlan,
      paymentBreakdown
    };
    sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="px-4 md:px-8 py-16">
        <div className="w-full">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/client" className="hover:text-white transition-colors">
              Clients
            </Link>
            <span>/</span>
            <Link href={`/client/${slug}`} className="hover:text-white transition-colors">
              {client.name}
            </Link>
            <span>/</span>
            <Link href={`/client/${slug}/project/${projectSlug}`} className="hover:text-white transition-colors">
              {project.name}
            </Link>
            <span>/</span>
            <span className="text-white">Checklist</span>
          </div>

          {/* Header */}
          <div className="mb-12 border-b border-gray-800 pb-8">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-2">
              PROJECT CHECKLIST
            </h1>
            <p className="text-gray-400">
              Select services for <span className="text-white">{project.name}</span> · {client.name}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Services List */}
            <div className="lg:col-span-2 space-y-4">
              {pricingCategories.map((category) => {
                const isExpanded = expandedCategories[category.category] !== false;
                const categorySelectedCount = category.items.filter(
                  item => selectedItems[`${category.category}-${item.service}`]
                ).length;

                return (
                  <div key={category.category} className="border border-gray-800">
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(category.category)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-900/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <h3 className="text-sm font-bold uppercase tracking-tight">
                          {category.category}
                        </h3>
                        {categorySelectedCount > 0 && (
                          <span className="px-2 py-0.5 text-xs bg-white text-black">
                            {categorySelectedCount} selected
                          </span>
                        )}
                      </div>
                      <span className="text-gray-500 text-sm">
                        {isExpanded ? '−' : '+'}
                      </span>
                    </button>

                    {/* Category Items */}
                    {isExpanded && (
                      <div className="border-t border-gray-800">
                        {category.items.map((item) => {
                          const key = `${category.category}-${item.service}`;
                          const selected = selectedItems[key];
                          const isSelected = !!selected;

                          return (
                            <div
                              key={item.service}
                              className={`flex items-center justify-between p-4 border-b border-gray-800 last:border-b-0 transition-colors ${isSelected ? 'bg-white/5' : 'hover:bg-gray-900/30'
                                }`}
                            >
                              <div className="flex items-center gap-4">
                                <button
                                  onClick={() => toggleItem(category.category, item.service, item.price, item.unit)}
                                  className={`w-5 h-5 border flex items-center justify-center transition-colors ${isSelected
                                      ? 'bg-white border-white'
                                      : 'border-gray-600 hover:border-gray-400'
                                    }`}
                                >
                                  {isSelected && <FiCheck className="text-black" size={14} />}
                                </button>
                                <div>
                                  <p className="text-sm text-white">{item.service}</p>
                                  <p className="text-xs text-gray-500">{item.unit}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                {isSelected && (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => updateQuantity(key, -1)}
                                      className="w-6 h-6 border border-gray-700 hover:border-gray-500 flex items-center justify-center transition-colors"
                                    >
                                      <FiMinus size={12} />
                                    </button>
                                    <span className="w-8 text-center text-sm">{selected.quantity}</span>
                                    <button
                                      onClick={() => updateQuantity(key, 1)}
                                      className="w-6 h-6 border border-gray-700 hover:border-gray-500 flex items-center justify-center transition-colors"
                                    >
                                      <FiPlus size={12} />
                                    </button>
                                  </div>
                                )}
                                <div className="w-20 text-right">
                                  <p className="text-sm font-bold">
                                    {formatPrice(isSelected ? item.price * selected.quantity : item.price)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Summary Sidebar */}
            <div className="lg:sticky lg:top-8 space-y-6">
              {/* Selected Items Summary */}
              <div className="p-6 border border-gray-800">
                <h3 className="text-sm font-bold uppercase tracking-tight mb-4 text-gray-400">
                  Summary
                </h3>
                {selectedCount === 0 ? (
                  <p className="text-gray-500 text-sm">No items selected</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {Object.values(selectedItems).map((item) => (
                      <div key={`${item.category}-${item.service}`} className="flex justify-between text-sm">
                        <span className="text-gray-400">
                          {item.service} {item.quantity > 1 && `×${item.quantity}`}
                        </span>
                        <span className="text-white">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Plan Selection */}
              <div className="p-6 border border-gray-800">
                <h3 className="text-sm font-bold uppercase tracking-tight mb-4 text-gray-400">
                  Payment Plan
                </h3>
                <div className="space-y-2">
                  {[
                    { value: '30-30-30' as PaymentPlan, label: 'Equal Thirds', desc: 'Default: 33.3% now, 33.3% on delivery, 33.3% within 30 days' },
                    { value: '100-upfront' as PaymentPlan, label: '100% Upfront', desc: 'Pay in full now' },
                    { value: '50-50' as PaymentPlan, label: '50/50 Split', desc: '50% now, 50% on delivery' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setPaymentPlan(option.value)}
                      className={`w-full p-3 border text-left transition-colors ${paymentPlan === option.value
                          ? 'border-white bg-white/5'
                          : 'border-gray-800 hover:border-gray-600'
                        }`}
                    >
                      <p className="text-sm font-bold">{option.label}</p>
                      <p className="text-xs text-gray-500">{option.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Breakdown */}
              {total > 0 && (
                <div className="p-6 border border-gray-800">
                  <h3 className="text-sm font-bold uppercase tracking-tight mb-4 text-gray-400">
                    Payment Schedule
                  </h3>
                  <div className="space-y-2">
                    {paymentBreakdown.map((payment, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <div>
                          <span className="text-white">{payment.label}</span>
                          <span className="text-gray-500 text-xs ml-2">({payment.when})</span>
                        </div>
                        <span className="font-bold">{formatPrice(payment.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lock In Button */}
              <button
                onClick={handleLockIn}
                disabled={selectedCount === 0}
                className={`w-full py-4 text-sm font-bold uppercase tracking-widest transition-colors ${selectedCount === 0
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'hover:opacity-80'
                  }`}
                style={selectedCount > 0 ? { backgroundColor: '#fff', color: '#000' } : undefined}
              >
                Lock In Deal
              </button>

              <p className="text-xs text-gray-500 text-center">
                By locking in, you agree to proceed with payment
              </p>
            </div>
          </div>

          {/* Back link */}
          <div className="mt-16 pt-8 border-t border-gray-800">
            <Link
              href={`/client/${slug}/project/${projectSlug}`}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
            >
              <FiArrowLeft size={14} />
              <span className="text-sm">Back to Project</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
