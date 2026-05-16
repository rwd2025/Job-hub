
/* =========================================================
ROLLING WRENCH AI SETTINGS PANEL TOGGLE
========================================================= */

function toggleRwSettingsPanel(){

  const panel =
    document.getElementById("rwSettingsPanel");

  if(!panel) return;

  panel.classList.toggle("open");
}
