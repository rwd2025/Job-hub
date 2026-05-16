
/* ROLLING WRENCH AI SETTINGS + MASTER IMAGE PATCH */

function toggleRwSettingsPanel(){
  const panel = document.getElementById("rwSettingsPanel");
  if(!panel) return;
  panel.classList.toggle("open");
}

function setRwDisplayMode(mode){
  localStorage.setItem("rw_display_mode", mode);

  document.body.classList.toggle(
    "rw-compact-mode",
    mode === "compact"
  );

  document.body.classList.toggle(
    "rw-master-mode",
    mode === "master"
  );

  rwApplyCompactVisibility();
}

function toggleRwDockMode(){
  const current =
    localStorage.getItem("rw_dock_mode") === "on";

  const next = !current;

  localStorage.setItem(
    "rw_dock_mode",
    next ? "on" : "off"
  );

  document.body.classList.toggle(
    "rw-dock-mode",
    next
  );
}

function setRwTheme(theme){
  localStorage.setItem("rw_theme", theme);

  document.body.classList.remove(
    "theme-orange-black",
    "theme-green-black",
    "theme-blue-black",
    "theme-steel"
  );

  document.body.classList.add(
    "theme-" + theme
  );
}

function rwApplyCompactVisibility(){

  const compact =
    localStorage.getItem("rw_display_mode")
    === "compact";

  document.querySelectorAll(
    ".fullHomeModules,.homeFullModules,.duplicateHomeModules"
  ).forEach(el=>{
    el.style.display = compact ? "none" : "";
  });

  document.querySelectorAll(
    ".compactLauncher"
  ).forEach(el=>{
    el.style.display = compact ? "" : "none";
  });
}

function openSectionSafe(id){

  if(typeof showSection === "function"){
    showSection(id);
  }
  else if(typeof openSection === "function"){
    openSection(id);
  }

  const panel =
    document.getElementById("rwSettingsPanel");

  if(panel) panel.classList.remove("open");
}

function masterImageSelected(){

  const input =
    document.getElementById("masterImageInput");

  const preview =
    document.getElementById("masterImagePreview");

  const file =
    input?.files?.[0];

  if(!file || !preview) return;

  preview.src = URL.createObjectURL(file);
  preview.style.display = "block";
}

async function routeMasterSearchWithImage(){

  const imgInput =
    document.getElementById("masterImageInput");

  const hasImage =
    !!imgInput?.files?.[0];

  if(!hasImage) return false;

  const q =
    document.getElementById("masterSearch")?.value ||
    document.getElementById("masterInput")?.value ||
    "What is shown in this picture?";

  const visionInput =
    document.getElementById("rwVisionImage");

  const visionQuestion =
    document.getElementById("rwVisionQuestion");

  if(
    visionInput &&
    visionQuestion &&
    typeof askRollingWrenchVisionAI === "function"
  ){

    const dt = new DataTransfer();
    dt.items.add(imgInput.files[0]);

    visionInput.files = dt.files;
    visionQuestion.value = q;

    await askRollingWrenchVisionAI();

    return true;
  }

  alert(
    "Rolling Wrench AI Vision not found."
  );

  return true;
}

function rwInitSettings(){

  const mode =
    localStorage.getItem("rw_display_mode")
    || "compact";

  const dock =
    localStorage.getItem("rw_dock_mode")
    === "on";

  const theme =
    localStorage.getItem("rw_theme")
    || "orange-black";

  setRwDisplayMode(mode);

  document.body.classList.toggle(
    "rw-dock-mode",
    dock
  );

  setRwTheme(theme);

  const select =
    document.getElementById("rwThemeSelect");

  if(select){
    select.value = theme;
  }
}

document.addEventListener(
  "DOMContentLoaded",
  rwInitSettings
);
