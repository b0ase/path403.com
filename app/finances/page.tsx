'use client';

import React, { useState, useEffect, useCallback } from 'react';
import getSupabaseBrowserClient from '@/lib/supabase/client'; // Adjust path if needed
import { User } from '@supabase/supabase-js';
import { FaUniversity, FaBitcoin, FaExchangeAlt, FaPlusCircle, FaTable, FaChartPie, FaSpinner, FaGoogle } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Define interfaces for your financial data (replace with actual structure)
interface FinancialAccount {
  id: string; // UUID
  user_id: string; // UUID
  account_type: 'bank' | 'crypto_wallet' | 'credit_card' | 'investment' | 'loan' | 'cash' | 'other';
  name: string;
  provider_name?: string | null;
  account_details?: any | null; // JSONB - specific structure depends on account_type
  current_balance?: number | null;
  currency_code?: string | null;
  status?: 'active' | 'inactive' | 'needs_reauth' | 'closed' | 'pending_connection' | null;
  open_banking_item_id?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface TransactionCategory {
  id: string; // UUID
  user_id?: string | null; // UUID
  name: string;
  parent_category_id?: string | null; // UUID
  transaction_type: 'income' | 'expense' | 'transfer';
  icon_name?: string | null;
  color_hex?: string | null;
  is_system_default?: boolean;
}

interface Transaction {
  id: string; // UUID
  user_id: string; // UUID
  financial_account_id: string; // UUID
  transaction_category_id?: string | null; // UUID
  transaction_date: string; // DATE (YYYY-MM-DD)
  description: string;
  amount: number; // NUMERIC
  currency_code: string;
  merchant_name?: string | null;
  status?: 'pending' | 'cleared' | 'cancelled' | 'disputed' | null;
  notes?: string | null;
  is_recurring?: boolean;
  source_data?: any | null; // JSONB
  created_at?: string;
  updated_at?: string;
  // For display purposes, we might join category name
  category_name?: string | null;
  account_name?: string | null; // from financial_accounts
}

// Placeholder for calculated spending data
interface SpendingByCategoryItem {
  category_id: string;
  category_name: string;
  amount: number;
  percentage: number;
  color_hex?: string | null;
  icon_name?: string | null;
}

export default function FinancesPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // State for actual financial data
  const [financialAccounts, setFinancialAccounts] = useState<FinancialAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionCategories, setTransactionCategories] = useState<TransactionCategory[]>([]);
  const [spendingByCategory, setSpendingByCategory] = useState<SpendingByCategoryItem[]>([]); 

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // ADD: State for Boase Trust module visibility
  const [canUserAccessTrustModule, setCanUserAccessTrustModule] = useState(false);

  // State for Open Banking connection process
  const [isConnectingBank, setIsConnectingBank] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(''); // e.g., 'Initializing...', 'Provider Loaded', 'Error'

  // ADD: State for Google Auth status messages
  const [googleAuthMessage, setGoogleAuthMessage] = useState<string | null>(null);
  const [googleAuthError, setGoogleAuthError] = useState<string | null>(null);

  // ADD: useEffect to read Google Auth status from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const authStatus = searchParams.get('google_auth_status');
    const authError = searchParams.get('error'); // General error param
    const authMessage = searchParams.get('message'); // Specific message for Google errors

    if (authStatus === 'success') {
      setGoogleAuthMessage('Successfully connected your Google account!');
      setGoogleAuthError(null);
      // Clean up URL params
      router.replace('/finances', { scroll: false });
    } else if (authError && authError.startsWith('google_')) {
      setGoogleAuthError(authMessage || 'An error occurred with Google authentication.');
      setGoogleAuthMessage(null);
      // Clean up URL params
      router.replace('/finances', { scroll: false });
    }
  }, [router]);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      setLoadingUser(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      } else {
        console.log('No user session found on finances page, redirecting to login.');
        router.push('/login?redirectedFrom=/finances');
      }
      setLoadingUser(false);
    };
    getUser();
  }, [supabase, router]);

  // --- DATA FETCHING FUNCTIONS (to be implemented) ---
  const fetchAllFinancialData = useCallback(async (userId: string) => {
    if (!userId) return;
    setIsLoadingData(true);
    setDataError(null);
    try {
      console.log(`Fetching all financial data for user: ${userId}`);

      // Define the select string for transactions carefully - SIMPLIFIED (NO JOINS)
      const transactionSelect = '*'; // Select all direct columns from transactions table

      const promiseResults = await Promise.all([
        supabase.from('financial_accounts').select('*').eq('user_id', userId).order('name'),
        supabase.from('transactions').select(transactionSelect).eq('user_id', userId).order('transaction_date', { ascending: false }),
        supabase.from('transaction_categories').select('*').or(`user_id.eq.${userId},is_system_default.eq.true`).order('name')
      ]);

      const accountsResponse = promiseResults[0] as { data: FinancialAccount[] | null; error: any | null };
      // SIMPLIFIED: transactionsResponse type no longer expects nested financial_account or transaction_category
      const transactionsResponse = promiseResults[1] as { data: Omit<Transaction, 'account_name' | 'category_name' | 'category_icon' | 'category_color'>[] | null; error: any | null };
      const categoriesResponse = promiseResults[2] as { data: TransactionCategory[] | null; error: any | null };

      if (accountsResponse.error) throw accountsResponse.error;
      if (transactionsResponse.error) throw transactionsResponse.error;
      if (categoriesResponse.error) throw categoriesResponse.error;

      const fetchedAccounts = accountsResponse.data || [];
      const fetchedCategories = categoriesResponse.data || [];
      setFinancialAccounts(fetchedAccounts);
      setTransactionCategories(fetchedCategories);
      
      const processedTransactions = (transactionsResponse.data || []).map(tx => {
        // Find account name from fetchedAccounts (can be slow for many transactions, consider optimizing later if needed)
        const account = fetchedAccounts.find(acc => acc.id === tx.financial_account_id);
        // Find category name from fetchedCategories
        const category = fetchedCategories.find(cat => cat.id === tx.transaction_category_id);

        return {
          ...tx,
          account_name: account?.name || 'N/A',
          category_name: category?.name || 'Uncategorized',
          category_icon: category?.icon_name,
          category_color: category?.color_hex,
        } as Transaction; // Cast to final Transaction type
      });
      setTransactions(processedTransactions);

      // TODO: Calculate spending by category from processedTransactions and categoriesResponse.data
      setSpendingByCategory([]); 

    } catch (error: any) {
      console.error('Error fetching financial data:', error);
      setDataError(`Failed to load financial data: ${error.message}`);
      // Clear data on error to avoid showing stale info
      setFinancialAccounts([]);
      setTransactions([]);
      setTransactionCategories([]);
      setSpendingByCategory([]);
    } finally {
      setIsLoadingData(false);
    }
  }, [supabase]);

  const fetchTrustAccessPermission = useCallback(async (userId: string) => {
    if (!userId) return;
    try {
      console.log(`Checking trust access for user: ${userId} (DEBUGGING 406 ERROR)`);
      const { data, error, status } = await supabase
        .from('user_trust_access')
        .select('*') // DEBUG: Changed from 'can_access_trust_module' to '*'.
        .eq('user_id', userId)
        .maybeSingle(); // Using maybeSingle() as user might not have an entry, which is fine.

      console.log('Trust access response:', { data, error, status });

      if (error && error.code !== 'PGRST116') { // PGRST116: single row expected, but 0 rows found (no explicit grant/deny for this user)
        console.error('Supabase error fetching trust access (code != PGRST116):', error);
        throw error;
      }
      
      if (data?.can_access_trust_module) {
        setCanUserAccessTrustModule(true);
      } else {
        setCanUserAccessTrustModule(false); // Default to false if no record, explicitly false, or column not present after select('*')
      }
    } catch (error: any) {
      console.error('Error fetching trust access permission (catch block):', error.message);
      setCanUserAccessTrustModule(false); // Default to no access on error
    }
  }, [supabase]);

  useEffect(() => {
    if (user?.id) {
      fetchAllFinancialData(user.id);
      fetchTrustAccessPermission(user.id);
    }
  }, [user, fetchAllFinancialData, fetchTrustAccessPermission]);

  const handleConnectNewBankAccount = async () => {
    setIsConnectingBank(true);
    setConnectionStatus('Initializing connection with Open Banking provider...');
    try {
      const response = await fetch('/api/openbanking/initiate-link', { method: 'POST' });
      if (!response.ok) throw new Error(`Failed to initiate link: ${response.statusText}`);
      const data = await response.json();
      if (data.link_token) {
        setConnectionStatus(`Link token received. Provider SDK would open now with token: ${data.link_token}`);
        console.log('Mock: Plaid Link would open here with token:', data.link_token);
        setTimeout(() => {
          setConnectionStatus('Simulating successful bank connection! Public token would be sent to backend.');
          setIsConnectingBank(false);
        }, 5000);
      } else {
        throw new Error(data.error || 'Failed to get link_token from backend.');
      }
    } catch (err: any) {
      console.error('Open Banking connection error:', err);
      setConnectionStatus(`Error: ${err.message || 'Could not connect to Open Banking provider.'}`);
      setIsConnectingBank(false);
    }
  };

  // ADD: Function to handle Google OAuth redirection
  const handleGoogleAuthRedirect = () => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      console.error('Google Client ID not found. Make sure NEXT_PUBLIC_GOOGLE_CLIENT_ID is set.');
      setGoogleAuthError('Configuration error: Google Client ID is missing.');
      return;
    }

    const redirectUri = `${window.location.origin}/api/auth/google/callback`;

    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/drive.file'
    ];

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', googleClientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', scopes.join(' '));
    authUrl.searchParams.append('access_type', 'offline'); // Important to get a refresh token
    authUrl.searchParams.append('prompt', 'consent'); // Forces consent screen, useful for dev/testing
    // authUrl.searchParams.append('state', 'YOUR_CSRF_TOKEN_HERE'); // Optional: for CSRF protection

    window.location.href = authUrl.toString();
  };

  // ADD: Placeholder for actual export function, to be called after auth
  const handleExportToGoogleSheets = async () => {
    setGoogleAuthMessage('Attempting to export transactions...');
    setGoogleAuthError(null);
    try {
      const response = await fetch('/api/google/export-transactions', { method: 'POST' });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to export: ${response.statusText}`);
      }
      setGoogleAuthMessage(`Export successful! View your sheet: ${result.spreadsheetUrl}`);
      console.log('Export result:', result);
    } catch (err: any) {
      console.error('Error exporting to Google Sheets:', err);
      setGoogleAuthError(err.message || 'Could not export transactions.');
      setGoogleAuthMessage(null);
    }
  };

  if (loadingUser || (user && isLoadingData)) { // Show loading if user is loading OR if user is loaded but data is still loading
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 text-gray-300 flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-sky-500" />
        <p className="ml-3 text-xl">{loadingUser ? 'Loading user data...' : 'Loading financial data...'}</p>
      </div>
    );
  }
  
  if (!user && !loadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 text-gray-300 flex flex-col items-center justify-center">
        <p className="text-xl mb-4">You need to be logged in to view your finances.</p>
        <Link href="/login?redirectedFrom=/finances" className="text-sky-400 hover:text-sky-300">
          Go to Login
        </Link>
      </div>
    );
  }

  // Filter accounts for display
  const bankAndCardAccounts = financialAccounts.filter(acc => acc.account_type === 'bank' || acc.account_type === 'credit_card');
  const cryptoAccounts = financialAccounts.filter(acc => acc.account_type === 'crypto_wallet');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950 text-gray-300 flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-12 md:py-16">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Financial Dashboard</h1>
          {/* Logout button is in UserSidebar, no need for one here anymore */}
        </div>
        
        {dataError && <p className="text-red-400 bg-red-900/30 p-3 rounded-md mb-6 text-center">{dataError}</p>}

        {/* ADD: Display Google Auth Messages */}
        {googleAuthMessage && (
          <div className="p-3 mb-6 text-sm rounded-md bg-green-900 border border-green-700 text-green-300">
            {googleAuthMessage}
          </div>
        )}
        {googleAuthError && (
          <div className="p-3 mb-6 text-sm rounded-md bg-red-900 border border-red-700 text-red-300">
            {googleAuthError}
          </div>
        )}

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6 border-b border-gray-700 pb-3">Account Connections</h2>
          <div className="mb-8 p-6 bg-gray-900 border border-gray-800 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium text-blue-400 flex items-center"><FaUniversity className="mr-3" /> Bank Accounts & Cards</h3>
              <button 
                onClick={handleConnectNewBankAccount}
                disabled={isConnectingBank}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-sm font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed rounded-md shadow-sm"
              >
                {isConnectingBank ? <FaSpinner className="animate-spin mr-2" /> : <FaPlusCircle className="mr-2" />} 
                {isConnectingBank ? 'Connecting...' : 'Connect New Account'}
              </button>
            </div>
            {connectionStatus && (
              <div className={`p-3 mb-4 text-sm rounded-md ${connectionStatus.startsWith('Error:') ? 'bg-red-900 border border-red-700 text-red-300' : 'bg-blue-900 border border-blue-700 text-blue-300'}`}>
                {connectionStatus}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {bankAndCardAccounts.length > 0 ? (
                bankAndCardAccounts.map(acc => (
                  <div key={acc.id} className="p-4 bg-gray-800 border border-gray-700">
                    <p className="font-semibold text-white">{acc.name}</p>
                    <p className="text-lg text-gray-300">{acc.current_balance?.toLocaleString(undefined, { style: 'currency', currency: acc.currency_code || 'USD' }) || 'N/A'}</p>
                    <p className={`text-xs ${acc.status === 'active' ? 'text-green-400' : 'text-yellow-400'}`}>{acc.status || 'Unknown'}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 md:col-span-2 lg:col-span-4 italic">No bank or card accounts linked yet.</p>
              )}
            </div>
            {/* ADD: Google Sheets Connection & Export Button */}
            <div className="mt-6 border-t border-gray-800 pt-6">
              <h4 className="text-lg font-medium text-sky-400 mb-3 flex items-center">
                <FaGoogle className="mr-2" /> Google Sheets Integration
              </h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={handleGoogleAuthRedirect}
                  className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 text-sm font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed rounded-md shadow-sm w-full sm:w-auto"
                >
                  <FaGoogle className="mr-2" /> Connect Google Account
                </button>
                <button 
                  onClick={handleExportToGoogleSheets} // This will call the backend export route
                  className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 text-sm font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed rounded-md shadow-sm w-full sm:w-auto"
                  // TODO: Potentially disable this button if Google account is not yet connected/tokens not available
                >
                  <FaTable className="mr-2" /> Export Transactions to Sheet
                </button>
              </div>
            </div>
          </div>

          <div className="mb-8 p-6 bg-gray-900 border border-gray-800 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium text-yellow-400 flex items-center"><FaBitcoin className="mr-3" /> Cryptocurrency Wallets</h3>
              {/* TODO: Add wallet functionality */}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {cryptoAccounts.length > 0 ? (
                cryptoAccounts.map(wallet => (
                  <div key={wallet.id} className="p-4 bg-gray-800 border border-gray-700">
                    <p className="font-semibold text-white">{wallet.name}</p>
                    <p className="text-xs text-gray-500 truncate">{(wallet.account_details as any)?.address || 'No address'}</p> {/* Example accessing nested detail */}
                    <p className="text-lg text-gray-300">{wallet.current_balance} {wallet.currency_code}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 md:col-span-2 italic">No crypto wallets added yet.</p>
              )}
            </div>
            <div className="flex">
                {/* TODO: Implement add wallet form */}
                <input type="text" placeholder="Enter Wallet Address (e.g., ETH, BTC)" className="flex-grow px-3 py-2 bg-gray-800 border border-gray-600 text-gray-200 focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 outline-none mr-2" />
                <button className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 text-sm font-medium flex items-center"><FaPlusCircle className="mr-2" /> Add Wallet</button>
            </div>
          </div>
        </section>

        {canUserAccessTrustModule && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-6 border-b border-gray-700 pb-3">Other Financial Interests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/trust" className="block p-6 bg-gray-800 hover:bg-gray-700 border border-gray-700 shadow-lg rounded-md transition-colors">
                <h3 className="text-xl font-medium text-green-400 mb-2">The Boase Trust</h3>
                <p className="text-sm text-gray-400">
                  Access documents, asset ledger, and balance sheet for The Boase Trust.
                </p>
              </Link>
            </div>
          </section>
        )}

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6 border-b border-gray-700 pb-3 flex items-center"><FaTable className="mr-3" /> Recent Transactions</h2>
          <div className="bg-gray-900 p-6 border border-gray-800 shadow-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Account</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800/50 divide-y divide-gray-700/50">
                  {transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{new Date(tx.transaction_date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-200">{tx.description}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">{tx.category_name || 'N/A'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">{tx.account_name || 'N/A'}</td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm text-right ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {tx.amount.toLocaleString(undefined, { style: 'currency', currency: tx.currency_code || 'USD' })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-gray-500 italic">No transactions recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6 border-b border-gray-700 pb-3 flex items-center"><FaChartPie className="mr-3" /> Spending by Category</h2>
          <div className="bg-gray-900 p-6 border border-gray-800 shadow-lg">
            {spendingByCategory.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {/* TODO: Better visualization for spending categories */}
                {spendingByCategory.map(item => (
                  <li key={item.category_id} className="flex justify-between text-sm">
                    <span className="text-gray-300">{item.category_name}</span>
                    <span className="text-gray-400">{item.amount.toLocaleString(undefined, {style: 'currency', currency: 'USD'})} ({item.percentage.toFixed(1)}%)</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No spending data to categorize yet. Add some transactions!</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
} 