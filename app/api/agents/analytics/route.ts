import { createClient } from '../../../../lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error('Auth Error:', authError);
            return NextResponse.json({ error: 'Unauthorized', details: authError }, { status: 401 });
        }

        // 1. Get Summary Stats
        const { data: agents, error: agentsError } = await supabase
            .from('agents')
            .select('id, name')
            .eq('user_id', user.id);

        if (agentsError) throw agentsError;

        const agentIds = agents.map(a => a.id);
        const totalAgents = agents.length;

        if (totalAgents === 0) {
            return NextResponse.json({
                totalAgents: 0,
                totalConversations: 0,
                totalMessages: 0,
                totalTokens: 0,
                totalCost: 0,
                dailyUsage: [],
                topAgents: []
            });
        }

        // 2. Get Conversations Count
        // Use exact count for performance
        const { count: totalConversations, error: convError } = await supabase
            .from('agent_conversations')
            .select('*', { count: 'exact', head: true })
            .in('agent_id', agentIds);

        if (convError) throw convError;

        // 3. Get Messages Stats (Tokens & Cost)
        // We need to match messages to conversations owned by this user
        // Since we have agent IDs, we can filter conversations first, but easier if we select via join logic or just query messages table if it has agent data (it has conversation_id)

        // Fetch conversations first to get IDs
        const { data: conversations } = await supabase
            .from('agent_conversations')
            .select('id, agent_id, created_at')
            .in('agent_id', agentIds);

        const conversationIds = conversations?.map(c => c.id) || [];

        let totalTokens = 0;
        let totalCost = 0;
        let totalMessages = 0;

        if (conversationIds.length > 0) {
            const { data: messages, error: msgError } = await supabase
                .from('conversation_messages')
                .select('tokens_used, cost_usd')
                .in('conversation_id', conversationIds);

            if (msgError) throw msgError;

            totalMessages = messages.length;
            totalTokens = messages.reduce((sum, msg) => sum + (msg.tokens_used || 0), 0);
            totalCost = messages.reduce((sum, msg) => sum + (msg.cost_usd || 0), 0);
        }

        // 4. Calculate Daily Usage (last 7 days)
        const dailyUsageMap = new Map<string, number>();
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            dailyUsageMap.set(dateStr, 0);
        }

        conversations?.forEach(c => {
            const dateStr = new Date(c.created_at).toISOString().split('T')[0];
            if (dailyUsageMap.has(dateStr)) {
                dailyUsageMap.set(dateStr, (dailyUsageMap.get(dateStr) || 0) + 1);
            }
        });

        const dailyUsage = Array.from(dailyUsageMap.entries()).map(([date, count]) => ({
            date,
            conversations: count
        }));

        // 5. Top Agents
        const agentUsage = new Map<string, number>();
        conversations?.forEach(c => {
            agentUsage.set(c.agent_id, (agentUsage.get(c.agent_id) || 0) + 1);
        });

        const topAgents = agents.map(a => ({
            id: a.id,
            name: a.name,
            conversations: agentUsage.get(a.id) || 0
        })).sort((a, b) => b.conversations - a.conversations).slice(0, 5);

        return NextResponse.json({
            totalAgents,
            totalConversations: totalConversations || 0,
            totalMessages,
            totalTokens,
            totalCost,
            dailyUsage,
            topAgents
        });

    } catch (error: any) {
        console.error('Analytics Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
