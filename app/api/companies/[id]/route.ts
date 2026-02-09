import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// DELETE /api/companies/[id] - Delete a company
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // First verify the company belongs to this user
        const { data: company, error: fetchError } = await supabase
            .from('companies')
            .select('id, user_id')
            .eq('id', id)
            .single();

        if (fetchError || !company) {
            return NextResponse.json({ error: 'Company not found' }, { status: 404 });
        }

        if (company.user_id !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Delete the company (cascade will handle related tokens and cap table entries)
        const { error: deleteError } = await supabase
            .from('companies')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('Error deleting company:', deleteError);
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Companies DELETE error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
