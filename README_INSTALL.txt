ROLLING WRENCH AI - COMBINED UI PATCH

THIS ONE ZIP INCLUDES:
✅ Top-right RW logo/settings button
✅ Settings panel opens from top-right button
✅ Compact / Master / Dock / Theme moved into settings
✅ Master ChatGPT-style input bar
✅ + image button for photo library/camera
✅ Mic button
✅ Send/AI button
✅ Master image routing to Rolling Wrench AI Vision
✅ Compact duplicate cleanup
✅ App manifest renamed to Rolling Wrench AI / RW AI

INSTALL:
1. Replace old dead gear button with the top-right section from:
   01_combined_ui_patch.html

2. Replace old MASTER input area with the MASTER CHAT BAR section from:
   01_combined_ui_patch.html

3. Paste:
   02_combined_ui_patch.css
   into your CSS.

4. Paste:
   03_combined_ui_patch.js
   before closing </script>.

5. Use:
   manifest.json
   to replace your current manifest if it still says Cecil AI.

6. Remove or hide old big button block by adding one of these classes to its wrapper:
   oldQuickButtonBlock
   mainQuickButtons
   fullHomeModules

7. For clean compact launcher cards, add:
   compactLauncher
   to the wrapper with Start Work / Parts / Repair / AI Brain / Shop.

IMPORTANT:
At the TOP of your existing runMasterSearch() function add:

if(await routeMasterSearchWithImage()) return;

APP ICON NOTE:
This zip includes manifest name changes, but not a final custom PNG icon.
Use your final Rolling Wrench AI icon as:
apple-touch-icon.png
icon-192.png
icon-512.png

After uploading:
Delete old Home Screen app from iPhone and re-add it from Safari so the icon/name refreshes.
