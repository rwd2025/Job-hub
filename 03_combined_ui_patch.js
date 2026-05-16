/* =========================================================
ROLLING WRENCH AI - COMBINED UI PATCH JS
========================================================= */

function toggleRwSettingsPanel(){
  const panel = document.getElementById("rwSettingsPanel");
  if(!panel) return;
  panel.classList.toggle("open");
}

function setRwDisplayMode(mode){
  localStorage.setItem("rw_display_mode", mode);
  document.body.classList.toggle("rw-compact-mode", mode === "compact");
  document.body.classList.toggle("rw-master-mode", mode === "master");
  rwApplyCompactVisibility();
}

function toggleRwDockMode(){
  const current = localStorage.getItem("rw_dock_mode") === "on";
  const next = !current;
  localStorage.setItem("rw_dock_mode", next ? "on" : "off");
  document.body.classList.toggle("rw-dock-mode", next);
}

function setRwTheme(theme){
  localStorage.setItem("rw_theme", theme);
  document.body.classList.remove("theme-orange-black","theme-green-black","theme-blue-black","theme-steel");
  document.body.classList.add("theme-" + theme);
}

function rwApplyCompactVisibility(){
  const compact = localStorage.getItem("rw_display_mode") === "compact";

  document.querySelectorAll(
    ".fullHomeModules,.homeFullModules,.duplicateHomeModules,.oldQuickButtonBlock,.mainQuickButtons"
  ).forEach(el=>{
    el.style.display = compact ? "none" : "";
  });

  document.querySelectorAll(".compactLauncher").forEach(el=>{
    el.style.display = compact ? "" : "none";
  });
}

function openSectionSafe(id){
  if(typeof showSection === "function"){
    showSection(id);
  }else if(typeof openSection === "function"){
    openSection(id);
  }else{
    const target = document.getElementById(id);
    if(target){
      document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
      target.classList.add("active");
      target.scrollIntoView({behavior:"smooth", block:"start"});
    }
  }

  const panel = document.getElementById("rwSettingsPanel");
  if(panel) panel.classList.remove("open");
}

function rwAutoGrowMasterInput(el){
  if(!el) return;
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 120) + "px";
}

function masterImageSelected(){
  const input = document.getElementById("masterImageInput");
  const preview = document.getElementById("masterImagePreview");
  const file = input?.files?.[0];

  if(!file || !preview) return;

  preview.src = URL.createObjectURL(file);
  preview.style.display = "block";
}

async function routeMasterSearchWithImage(){
  const imgInput = document.getElementById("masterImageInput");
  const hasImage = !!imgInput?.files?.[0];

  if(!hasImage) return false;

  const q =
    document.getElementById("masterInput")?.value ||
    document.getElementById("masterSearch")?.value ||
    "What is shown in this picture?";

  const visionInput = document.getElementById("rwVisionImage");
  const visionQuestion = document.getElementById("rwVisionQuestion");

  if(visionInput && visionQuestion && typeof askRollingWrenchVisionAI === "function"){
    const dt = new DataTransfer();
    dt.items.add(imgInput.files[0]);
    visionInput.files = dt.files;
    visionQuestion.value = q;

    await askRollingWrenchVisionAI();

    const visionOut = document.getElementById("rwVisionOut")?.textContent || "";
    const masterOut =
      document.getElementById("masterOut") ||
      document.getElementById("oracleOut") ||
      document.getElementById("homeAiOut");

    if(masterOut && visionOut) masterOut.textContent = visionOut;

    return true;
  }

  alert("Rolling Wrench AI Vision is not connected yet.");
  return true;
}

/*
IMPORTANT:
At the TOP of your existing runMasterSearch() function add:

if(await routeMasterSearchWithImage()) return;
*/

function startRwVoiceInput(){
  const input = document.getElementById("masterInput");
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if(!SpeechRecognition){
    alert("Voice input is not supported in this browser yet.");
    return;
  }

  const rec = new SpeechRecognition();
  rec.lang = "en-US";
  rec.interimResults = false;
  rec.maxAlternatives = 1;

  rec.onresult = function(event){
    const text = event.results?.[0]?.[0]?.transcript || "";
    if(input){
      input.value = text;
      rwAutoGrowMasterInput(input);
    }
  };

  rec.onerror = function(){
    alert("Voice input failed. Try typing instead.");
  };

  rec.start();
}

function rwInitCombinedPatch(){
  const mode = localStorage.getItem("rw_display_mode") || "compact";
  const dock = localStorage.getItem("rw_dock_mode") === "on";
  const theme = localStorage.getItem("rw_theme") || "orange-black";

  setRwDisplayMode(mode);
  document.body.classList.toggle("rw-dock-mode", dock);
  setRwTheme(theme);

  const select = document.getElementById("rwThemeSelect");
  if(select) select.value = theme;
}

document.addEventListener("DOMContentLoaded", rwInitCombinedPatch);
