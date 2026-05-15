RWD Unified Fix Package

Included Fixes:
- oracle-parts-search API alignment
- AI fallback patch
- Engine patch
- Master search hook patch
- Repair kit query fix
- Smart repair kit frontend/backend patches
- Duplicate screen history cleanup guidance

IMPORTANT FRONTEND CHANGE:
Use:
const API_URL = "https://uxpkqwcmvtqvubibbrek.supabase.co/functions/v1/oracle-parts-search";

IMPORTANT BUTTON FIX:
<button onclick="askPart()">LOOKUP PART</button>

DO NOT use lookupPart() if your app already uses askPart().
