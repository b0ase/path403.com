import os
import json
import google.generativeai as genai
from supabase import create_client, Client
from dotenv import load_dotenv
import time
from typing import List, Optional

# --- Load specified .env file ---
dotenv_path = '/Users/b0ase/Projects/b0ase.com/.env.test'
load_dotenv(dotenv_path=dotenv_path)
# --- End Loading ---

# --- Configuration ---
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
GOOGLE_AI_API_KEY = os.getenv("GOOGLE_AI_API_KEY")
INPUT_JSON_FILE = 'module_data.json'
TABLE_NAME = 'module_knowledge'

# Check for necessary environment variables
if not all([SUPABASE_URL, SUPABASE_SERVICE_KEY, GOOGLE_AI_API_KEY]):
    raise ValueError("Supabase URL/Key or Google AI API Key is missing. Check your .env file.")

# Configure the Gemini client
genai.configure(api_key=GOOGLE_AI_API_KEY)

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def generate_embedding(text: str, model: str = "models/embedding-001") -> Optional[List[float]]:
    """Generates an embedding for the given text using Google Gemini."""
    try:
        result = genai.embed_content(model=model, content=text, task_type="RETRIEVAL_DOCUMENT")
        return result['embedding']
    except Exception as e:
        print(f"  Error generating embedding: {e}")
        return None

def main() -> None:
    """Main function to read, embed, and store module data."""
    try:
        with open(INPUT_JSON_FILE, 'r', encoding='utf-8') as f:
            module_data = json.load(f)
    except FileNotFoundError:
        print(f"Error: The file {INPUT_JSON_FILE} was not found.")
        return

    print(f"Found {len(module_data)} modules in {INPUT_JSON_FILE}.")

    # Clear existing data from the table
    print(f"Clearing existing data from '{TABLE_NAME}' table...")
    try:
        # The .gt('id', 0) is a workaround to delete all rows without a direct 'truncate'
        delete_response = supabase.table(TABLE_NAME).delete().gt('id', 0).execute()
        if delete_response.data:
             print(f"  Cleared {len(delete_response.data)} rows.")
        else:
            print("  Table already empty or could not clear.")
    except Exception as e:
        print(f"Warning: Could not clear table or table was already empty. Reason: {e}")

    # Process and insert new data
    for item in module_data:
        module_name = item.get('module_name', 'Unknown Module')
        print(f"Processing module: {module_name}...")
        
        # Combine relevant fields into a single text block for embedding
        content_to_embed = (
            f"Module: {module_name}\\n"
            f"Description: {item.get('description', '')}\\n"
            f"Features: {', '.join(item.get('core_features', []))}\\n"
            f"Tech Stack: {', '.join(item.get('tech_stack', []))}"
        )

        embedding = generate_embedding(content_to_embed)

        if embedding:
            try:
                data_to_insert = {
                    'module_name': module_name,
                    'description': item.get('description'),
                    'price_range': item.get('price_range'),
                    'what_you_get': item.get('what_you_get'),
                    'core_features': item.get('core_features'),
                    'tech_stack': item.get('tech_stack'),
                    'delivery_timeline': item.get('delivery_timeline'),
                    'content': content_to_embed,
                    'embedding': embedding
                }
                
                response = supabase.table(TABLE_NAME).insert(data_to_insert).execute()

                # Check if the insert was successful
                if len(response.data) > 0:
                    print(f"  Successfully inserted '{module_name}' into Supabase.")
                else:
                    print(f"  Failed to insert '{module_name}' into Supabase. Response: {response.data}")

            except Exception as e:
                print(f"  Error inserting '{module_name}' into Supabase: {e}")
        
        # Rate limiting: 1 request per second to avoid hitting API limits
        time.sleep(1)

    print("\nProcessing complete.")

if __name__ == '__main__':
    main() 