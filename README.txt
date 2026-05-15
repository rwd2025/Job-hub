ROLLING WRENCH DIESEL
AUTO AI FALLBACK PATCH

1. Upload/replace this JS code into your app.js
OR
paste it near the bottom of app.js

2. Make sure your LOOKUP PART button says:

<button onclick="lookupPart()">
  LOOKUP PART
</button>

3. Commit changes to GitHub.

4. Refresh app.

This patch makes the app:
- search local database first
- automatically fall back to AI/web
- auto-save AI answers into repair_memory
- stop showing useless 0 HITS screens
