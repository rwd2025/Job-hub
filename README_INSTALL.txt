ROLLING WRENCH AI - WORKSPACE BACK + CLEAR PATCH

WHAT THIS DOES:
- Adds shared Back / Title / Clear header for work screens.
- Every selection can act like its own workspace.
- Back returns to Home.
- Clear clears that screen's info.
- Keeps data until Clear.
- Adds optional collapsed Quick Tools panel so buttons are not always visible.

INSTALL:
1. Paste 01_workspace_header.html near bottom of index.html before </body>.
2. Paste 02_workspace_back_clear.css at bottom of style.css.
3. Paste 03_workspace_back_clear.js at bottom of app.js.
4. Optional: paste 04_optional_quick_tools_collapse.html on Home if you want collapsed Quick Tools.

HOW TO USE:
- Existing buttons that call openSectionSafe('parts') will now open the Parts workspace header.
- You can also call rwGo('parts','parts') directly.
- Back button calls rwBackHome().
- Clear button calls rwClearCurrentWorkspace().

IF SOME FIELD DOES NOT CLEAR:
Add its element id to RW_WORKSPACE_CONFIG in 03_workspace_back_clear.js.
