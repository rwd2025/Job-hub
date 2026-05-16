
ROLLING WRENCH AI - MASTER CHAT BAR PATCH

WHAT THIS DOES:
- Replaces bulky MASTER input with ChatGPT-style bar
- Big + button on left for camera/photo library
- Large text box
- Mic button
- Black AI/send button
- Routes attached image to Rolling Wrench AI Vision
- Keeps MASTER clean and compact

INSTALL:
1. Replace old MASTER input/button area with:
   01_master_chatbar.html

2. Paste:
   02_master_chatbar.css
   into CSS.

3. Paste:
   03_master_chatbar.js
   before closing </script>.

4. IMPORTANT:
   At the TOP of your existing runMasterSearch() function add:

   if(await routeMasterSearchWithImage()) return;

Example:
async function runMasterSearch(){
  if(await routeMasterSearchWithImage()) return;
  // old master logic here
}

TEST:
- Tap + button
- Choose camera/photo library image
- Type: What is this part?
- Hit black AI button
