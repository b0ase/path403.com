import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    if (!url.startsWith('https://www.fiverr.com/')) {
      return NextResponse.json({ error: 'Invalid Fiverr URL' }, { status: 400 });
    }

    console.log(`Attempting to scrape URL: ${url}`);

    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    const $ = cheerio.load(html);

    let gigTitle = $('h1[data-impression-id="main_title"]').first().text().trim();
    if (!gigTitle) gigTitle = $('.gig-title h1').first().text().trim(); 
    if (!gigTitle) gigTitle = $('h1').first().text().trim(); // Most generic fallback for title

    // Refined Seller Name Selectors
    let sellerName = $('div[data-testid="seller-sidebar-card-user-info"] a[data-testid="seller-info-username"] strong').first().text().trim();
    if (!sellerName) sellerName = $('div[data-testid="seller-sidebar-card-user-info"] a strong').first().text().trim();
    if (!sellerName) sellerName = $('.seller-name a span').first().text().trim(); // Previous fallback
    if (!sellerName) sellerName = $('a[data-impression-id="seller_username"] span').first().text().trim(); // Previous attempt
    if (!sellerName) sellerName = $('meta[property="og:url"][content*="/users/"]').attr('content')?.split('/users/')[1]?.split('/')[0] || ''; // Try to get from meta tag as last resort
    
    // Refined Price Selectors
    let price = $('div[data-testid="price-amount"] .price').first().text().trim();
    if (!price) price = $('h2[data-testid="package_price"]').first().text().trim(); // Previous attempt
    if (!price) {
        const priceText = $('.pricing-packages .package-price .price').first().text().trim();
        if (priceText) price = priceText;
    }
    if (!price) price = $('.price').first().text().trim(); // Previous generic
    
    // Refined Description Selector
    // Try to get text directly to avoid complex HTML structures and invisible elements
    let description = $('div[data-testid="gig-description"] .collapsible-content .description-text').text().trim();
    if (!description) description = $('div.description__text').text().trim();
    if (!description) {
        // Fallback to the previous method but get text() instead of html()
        description = $('div[data-impression-id="description"] .description-content').text().trim();
    }
    if (!description) description = $('.gig-description').text().trim();
    
    // If description is still HTML-like (e.g. from a bad text() capture), clean it up
    if (description.includes('<') && description.includes('>')) {
        description = $.load(description)('body').text().trim(); // Re-parse and get text if it was HTML
    }

    const scrapedData = {
      requestedUrl: url,
      gigTitle: gigTitle || 'Title not found',
      sellerName: sellerName || 'Seller not found',
      price: price || 'Price not found',
      description: description || 'Description not found',
    };

    console.log('Scraped Data (attempt 2):', scrapedData);
    return NextResponse.json(scrapedData, { status: 200 });

  } catch (error: any) {
    console.error('[API SCRAPE ERROR]', error.message, error.stack);
    let errorMessage = 'Failed to scrape the Fiverr page. The structure might have changed or the page is protected.';
    if (axios.isAxiosError(error) && error.response) {
        console.error('Axios error details:', error.response.status, error.response.data);
        errorMessage = `Failed to fetch the Fiverr page. Status: ${error.response.status}`;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage, details: error.stack }, { status: 500 });
  }
} 