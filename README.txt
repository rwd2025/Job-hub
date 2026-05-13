Rolling Cecil AI Phase 12 — Live Semantic Retrieval

Upload all files to your GitHub Pages root:
- index.html
- app.js
- style.css
- manifest.json
- service-worker.js
- supabase_master_schema.sql

Supabase:
1. Open SQL Editor.
2. Run supabase_master_schema.sql.
3. Confirm these RPC functions pass in the app Debug screen:
   - universal_diesel_search
   - diesel_brain_search
   - recursive_interchange_chain
   - expanded_backend_search
   - rolling_cecil_live_retrieval

Phase 12 adds:
- source-backed retrieval cards
- repair memory ranking
- live retrieval router
- semantic_search_events logging
- manual_ingestion_queue table
- seed field notes for X15 idle stutter and DD15 NOx/SCR issues

After upload:
- Reset cache from Debug if old UI appears.
- Test Doctor search: X15 stutter idle
- Test AI Brain search: NOx efficiency


PHASE 13 — REAL EMBEDDINGS + RAG
Added:
- Phase 13 AI Brain ingestion queue UI
- Hybrid RAG search button
- manual/TSB/catalog text queueing
- embedding_ingestion_jobs table
- embedding_router_events table
- queue_embedding_ingestion RPC
- rolling_cecil_hybrid_rag_search RPC
- Edge Function starter package under supabase/functions/embedding-router

Important:
Run supabase_master_schema.sql after upload. Real semantic vector similarity requires an Edge Function/API key to generate embeddings and populate knowledge_base_embeddings.embedding.
