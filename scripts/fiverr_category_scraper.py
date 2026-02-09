import json
import argparse
import sys # Import sys for stderr
from fiverr_api import session # Assuming fiverr-api is installed in the environment
# from bs4 import BeautifulSoup # Imported via fiverr_api's response.soup

# --- Configuration ---
# SCRAPER_API_KEY is now passed as an argument, remove hardcoded version.

BASE_FIVERR_URL = "https://www.fiverr.com"

def setup_scraper_session(api_key):
    if api_key:
        session.set_scraper_api_key(api_key)
    else:
        # This case should ideally be caught by the API route in Next.js
        # but as a fallback in the script:
        print("Error: ScraperAPI key was not provided to the script.", file=sys.stderr)
        # Depending on fiverr_api behavior, it might raise an error on session.get()
        # or we can choose to exit here.
        # For now, let it proceed and fiverr_api will likely raise the ValueError we saw before.
        pass 

def scrape_main_categories():
    """Scrapes main categories from Fiverr."""
    results = []
    # This is a placeholder. Actual selectors will need to be identified by inspecting Fiverr.
    # Option 1: Try to get data from Perseus initial props (if available for categories)
    # response = session.get(BASE_FIVERR_URL)
    # initial_props = response.props_json() # Or use get_perseus_initial_props()
    # if initial_props and 'categories' in initial_props: # Fictional structure
    #     for cat in initial_props['categories']:
    #         results.append({
    #             "id": cat.get('id', cat.get('slug')),
    #             "title": cat.get('name'),
    #             "type": "category",
    #             "url": f"{BASE_FIVERR_URL}{cat.get('path', '/')}", # Fictional path
    #             "hasSubcategories": cat.get('hasSubcategories', True) # Assume true initially
    #         })
    #     return results

    # Option 2: Parse HTML if Perseus props don't yield categories easily
    # This requires inspecting Fiverr's category page structure carefully.
    response = session.get(f"{BASE_FIVERR_URL}/categories") # Or a sitemap URL
    soup = response.soup

    # --- !!! Placeholder Selector Logic - This MUST be updated !!! ---
    # Example: Find all <a> tags within a <nav> with class 'categories-nav'
    # category_nav = soup.find('nav', class_='categories-nav')
    # if category_nav:
    #     for link in category_nav.find_all('a', href=True):
    #         category_name = link.text.strip()
    #         category_url = link['href']
    #         if not category_url.startswith('http'):
    #             category_url = f"{BASE_FIVERR_URL}{category_url}"
            
    #         results.append({
    #             "id": category_name.lower().replace(' ', '-').replace('&', 'and'),
    #             "title": category_name,
    #             "type": "category",
    #             "url": category_url,
    #             "hasSubcategories": True # Assume true, or try to infer
    #         })
    # --- End Placeholder --- 

    # If the above fails, return mock data for now for frontend testing
    if not results:
        results = [
            { "id": 'graphics-design', "title": 'Graphics & Design', "type": 'category', "hasSubcategories": True, "url": f'{BASE_FIVERR_URL}/categories/graphics-design' },
            { "id": 'digital-marketing', "title": 'Digital Marketing', "type": 'category', "hasSubcategories": True, "url": f'{BASE_FIVERR_URL}/categories/digital-marketing' },
            { "id": 'writing-translation', "title": 'Writing & Translation', "type": 'category', "hasSubcategories": True, "url": f'{BASE_FIVERR_URL}/categories/writing-translation' },
            # Add more mock categories as needed from your frontend
        ]
    return results

