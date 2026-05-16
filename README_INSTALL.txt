
ROLLING WRENCH AI - SETTINGS GEAR PATCH

THIS VERSION CHANGES:
- Removes floating quick action drawer
- Uses the TOP RIGHT gear button instead
- Gear button opens fast settings panel
- Compact/Master/Dock/Theme moved into gear settings
- + IMAGE added to MASTER
- Compact duplicate screen cleanup included

INSTALL:

1. Paste:
01_top_right_settings_gear.html
near your existing top right gear button area.

2. Paste:
02_master_plus_image.html
inside your MASTER card.

3. Paste:
rolling_wrench_settings_patch.js
before </script>

4. Paste:
rolling_wrench_settings_patch.css
into your CSS.

IMPORTANT:
Remove old:
- Compact buttons from home
- Dock button from home
- Theme selector from home
- Dead gear button

MASTER IMAGE HOOK:
At top of existing master search function add:

if(await routeMasterSearchWithImage()) return;

COMPACT FIX:
Add class:
compactLauncher
to clean launcher cards.

Add class:
fullHomeModules
to giant duplicate cards wrapper.
