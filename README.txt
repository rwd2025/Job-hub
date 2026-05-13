Rolling Cecil AI Master Build

Upload these files to your GitHub Pages root:
- index.html
- style.css
- app.js
- manifest.json
- service-worker.js

Then run supabase_master_schema.sql in Supabase SQL Editor.

What changed:
- Removed TEST UNIVERSAL SEARCH button from the UI.
- LOOKUP PART now runs Oracle + Universal SQL Search + Repair Kits together.
- Raw JSON output replaced with cards: database parts, cross refs, labor, torque, fluids, diagnostics, suppliers, repair kits.
- Service worker now caches app.js and style.css too.
- Backend SQL is rebuilt around relational manufacturers / parts / part_cross_refs.

Important:
The Supabase key in app.js is your anon key. That is normal for browser apps, but Row Level Security should be tightened before storing sensitive customer data.
