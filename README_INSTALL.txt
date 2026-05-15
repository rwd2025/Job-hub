
ROLLING CECIL AI PATCH INSTALL

1. Open index.html
2. Find:
   async function runMasterSearch()

3. Paste contents of engine_patch.js ABOVE that function.

4. Inside runMasterSearch():
   ADD:

   const engine = detectEngine(searchTerm);
   const component = detectComponent(searchTerm);

5. Replace old repair_kits query with the new query from engine_patch.js

6. Save
7. Upload updated ZIP to GitHub
8. Hard refresh iPhone Safari

Expected Result:
- ACTIVE ENGINE shows X15
- LOCAL DATABASE shows hits
- SMART REPAIR KIT loads
- OEM/ALT/LABOR/NOTES populate from SQL
