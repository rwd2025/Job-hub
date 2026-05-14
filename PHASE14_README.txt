Rolling Cecil AI Phase 14 Build

What was checked:
- app.js syntax passes: node --check app.js
- all index.html onclick button handlers exist in app.js
- missing supplier/interchange button functions were added
- missing escapeHtml helper was added
- Phase 14 master_job_workflow frontend wiring was added
- Phase 14 safe SQL RPC file included: phase14_master_job_workflow.sql

Install order:
1. Upload/replace app.js, index.html, style.css, manifest.json, service-worker.js on GitHub.
2. In Supabase SQL Editor, run phase14_master_job_workflow.sql.
3. Test in Supabase:
   select public.master_job_workflow('X15 water pump', null);
4. Open app, go Debug, run button/core checks.
5. Test Master Search with: X15 water pump

Notes:
- The SQL function is defensive. It checks whether tables/columns exist before searching them.
- Master Search now calls master_job_workflow first, then still keeps Oracle/Universal/Diesel Brain fallback results.
- This build is meant to keep buttons working while adding the TEXA-style workflow layer.
