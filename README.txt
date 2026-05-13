Rolling Cecil AI - Phase 5 OCR + Vision Pro Build

Upload/replace all files in GitHub Pages root:
- index.html
- app.js
- style.css
- manifest.json
- service-worker.js
- supabase_master_schema.sql

New Phase 5 features:
- OCR / Vision Pro screen
- camera photo upload with capture=environment
- scan part label / VIN plate / receipt / work order photo
- AI OCR hook through Oracle Edge Function
- text cleanup and part-number candidate extraction
- send scanned part to Parts Lookup
- lookup scanned part directly
- add scanned part to invoice
- save photo note locally and to Supabase photo_notes table
- scan history with reload

Also keeps Phase 1-4 features: Shop OS, Parts Pro, Diesel Intelligence, Field Tools Pro.

After upload, hard refresh or remove/re-add Home Screen app because service worker cache changed.
