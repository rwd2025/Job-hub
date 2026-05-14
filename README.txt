Rolling Cecil AI — Embedding Router Vector Fix

This rebuild fixes the search issue where matches returned [].

What changed:
- Search embeddings are converted to pgvector string format.
- Search calls match_knowledge_base_v2.
- Ingest still saves embeddings to knowledge_base_embeddings.

Deploy:
1. Open Supabase > Edge Functions > embedding-router > Code.
2. Replace the whole index.ts with supabase/functions/embedding-router/index.ts.
3. Deploy updates.
4. Test with:

{
  "mode": "search",
  "question": "X15 rough idle and stutter",
  "match_count": 5
}

If search still returns empty, run supabase_vector_search_fix.sql in Supabase SQL Editor.
