'use client';

import React, { useState, useEffect, useCallback } from 'react';
import getSupabaseBrowserClient from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { FiDollarSign, FiCreditCard, FiTrendingUp, FiTrendingDown, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface FinancialAccount {
    id: string;
    user_id: string;
    account_type: string;
    name: string;
    provider_name?: string | null;
    current_balance?: number | null;
    currency_code?: string | null;
    status?: string | null;
}

interface Transaction {
    id: string;
    transaction_date: string;
    description: string;
    amount: number;
    currency_code: string;
    category_name?: string | null;
    account_name?: string | null;
}

export default function UserFinancesPage() {
    const supabase = getSupabaseBrowserClient();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [financialAccounts, setFinancialAccounts] = useState<FinancialAccount[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getUser = async () => {
            setLoadingUser(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
            } else {
                router.push('/login?redirectedFrom=/user/account/finances');
            }
            setLoadingUser(false);
        };
        getUser();
    }, [supabase, router]);

    const fetchAllFinancialData = useCallback(async (userId: string) => {
        if (!userId) return;
        setIsLoadingData(true);
        setError(null);
        try {
            const [accountsRes, transactionsRes, categoriesRes] = await Promise.all([
                supabase.from('financial_accounts').select('*').eq('user_id', userId).order('name'),
                supabase.from('transactions').select('*').eq('user_id', userId).order('transaction_date', { ascending: false }).limit(10),
                supabase.from('transaction_categories').select('*').or(`user_id.eq.${userId},is_system_default.eq.true`)
            ]);

            if (accountsRes.error) throw accountsRes.error;
            if (transactionsRes.error) throw transactionsRes.error;

            const accounts = accountsRes.data || [];
            const categories = categoriesRes.data || [];
            setFinancialAccounts(accounts);

            const processedTx = (transactionsRes.data || []).map(tx => {
                const account = accounts.find(a => a.id === tx.financial_account_id);
                const category = categories.find(c => c.id === tx.transaction_category_id);
                return {
                    ...tx,
                    account_name: account?.name || 'N/A',
                    category_name: category?.name || 'Uncategorized',
                };
            });
            setTransactions(processedTx);
        } catch (err: any) {
            console.error('Error fetching financial data:', err);
            setError(err.message);
        } finally {
            setIsLoadingData(false);
        }
    }, [supabase]);

    useEffect(() => {
        if (user?.id) {
            fetchAllFinancialData(user.id);
        }
    }, [user, fetchAllFinancialData]);

    if (loadingUser) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white font-mono text-sm">LOADING FINANCES...</div>
            </div>
        );
    }

    const totalBalance = financialAccounts.reduce((sum, acc) => sum + (acc.current_balance || 0), 0);
    const totalIncome = transactions.filter(tx => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0);
    const totalExpenses = transactions.filter(tx => tx.amount < 0).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    return (
        <div className="min-h-screen bg-black text-white font-mono">
            <div className="w-full px-8 py-8">
                {/* Header */}
                <header className="mb-12">
                    <div className="flex items-center gap-4 mb-6">
                        <Link href="/user/account" className="text-gray-500 hover:text-white transition-colors">
                            <FiArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">MY FINANCES</h1>
                            <p className="text-sm text-gray-500">ACCOUNTS & TRANSACTIONS</p>
                        </div>
                    </div>
                </header>

                {error && <div className="mb-6 p-3 border border-red-900 text-red-400 text-sm">{error}</div>}

                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <div className="border border-gray-900 p-4">
                        <p className="text-xs text-gray-500 mb-1">TOTAL BALANCE</p>
                        <p className="text-2xl font-bold">${totalBalance.toFixed(2)}</p>
                    </div>
                    <div className="border border-gray-900 p-4">
                        <p className="text-xs text-gray-500 mb-1">INCOME</p>
                        <p className="text-2xl font-bold text-green-400">${totalIncome.toFixed(2)}</p>
                    </div>
                    <div className="border border-gray-900 p-4">
                        <p className="text-xs text-gray-500 mb-1">EXPENSES</p>
                        <p className="text-2xl font-bold text-red-400">${totalExpenses.toFixed(2)}</p>
                    </div>
                    <div className="border border-gray-900 p-4">
                        <p className="text-xs text-gray-500 mb-1">ACCOUNTS</p>
                        <p className="text-2xl font-bold">{financialAccounts.length}</p>
                    </div>
                </div>

                {/* Accounts */}
                <div className="mb-12">
                    <h2 className="text-sm text-gray-500 mb-4">ACCOUNTS</h2>
                    {isLoadingData ? (
                        <p className="text-gray-600 text-sm">LOADING...</p>
                    ) : financialAccounts.length > 0 ? (
                        <div className="space-y-2">
                            {financialAccounts.map(account => (
                                <div key={account.id} className="flex items-center justify-between p-4 border border-gray-900">
                                    <div className="flex items-center gap-4">
                                        <FiCreditCard className="text-gray-500" size={16} />
                                        <div>
                                            <p className="text-white">{account.name.toUpperCase()}</p>
                                            <p className="text-xs text-gray-500">{account.provider_name || account.account_type}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-bold">${(account.current_balance || 0).toFixed(2)}</p>
                                        <p className="text-xs text-gray-500">{account.currency_code || 'USD'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 border border-gray-900">
                            <FiDollarSign className="mx-auto text-3xl text-gray-600 mb-3" />
                            <p className="text-gray-500 text-sm">NO ACCOUNTS CONNECTED</p>
                        </div>
                    )}
                </div>

                {/* Recent Transactions */}
                <div>
                    <h2 className="text-sm text-gray-500 mb-4">RECENT TRANSACTIONS</h2>
                    {isLoadingData ? (
                        <p className="text-gray-600 text-sm">LOADING...</p>
                    ) : transactions.length > 0 ? (
                        <div className="space-y-2">
                            {transactions.map(tx => (
                                <div key={tx.id} className="flex items-center justify-between p-4 border border-gray-900">
                                    <div className="flex items-center gap-4">
                                        {tx.amount > 0 ? (
                                            <FiTrendingUp className="text-green-400" size={14} />
                                        ) : (
                                            <FiTrendingDown className="text-red-400" size={14} />
                                        )}
                                        <div>
                                            <p className="text-white">{tx.description}</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(tx.transaction_date).toLocaleDateString()} • {tx.category_name}
                                            </p>
                                        </div>
                                    </div>
                                    <p className={`font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 border border-gray-900">
                            <FiDollarSign className="mx-auto text-3xl text-gray-600 mb-3" />
                            <p className="text-gray-500 text-sm">NO TRANSACTIONS</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
