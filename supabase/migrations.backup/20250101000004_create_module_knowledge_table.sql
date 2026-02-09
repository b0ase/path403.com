-- Enable the pgvector extension
create extension if not exists vector with schema extensions;

-- Create the table to store module information and embeddings
create table if not exists module_knowledge (
  id bigserial primary key,
  module_name text not null,
  description text,
  price_range text,
  what_you_get text,
  core_features text[],
  tech_stack text[],
  delivery_timeline text[],
  content text, -- The combined text content for embedding
  embedding vector(768) -- Gemini embedding model dimension
); 