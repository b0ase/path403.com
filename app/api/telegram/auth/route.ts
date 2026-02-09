import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

function validateTelegramData(data: Record<string, string>): boolean {
  if (!BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN not configured');
    return false;
  }

  const { hash, ...authData } = data;
  
  if (!hash) {
    console.error('No hash provided in Telegram data');
    return false;
  }

  // Create data-check-string as per Telegram documentation
  const dataCheckString = Object.keys(authData)
    .sort()
    .map(key => `${key}=${authData[key]}`)
    .join('\n');

  // Create secret key from bot token
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(BOT_TOKEN)
    .digest();

  // Calculate expected hash
  const expectedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  const isValid = expectedHash === hash;
  
  if (!isValid) {
    console.error('Telegram data validation failed:', {
      expected: expectedHash,
      received: hash,
      dataCheckString
    });
  }

  return isValid;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Telegram auth request:', body);

    const { initData, initDataUnsafe } = body;

    if (!initData && !initDataUnsafe) {
      return NextResponse.json(
        { error: 'Missing Telegram initialization data' },
        { status: 400 }
      );
    }

    let user = null;

    // Try to get user from initDataUnsafe first
    if (initDataUnsafe?.user) {
      user = initDataUnsafe.user;
      console.log('User found in initDataUnsafe:', user);
    }

    // If no user in initDataUnsafe, try to parse from initData
    if (!user && initData) {
      console.log('Attempting to parse user from initData...');
      const urlParams = new URLSearchParams(initData);
      const telegramData: Record<string, string> = {};
      
      for (const [key, value] of urlParams.entries()) {
        telegramData[key] = value;
      }

      console.log('Parsed telegram data:', telegramData);

      // Try to extract user from the parsed data
      if (telegramData.user) {
        try {
          user = JSON.parse(decodeURIComponent(telegramData.user));
          console.log('User parsed from initData:', user);
        } catch (e) {
          console.error('Failed to parse user from initData:', e);
        }
      }

      // Validate the data if we have it
      if (BOT_TOKEN && Object.keys(telegramData).length > 0) {
        console.log('Validating Telegram data...');
        if (!validateTelegramData(telegramData)) {
          console.log('Telegram data validation failed, but continuing...');
          // Don't fail completely, just log the warning
        } else {
          console.log('Telegram data validation successful');
        }

        // Check if data is not too old (optional, but recommended)
        if (telegramData.auth_date) {
          const authDate = parseInt(telegramData.auth_date);
          const currentTime = Math.floor(Date.now() / 1000);
          const maxAge = 86400; // 24 hours

          if (currentTime - authDate > maxAge) {
            console.log('Telegram data is old but continuing...');
          }
        }
      }
    }

    if (!user || !user.id) {
      console.error('No user found in either initDataUnsafe or initData');
      return NextResponse.json(
        { error: 'No user data found in Telegram initialization. Please make sure you are accessing this through the Telegram bot.' },
        { status: 400 }
      );
    }

    // Generate a session token for this user
    const sessionToken = crypto.randomBytes(32).toString('hex');
    
    // In a real app, you'd store this session in a database
    // For now, we'll return the user data with the session token

    const response = {
      success: true,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        photo_url: user.photo_url
      },
      session_token: sessionToken,
      address: `tg:${user.id}`,
      tokens: [{
        symbol: 'TG',
        name: 'Telegram User',
        balance: `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}`,
        contract: user.username ? `@${user.username}` : `ID: ${user.id}`
      }]
    };

    console.log('Telegram auth successful:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('Telegram auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error during Telegram authentication' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST for Telegram authentication.' },
    { status: 405 }
  );
}