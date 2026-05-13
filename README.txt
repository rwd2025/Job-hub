Rolling Cecil AI – Embedding Router Patch

1. Open app.js
2. Add the EMBEDDING_ROUTER_URL under API_URL
3. Add the callEmbeddingRouter() function near callOracle()
4. Replace the old homeAI() call section with the new block
5. Save and upload app.js to GitHub
6. Refresh the app

This patch connects the Doctor screen to the live Supabase Edge Function.
