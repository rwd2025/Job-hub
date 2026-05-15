ROLLING CECIL PHASE 15 FRONTEND INTEGRATION

WHAT THIS ZIP DOES:
- Keeps existing buttons working.
- Overrides Master Search to call smart_workflow_engine(), with fallback to master_job_workflow().
- Renders one TEXA-style workflow: rules, repair intelligence, labor, repair kits, parts, failures, manuals, test steps, torque specs, truck history.
- Wires Vision/OCR screen to backend functions:
  extract_vin_from_text()
  extract_part_numbers_from_text()
  add_scanned_parts_to_invoice()
  find_part_suppliers()
- Adds a FIND SUPPLIERS button automatically to Vision screen.

INSTALL:
1. Upload/replace app.js, index.html, style.css, manifest.json, service-worker.js in GitHub.
2. Commit changes.
3. Open app with cache buster: https://rwd2025.github.io/Job-hub/index.html?v=1500

TEST ORDER:
1. Master Search: X15 water pump
2. Vision Pro: paste text `Fleetguard LF14000NN Baldwin BF46129 PACCAR 2129791PE Qty 1` into RAW TEXT.
3. Tap CLEAN TEXT.
4. Tap ADD SCAN TO INVOICE.
5. Tap FIND SUPPLIERS.
6. VIN Plate: paste `VIN 1XPBD49X1JD123456 UNIT 54` and tap CLEAN TEXT.

REQUIRED BACKEND FUNCTIONS:
smart_workflow_engine
master_job_workflow
extract_vin_from_text
extract_part_numbers_from_text
add_scanned_parts_to_invoice
find_part_suppliers