def scrape_specific_url(url):
    """Scrapes a specific Fiverr URL (e.g., a category page or a gig page)."""
    results = [] # Should be a dictionary for a single gig
    gig_data = {} 

    try:
        response = session.get(url)
        # Try to get structured data first
        initial_props = response.props_json()
        
        if initial_props and isinstance(initial_props, dict):
            # This is highly dependent on Fiverr's structure in props_json()
            # The following are common keys found in some scraping examples for Fiverr gigs,
            # but WILL LIKELY NEED ADJUSTMENT by inspecting the actual initial_props for a gig.
            gig_data['title'] = initial_props.get('title') or initial_props.get('gigTitle')
            gig_data['description'] = initial_props.get('description') or initial_props.get('gigDescription')
            gig_data['id'] = initial_props.get('id') or initial_props.get('gigId')
            
            seller_data = initial_props.get('seller') or initial_props.get('profileUser')
            if isinstance(seller_data, dict):
                gig_data['seller_name'] = seller_data.get('username')
                # Construct seller URL if possible, or it might be in seller_data
                if seller_data.get('username'):
                    gig_data['seller_url'] = f"{BASE_FIVERR_URL}/{seller_data.get('username')}"

            # Pricing might be complex (packages)
            # For a simple price, it might be under a key like 'price' or in 'pricingInfo'
            pricing_info = initial_props.get('pricing') or initial_props.get('gigPackages')
            if isinstance(pricing_info, dict) and pricing_info.get('basic') and isinstance(pricing_info['basic'], dict):
                 gig_data['price'] = f"{pricing_info['basic'].get('currency','$')}{pricing_info['basic'].get('price')}" # Example
            elif initial_props.get('price'): # A simpler top-level price
                gig_data['price'] = initial_props.get('price')

            gig_data['rating'] = initial_props.get('rating')
            gig_data['reviews_count'] = initial_props.get('reviewsCount') or initial_props.get('ratingCount')
            
            # If initial_props was useful, we can largely rely on it.
            # If not all data is there, supplement with BeautifulSoup below.

        # Fallback or supplement with BeautifulSoup if needed, or if initial_props is empty/insufficient
        if not gig_data.get('title'): # Example check: if title wasn't found in props
            soup = response.soup
            # --- !!! Placeholder Selector Logic for gig details - This MUST be updated !!! ---
            title_element = soup.find('h1', class_='gig-title') # Fictional class
            if title_element:
                gig_data['title'] = title_element.text.strip()
            # Add more soup.find() logic for other fields if initial_props didn't cover them
            # --- End Placeholder --- 
        
        if not gig_data: # If absolutely nothing was found
            # Fallback to mock data FOR A SINGLE GIG if scraping fails or selectors are not implemented
            gig_data = {
                "id": 'mock-gig-id',
                "title": f'Mock Scraped Gig for {url}',
                "description": "This is mock description because real scraping failed or needs specific selectors.",
                "seller_name": "mock_seller",
                "price": "$0.00",
                "rating": 5.0,
                "reviews_count": 100
            }

    except Exception as e:
        # Log the error to stderr so it can be picked up by the Node.js wrapper
        print(f"Python script error during scraping {url}: {str(e)}", file=sys.stderr)
        # Return a dictionary with an error key, which the frontend can check
        return {"error": "Python script failed during scraping", "details": str(e)}

    return gig_data # Return a single dictionary for the gig

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Scrape Fiverr categories or a specific Fiverr URL.')
    parser.add_argument('--url', type=str, help='Specific Fiverr category URL or Gig URL to scrape.')
    parser.add_argument('--api_key', type=str, required=True, help='ScraperAPI key.')
    
    args = parser.parse_args()

    setup_scraper_session(args.api_key)

    output = {}
    if args.url:
        # Assuming --url is now for a specific gig, not a category page for sub-item listing
        output = scrape_specific_url(args.url)
    else:
        # This mode is no longer used by the frontend but kept for direct script testing if needed
        # For the frontend's current design, it always provides a --url for a specific gig.
        # If you want to re-enable category scraping, this part would need adjustment.
        # output = scrape_main_categories() 
        output = {"error": "No URL provided for gig scraping. Please specify a --url.", "details": "This script now primarily scrapes specific gig URLs when called from the application."}
    
    print(json.dumps(output, indent=2)) 