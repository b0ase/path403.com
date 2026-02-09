'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/Providers';
import { FiCpu, FiMessageSquare, FiDollarSign, FiActivity, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import AgentNav from '../nav';
import { useRouter } from 'next/navigation';

interface AnalyticsData {
    totalAgents: number;
    totalConversations: number;
    totalMessages: number;
    totalTokens: number;
    totalCost: number;
    dailyUsage: { date: string; conversations: number }[];
    topAgents: { id: string; name: string; conversations: number }[];
}

export default function AgentAnalyticsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push('/signin?redirect=/dashboard/agents/analytics');
            return;
        }
        loadData();
    }, [user, router]);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/agents/analytics');
            if (!response.ok) throw new Error('Failed to load analytics');
            const json = await response.json();
            setData(json);
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !data) {
        return (
            <div className="min-h-screen bg-black text-white px-4 md:px-8 py-16">
                <AgentNav />
                <div className="flex items-center justify-center h-64">
                    <FiActivity className="w-8 h-8 animate-spin" />
                </div>
            </div>
        );
    }

    // Calculate max value for charts
    const maxDailyconversations = Math.max(...data.dailyUsage.map(d => d.conversations), 1);

    return (
        <div className="min-h-screen bg-black text-white px-4 md:px-8 py-16">
            <AgentNav />

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <KpiCard
                    label="Total Agents"
                    value={data.totalAgents}
                    icon={FiCpu}
                />
                <KpiCard
                    label="Total Conversations"
                    value={data.totalConversations}
                    icon={FiMessageSquare}
                />
                <KpiCard
                    label="Total Tokens"
                    value={data.totalTokens.toLocaleString()}
                    icon={FiActivity}
                />
                <KpiCard
                    label="Total Cost"
                    value={`$${data.totalCost.toFixed(4)}`}
                    icon={FiDollarSign}
                />
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Usage Chart (Left 2 cols) */}
                <div className="md:col-span-2 bg-white/5 border border-white/20 rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-6">Conversation Volume (Last 7 Days)</h2>

                    <div className="flex items-end gap-2 h-64 pt-4">
                        {data.dailyUsage.map((day) => {
                            const heightPercent = (day.conversations / maxDailyconversations) * 100;
                            return (
                                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-full relative h-full flex items-end bg-white/5 rounded-t-sm group-hover:bg-white/10 transition-colors">
                                        <div
                                            style={{ height: `${heightPercent}%` }}
                                            className="w-full bg-blue-500/80 rounded-t-sm transition-all duration-500 relative group-hover:bg-blue-400"
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {day.conversations}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-white/40 font-mono rotate-45 origin-left translate-y-2 md:rotate-0 md:translate-y-0 md:text-center block w-full whitespace-nowrap overflow-hidden">
                                        {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Agents (Right 1 col) */}
                <div className="bg-white/5 border border-white/20 rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-6">Top Agents</h2>
                    <div className="space-y-4">
                        {data.topAgents.length === 0 ? (
                            <p className="text-white/40 text-sm">No usage data yet.</p>
                        ) : (
                            data.topAgents.map((agent, i) => (
                                <div key={agent.id} className="flex items-center justify-between border-b border-white/10 pb-2 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <span className="text-white/40 font-mono text-sm">#{i + 1}</span>
                                        <span className="font-medium">{agent.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">{agent.conversations}</p>
                                        <p className="text-xs text-white/40">convs</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function KpiCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: any }) {
    return (
        <div className="bg-white/5 border border-white/20 rounded-lg p-6">
            <div className="flex items-start justify-between mb-2">
                <p className="text-white/60 text-sm uppercase tracking-wider">{label}</p>
                <Icon className="w-5 h-5 text-white/40" />
            </div>
            <p className="text-3xl font-bold">{value}</p>
        </div>
    );
}
