import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

// Generate share certificate PDF data
// In production, this would use a PDF library like jspdf or puppeteer
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { certificateId } = body;

    if (!certificateId) {
      return NextResponse.json({ error: 'Certificate ID required' }, { status: 400 });
    }

    // Get certificate details
    const { data: certificate, error: certError } = await supabase
      .from('certificates')
      .select('*')
      .eq('id', certificateId)
      .single();

    if (certError || !certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    // Generate certificate content for hash
    const certificateContent = {
      serialNumber: certificate.serial_number,
      companyName: certificate.company_name || 'Company',
      shareholderName: certificate.shareholder_name,
      shareClass: certificate.share_class,
      numberOfShares: certificate.share_amount,
      issueDate: certificate.created_at,
      certificateId: certificate.id,
    };

    const contentHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(certificateContent))
      .digest('hex');

    // In production, generate actual PDF here using:
    // - jspdf for client-side generation
    // - puppeteer for server-side HTML to PDF
    // - @react-pdf/renderer for React-based PDFs

    // For now, return certificate data that can be rendered as PDF on client
    const pdfData = {
      title: 'SHARE CERTIFICATE',
      certificateNumber: certificate.serial_number,
      company: {
        name: certificate.company_name || 'Company Name',
        registrationNumber: certificate.company_number || '',
        registeredOffice: '',
      },
      shareholder: {
        name: certificate.shareholder_name,
        address: '',
      },
      shares: {
        class: certificate.share_class || 'Ordinary',
        number: certificate.share_amount,
        nominalValue: '£0.001',
        totalValue: `£${(Number(certificate.share_amount) * 0.001).toFixed(2)}`,
      },
      issueDate: new Date(certificate.created_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      director: {
        name: certificate.director_signature || 'Director',
        signature: '[Signed electronically]',
      },
      verification: {
        hash: contentHash,
        verifyUrl: `https://b0ase.com/tools/bit-certificates/verify/${certificate.id}`,
      },
    };

    // Record the generation
    const { data: generation, error: genError } = await supabase
      .from('share_certificate_generations')
      .insert({
        certificate_id: certificateId,
        pdf_hash: contentHash,
        template_version: 'v1',
        generated_by: user.id,
      })
      .select()
      .single();

    // Update certificate with hash
    await supabase
      .from('certificates')
      .update({ pdf_hash: contentHash })
      .eq('id', certificateId);

    return NextResponse.json({
      success: true,
      pdfData,
      contentHash,
      generationId: generation?.id,
      message: 'Certificate PDF data generated',
      // In production, would return: pdfUrl: 'https://...'
    });
  } catch (error: any) {
    console.error('Certificate generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get certificate PDF data
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const certificateId = searchParams.get('id');

    if (!certificateId) {
      return NextResponse.json({ error: 'Certificate ID required' }, { status: 400 });
    }

    // Get certificate with generation info
    const { data: certificate, error } = await supabase
      .from('certificates')
      .select(`
        *,
        share_certificate_generations (
          id,
          pdf_url,
          pdf_hash,
          template_version,
          inscription_txid,
          inscription_url,
          generated_at
        )
      `)
      .eq('id', certificateId)
      .single();

    if (error || !certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      certificate,
    });
  } catch (error: any) {
    console.error('Get certificate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
