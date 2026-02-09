import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// UK Companies House Form Types
type FormType = 'SH01' | 'CS01' | 'AR01';

interface SH01Data {
  companyNumber: string;
  companyName: string;
  dateOfAllotment: string;
  shareClass: string;
  numberOfShares: number;
  nominalValue: number;
  amountPaid: number;
  shareholders: Array<{
    name: string;
    address: string;
    sharesAllotted: number;
  }>;
}

interface CS01Data {
  companyNumber: string;
  companyName: string;
  registeredOffice: string;
  sicCodes: string[];
  statementOfCapital: {
    shareClass: string;
    prescribedParticulars: string;
    numberOfShares: number;
    totalNominalValue: number;
    totalAmountUnpaid: number;
  }[];
  shareholders: Array<{
    name: string;
    address: string;
    shareClass: string;
    numberOfShares: number;
  }>;
  directors: Array<{
    name: string;
    dateOfBirth: string;
    nationality: string;
    occupation: string;
    serviceAddress: string;
  }>;
  confirmationDate: string;
}

// Generate form data from cap table
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { formType, companyNumber, companyName, tokenId } = body;

    if (!formType || !companyName) {
      return NextResponse.json({ error: 'Form type and company name required' }, { status: 400 });
    }

    let formData: any = {};

    if (formType === 'SH01') {
      // Get shareholders from cap table
      const { data: shareholders } = await supabase
        .from('cap_table_shareholders')
        .select('*')
        .eq('token_id', tokenId)
        .order('ownership_percentage', { ascending: false });

      formData = {
        companyNumber: companyNumber || '',
        companyName,
        dateOfAllotment: new Date().toISOString().split('T')[0],
        shareClass: 'Ordinary',
        numberOfShares: shareholders?.reduce((sum, s) => sum + Number(s.token_balance || 0), 0) || 0,
        nominalValue: 0.001,
        amountPaid: 0.001,
        shareholders: shareholders?.map(s => ({
          name: s.full_name || 'Unknown',
          address: [s.address_line_1, s.city, s.postcode, s.country].filter(Boolean).join(', '),
          sharesAllotted: Number(s.token_balance || 0),
        })) || [],
      } as SH01Data;
    } else if (formType === 'CS01') {
      // Confirmation Statement
      const { data: shareholders } = await supabase
        .from('cap_table_shareholders')
        .select('*')
        .eq('token_id', tokenId);

      formData = {
        companyNumber: companyNumber || '',
        companyName,
        registeredOffice: '',
        sicCodes: ['62012'], // Computer programming activities
        statementOfCapital: [{
          shareClass: 'Ordinary',
          prescribedParticulars: 'Each share carries one vote',
          numberOfShares: shareholders?.reduce((sum, s) => sum + Number(s.token_balance || 0), 0) || 0,
          totalNominalValue: (shareholders?.reduce((sum, s) => sum + Number(s.token_balance || 0), 0) || 0) * 0.001,
          totalAmountUnpaid: 0,
        }],
        shareholders: shareholders?.map(s => ({
          name: s.full_name || 'Unknown',
          address: [s.address_line_1, s.city, s.postcode, s.country].filter(Boolean).join(', '),
          shareClass: s.share_class || 'Ordinary',
          numberOfShares: Number(s.token_balance || 0),
        })) || [],
        directors: [],
        confirmationDate: new Date().toISOString().split('T')[0],
      } as CS01Data;
    } else {
      return NextResponse.json({ error: 'Unsupported form type' }, { status: 400 });
    }

    // Save the form data
    const { data: filing, error: filingError } = await supabase
      .from('companies_house_filings')
      .insert({
        company_number: companyNumber,
        company_name: companyName,
        form_type: formType,
        form_data: formData,
        generated_by: user.id,
        status: 'draft',
      })
      .select()
      .single();

    if (filingError) {
      console.error('Error saving filing:', filingError);
      return NextResponse.json({ error: 'Failed to generate form' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      filing,
      formData,
      message: `${formType} form generated successfully`,
    });
  } catch (error: any) {
    console.error('Form generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get generated forms
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const companyNumber = searchParams.get('company');
    const formType = searchParams.get('type');

    let query = supabase
      .from('companies_house_filings')
      .select('*')
      .order('created_at', { ascending: false });

    if (companyNumber) {
      query = query.eq('company_number', companyNumber);
    }
    if (formType) {
      query = query.eq('form_type', formType);
    }

    const { data: filings, error } = await query;

    if (error) {
      console.error('Error fetching filings:', error);
      return NextResponse.json({ error: 'Failed to fetch filings' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      filings: filings || [],
    });
  } catch (error: any) {
    console.error('Get filings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
