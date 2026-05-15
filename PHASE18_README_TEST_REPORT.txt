Rolling Cecil AI Phase 18 - Parts Book AI

Frontend:
- Overrides askPart() so part lookup calls smart_part_number_lookup first.
- Falls back to Oracle + Universal Diesel Database if the smart SQL function is missing.
- Adds a clean Parts Book AI card with normalized engine, confidence, warning, and matches.
- Adds addBestSmartPartToInvoice() helper.

Backend:
Run phase18_parts_book_ai_backend.sql in Supabase SQL Editor.

Expected tests:
select smart_part_number_lookup('water pump', 'X15 Efficiency', null);
select smart_part_number_lookup('oil filter', 'MX-13', null);
select smart_part_number_lookup('turbo actuator', 'DD15 Gen5', null);

Static test:
app.js syntax checked with node --check.
