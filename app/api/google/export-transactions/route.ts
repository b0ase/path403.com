import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { google } from 'googleapis';

// This will handle the request to export transactions to Google Sheets.
// For now, it will just log the request and return a placeholder response.

export async function POST(request: NextRequest) {
  console.log('Export Transactions to Google Sheets - POST request received');
  const supabase = await createClient();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    console.error('Error getting session or no session found for export:', sessionError);
    return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
  }

  const userId = session.user.id;
  console.log('User ID for export:', userId);

  // TODO: Retrieve user's Google OAuth tokens (access_token, refresh_token) from your database (e.g., Supabase)
  // If refresh_token exists, use it to get a new access_token if the current one is expired.
  // If no tokens, the user needs to go through the OAuth flow first.

  // For now, let's assume we have the tokens (placeholder)
  const GOOGLE_ACCESS_TOKEN = 'USER_ACCESS_TOKEN_PLACEHOLDER'; // This needs to be fetched
  const GOOGLE_REFRESH_TOKEN = 'USER_REFRESH_TOKEN_PLACEHOLDER'; // This needs to be fetched

  if (!GOOGLE_ACCESS_TOKEN) {
    // This would ideally trigger the auth flow on the client-side or inform the user.
    return NextResponse.json({ error: 'Google authentication required. Please connect your Google account.' }, { status: 403 });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    // The redirect URI used during the initial auth flow. 
    // It's not strictly needed here for API calls if tokens are already obtained,
    // but good practice to have it align with your Google Cloud Console setup.
    process.env.NODE_ENV === 'production' ? 'https://b0ase.com/api/auth/google/callback' : `http://localhost:${process.env.PORT || 3000}/api/auth/google/callback`
  );

  oauth2Client.setCredentials({
    access_token: GOOGLE_ACCESS_TOKEN,
    refresh_token: GOOGLE_REFRESH_TOKEN, // Optional: if you have it and want the library to handle auto-refresh
  });

  const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

  try {
    // TODO: Fetch actual transactions from Supabase for this user
    const transactionsData = [
      ['Date', 'Description', 'Category', 'Amount'],
      ['2024-01-15', 'Coffee Shop', 'Food', -5.00],
      ['2024-01-16', 'Salary', 'Income', 2000.00],
    ];

    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: `b0ase Financial Transactions - ${new Date().toISOString()}`,
        },
      },
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId;
    if (!spreadsheetId) {
      throw new Error('Failed to create spreadsheet');
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Sheet1!A1', // Or a more dynamic sheet name
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: transactionsData,
      },
    });

    console.log('Spreadsheet created and data updated:', spreadsheet.data.spreadsheetUrl);
    return NextResponse.json({
      message: 'Transactions exported successfully!',
      spreadsheetUrl: spreadsheet.data.spreadsheetUrl,
      spreadsheetId: spreadsheetId,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error exporting to Google Sheets:', error.message);
    // Handle token expiration or other API errors
    if (error.response?.data?.error === 'invalid_grant') {
        // This means the refresh token is invalid or expired, or access token issues.
        // User might need to re-authenticate.
        return NextResponse.json({ error: 'Google authentication error. Please try reconnecting your Google account.', details: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to export transactions.', details: error.message }, { status: 500 });
  }
} 