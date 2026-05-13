Rolling Cecil AI - Phase 7 Backend Expansion Pro

Upload all files to your GitHub Pages root.

Then in Supabase SQL Editor, run supabase_master_schema.sql.

Phase 7 adds:
- Backend Expansion Pro screen
- recursive_interchange_chain RPC
- backend_expansion_search RPC
- staging_catalog_imports
- supplier_pricing
- repair_procedures
- known_failures
- vin_history_expanded
- indexes for faster field search
- optional process_staging_catalog_imports() importer

After upload, hard refresh the app or re-add it to Home Screen because the service worker cache changed.
