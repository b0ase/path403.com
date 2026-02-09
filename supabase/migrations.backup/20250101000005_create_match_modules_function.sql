-- Create a function to search for modules
create or replace function match_modules (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  module_name text,
  description text,
  content text,
  similarity float
)
language sql stable
as $$
  select
    module_knowledge.id,
    module_knowledge.module_name,
    module_knowledge.description,
    module_knowledge.content,
    1 - (module_knowledge.embedding <=> query_embedding) as similarity
  from module_knowledge
  where 1 - (module_knowledge.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$; 