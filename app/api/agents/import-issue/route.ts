
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GithubContractImportService } from '@/lib/github-contract-import';

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { repoOwner, repoName, issueNumber } = body;

        if (!repoOwner || !repoName || !issueNumber) {
            return NextResponse.json({ error: 'Missing required fields: repoOwner, repoName, issueNumber' }, { status: 400 });
        }

        const importer = new GithubContractImportService(user.id);
        const result = await importer.importIssueAsContract(repoOwner, repoName, issueNumber);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            tenderId: result.tenderId,
            contractId: result.contractId,
            message: 'Issue imported successfully as Funded Tender'
        });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
