'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPackage, FiClock, FiCheck, FiAlertCircle, FiArrowRight, FiCalendar, FiDollarSign } from 'react-icons/fi';
import Link from 'next/link';
import { useAuth } from '@/components/Providers';
import getSupabaseBrowserClient from '@/lib/supabase/client';
import { formatPrice } from '@/lib/pricing';

interface Order {
    id: string;
    order_number: string;
    created_at: string;
    payment_status: string;
    total_amount: number;
    base_price: number;
    elevated_price: number;
    deposit_amount: number;
    delivery_amount: number;
    final_amount: number;
    deposit_paid_at: string | null;
    delivery_paid_at: string | null;
    final_paid_at: string | null;
    estimated_delivery_date: string | null;
    actual_delivery_date: string | null;
    delivery_weeks_min: number;
    delivery_weeks_max: number;
    items: OrderItem[];
}

interface OrderItem {
    id: string;
    item_name: string;
    item_type: string;
    price: number;
    quantity: number;
}

export default function OrdersPage() {
    const { session } = useAuth();
    const supabase = getSupabaseBrowserClient();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    useEffect(() => {
        if (session?.user?.id) {
            loadOrders();
        }
    }, [session]);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const { data: ordersData, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    items:order_items(*)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(ordersData || []);
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
            case 'deposit_paid': return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
            case 'in_progress': return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
            case 'delivered': return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
            case 'completed': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
            case 'overdue': return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
            default: return 'text-zinc-400 border-zinc-500/30 bg-zinc-500/10';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'Awaiting Deposit';
            case 'deposit_paid': return 'Deposit Paid';
            case 'in_progress': return 'In Progress';
            case 'delivered': return 'Delivered';
            case 'completed': return 'Completed';
            case 'overdue': return 'Payment Overdue';
            default: return status;
        }
    };

    const getNextPayment = (order: Order) => {
        if (!order.deposit_paid_at) {
            return { type: 'Deposit', amount: order.deposit_amount, status: 'due' };
        }
        if (!order.delivery_paid_at) {
            return { type: 'Delivery', amount: order.delivery_amount, status: order.actual_delivery_date ? 'due' : 'pending' };
        }
        if (!order.final_paid_at) {
            return { type: 'Final', amount: order.final_amount, status: 'due' };
        }
        return null;
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (!session) {
        return (
            <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
                <div className="text-center">
                    <FiAlertCircle className="text-4xl text-zinc-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold mb-2">Please Sign In</h1>
                    <p className="text-zinc-400 mb-6">You need to be signed in to view your orders.</p>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 text-xs uppercase font-bold tracking-wider hover:bg-zinc-200"
                    >
                        Sign In
                        <FiArrowRight />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className="min-h-screen bg-black text-white font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            <div className="px-4 md:px-8 py-16 w-full">
                {/* Header */}
                <motion.div
                    className="mb-12 border-b border-zinc-900 pb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-4 border border-zinc-800 bg-zinc-950">
                            <FiPackage className="text-3xl text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">My Orders</h1>
                            <p className="text-zinc-500 text-sm">Track your projects and payment schedule</p>
                        </div>
                    </div>
                </motion.div>

                {/* Orders List */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full mx-auto mb-4" />
                        <p className="text-zinc-500">Loading orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <motion.div
                        className="text-center py-20 border border-dashed border-zinc-800"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <FiPackage className="text-4xl text-zinc-600 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2">No Orders Yet</h2>
                        <p className="text-zinc-500 mb-6">Start building your next project today.</p>
                        <Link
                            href="/components"
                            className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 text-xs uppercase font-bold tracking-wider hover:bg-zinc-200"
                        >
                            Browse Components
                            <FiArrowRight />
                        </Link>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order, index) => {
                            const nextPayment = getNextPayment(order);
                            const isExpanded = expandedOrder === order.id;

                            return (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="border border-zinc-800 bg-zinc-950"
                                >
                                    {/* Order Header */}
                                    <div
                                        className="p-6 cursor-pointer hover:bg-zinc-900/50 transition-colors"
                                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`px-3 py-1 text-xs uppercase font-bold border ${getStatusColor(order.payment_status)}`}>
                                                    {getStatusLabel(order.payment_status)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white">
                                                        Order #{order.order_number}
                                                    </div>
                                                    <div className="text-xs text-zinc-500">
                                                        {formatDate(order.created_at)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                {nextPayment && (
                                                    <div className="text-right">
                                                        <div className="text-xs text-zinc-500 uppercase tracking-widest">
                                                            Next: {nextPayment.type}
                                                        </div>
                                                        <div className="text-lg font-bold text-emerald-400">
                                                            {formatPrice(nextPayment.amount)}
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="text-right">
                                                    <div className="text-xs text-zinc-500 uppercase tracking-widest">Total</div>
                                                    <div className="text-lg font-bold text-white">
                                                        {formatPrice(order.elevated_price || order.total_amount)}
                                                    </div>
                                                </div>
                                                <FiArrowRight className={`text-zinc-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    {isExpanded && (
                                        <div className="border-t border-zinc-800 p-6 space-y-6">
                                            {/* Items */}
                                            <div>
                                                <h3 className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Order Items</h3>
                                                <div className="space-y-2">
                                                    {order.items?.map((item) => (
                                                        <div key={item.id} className="flex justify-between items-center p-3 bg-zinc-900 border border-zinc-800">
                                                            <div>
                                                                <div className="text-sm font-medium text-white">{item.item_name}</div>
                                                                <div className="text-xs text-zinc-500">{item.item_type} x {item.quantity}</div>
                                                            </div>
                                                            <div className="text-sm font-bold text-white">
                                                                {formatPrice(item.price * item.quantity)}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Payment Schedule */}
                                            <div>
                                                <h3 className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Payment Schedule</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {/* Deposit */}
                                                    <div className={`p-4 border ${order.deposit_paid_at ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-zinc-800 bg-zinc-900'}`}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-xs text-zinc-500 uppercase">Deposit</span>
                                                            {order.deposit_paid_at ? (
                                                                <FiCheck className="text-emerald-400" />
                                                            ) : (
                                                                <FiClock className="text-amber-400" />
                                                            )}
                                                        </div>
                                                        <div className="text-xl font-bold text-white mb-1">
                                                            {formatPrice(order.deposit_amount)}
                                                        </div>
                                                        <div className="text-xs text-zinc-500">
                                                            {order.deposit_paid_at ? `Paid ${formatDate(order.deposit_paid_at)}` : 'Due at order'}
                                                        </div>
                                                    </div>

                                                    {/* Delivery */}
                                                    <div className={`p-4 border ${order.delivery_paid_at ? 'border-blue-500/30 bg-blue-500/10' : 'border-zinc-800 bg-zinc-900'}`}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-xs text-zinc-500 uppercase">Delivery</span>
                                                            {order.delivery_paid_at ? (
                                                                <FiCheck className="text-blue-400" />
                                                            ) : (
                                                                <FiClock className="text-zinc-500" />
                                                            )}
                                                        </div>
                                                        <div className="text-xl font-bold text-white mb-1">
                                                            {formatPrice(order.delivery_amount)}
                                                        </div>
                                                        <div className="text-xs text-zinc-500">
                                                            {order.delivery_paid_at
                                                                ? `Paid ${formatDate(order.delivery_paid_at)}`
                                                                : order.estimated_delivery_date
                                                                    ? `Est. ${formatDate(order.estimated_delivery_date)}`
                                                                    : `${order.delivery_weeks_min}-${order.delivery_weeks_max} weeks`
                                                            }
                                                        </div>
                                                    </div>

                                                    {/* Final */}
                                                    <div className={`p-4 border ${order.final_paid_at ? 'border-purple-500/30 bg-purple-500/10' : 'border-zinc-800 bg-zinc-900'}`}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-xs text-zinc-500 uppercase">Final</span>
                                                            {order.final_paid_at ? (
                                                                <FiCheck className="text-purple-400" />
                                                            ) : (
                                                                <FiClock className="text-zinc-500" />
                                                            )}
                                                        </div>
                                                        <div className="text-xl font-bold text-white mb-1">
                                                            {formatPrice(order.final_amount)}
                                                        </div>
                                                        <div className="text-xs text-zinc-500">
                                                            {order.final_paid_at
                                                                ? `Paid ${formatDate(order.final_paid_at)}`
                                                                : '30 days after delivery'
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            {nextPayment && nextPayment.status === 'due' && (
                                                <div className="flex justify-end">
                                                    <Link
                                                        href={`/checkout/payment?order=${order.id}&type=${nextPayment.type.toLowerCase()}`}
                                                        className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 text-xs uppercase font-bold tracking-wider hover:bg-zinc-200"
                                                    >
                                                        <FiDollarSign />
                                                        Pay {nextPayment.type} - {formatPrice(nextPayment.amount)}
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Back Link */}
                <div className="mt-12">
                    <Link
                        href="/user/account"
                        className="text-zinc-500 hover:text-white text-sm flex items-center gap-2 transition-colors"
                    >
                        <FiArrowRight className="rotate-180" />
                        Back to Account
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
