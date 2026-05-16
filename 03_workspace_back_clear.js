/* ROLLING WRENCH AI - WORKSPACE BACK + CLEAR PATCH
Paste at bottom of app.js.
*/

let rwCurrentWorkspace = "home";

const RW_WORKSPACE_CONFIG = {
  home: {
    title: "Home",
    clearIds: []
  },
  ai: {
    title: "Rolling Wrench AI",
    clearIds: ["rwAiQuestionInput","rwAiOverlayAnswer","rwAiImageInput"]
  },
  master: {
    title: "Master Search",
    clearIds: ["rwMasterDropInput","rwMasterDropResult","masterInput","masterSearch","oracleSearch","homeAiOut","oracleOut"]
  },
  parts: {
    title: "Parts",
    clearIds: ["partNumber","partSearch","partOut","partAnswer","partsTechOut","rwMasterDropResult"]
  },
  repair: {
    title: "Repair",
    clearIds: ["diagSearch","diagOut","diagAnswer","repairOut","cecilQuestion","cecilOut"]
  },
  camera: {
    title: "Camera / Vision",
    clearIds: ["rwVisionImage","rwVisionQuestion","rwVisionOut","rwVisionPreview"]
  },
  vin: {
    title: "VIN / Truck",
    clearIds: ["vinGlobal","vinOut","vinDecodeOut"]
  },
  clock: {
    title: "Clock / Job",
    clearIds: ["quoteOut","invoiceOut"]
  },
  backend: {
    title: "Backend",
    clearIds: ["debugOut","backendOut"]
  },
  debug: {
    title: "Debug",
    clearIds: ["debugOut","logOut"]
  },
  release: {
    title: "Release",
    clearIds: []
  },
  savejob: {
    title: "Save Job",
    clearIds: []
  },
  shop: {
    title: "Shop",
    clearIds: ["quoteOut","invoiceOut","customerName","custName"]
  }
};

function rwOpenWorkspace(name, targetId){
  rwCurrentWorkspace = name || "home";

  const cfg = RW_WORKSPACE_CONFIG[rwCurrentWorkspace] || {title: rwCurrentWorkspace, clearIds: []};
  const header = document.getElementById("rwWorkspaceHeader");
  const title = document.getElementById("rwWorkspaceTitle");

  if(title) title.textContent = cfg.title || "Rolling Wrench AI";

  if(rwCurrentWorkspace === "home"){
    document.body.classList.remove("rw-workspace-open");
    if(header) header.classList.remove("active");
  }else{
    document.body.classList.add("rw-workspace-open");
    if(header) header.classList.add("active");
  }

  if(targetId){
    const target = document.getElementById(targetId);
    if(target){
      target.scrollIntoView({behavior:"smooth", block:"start"});
    }
  }

  localStorage.setItem("rw_current_workspace", rwCurrentWorkspace);
}

function rwBackHome(){
  rwOpenWorkspace("home");

  if(typeof showSection === "function"){
    try{ showSection("home"); }catch(e){}
  }else if(typeof openSection === "function"){
    try{ openSection("home"); }catch(e){}
  }

  window.scrollTo({top:0, behavior:"smooth"});
}

function rwClearCurrentWorkspace(){
  const cfg = RW_WORKSPACE_CONFIG[rwCurrentWorkspace] || {clearIds: []};

  (cfg.clearIds || []).forEach(id=>{
    const el = document.getElementById(id);
    if(!el) return;

    if(el.type === "file"){
      el.value = "";
      return;
    }

    if(el.tagName === "IMG"){
      el.src = "";
      el.style.display = "none";
      return;
    }

    if("value" in el){
      el.value = "";
    }else{
      el.textContent = "";
      el.innerHTML = "";
    }
  });

  if(rwCurrentWorkspace === "ai" && typeof clearRollingWrenchAIOverlay === "function"){
    clearRollingWrenchAIOverlay();
  }

  if(rwCurrentWorkspace === "camera"){
    const preview = document.getElementById("rwVisionPreview");
    if(preview){
      preview.src = "";
      preview.style.display = "none";
    }
  }

  alert((RW_WORKSPACE_CONFIG[rwCurrentWorkspace]?.title || "Workspace") + " cleared.");
}

function rwToggleQuickTools(){
  document.getElementById("rwQuickToolsPanel")?.classList.toggle("open");
}

/* Safer replacement for section buttons */
function rwGo(name, targetId){
  rwOpenWorkspace(name, targetId || name);

  if(typeof showSection === "function"){
    try{ showSection(targetId || name); }catch(e){}
  }else if(typeof openSection === "function"){
    try{ openSection(targetId || name); }catch(e){}
  }
}

/* Patch existing openSectionSafe if present */
const __rwOldOpenSectionSafe = typeof openSectionSafe === "function" ? openSectionSafe : null;
window.openSectionSafe = function(id){
  const map = {
    home:"home",
    parts:"parts",
    repair:"repair",
    doctor:"repair",
    camera:"camera",
    vin:"vin",
    clock:"clock",
    labor:"shop",
    backend:"backend",
    debug:"debug",
    release:"release",
    savejob:"savejob",
    shop:"shop"
  };

  const workspace = map[id] || id || "home";
  rwOpenWorkspace(workspace, id);

  if(__rwOldOpenSectionSafe){
    try{ return __rwOldOpenSectionSafe(id); }catch(e){}
  }

  if(typeof showSection === "function"){
    try{ return showSection(id); }catch(e){}
  }

  if(typeof openSection === "function"){
    try{ return openSection(id); }catch(e){}
  }
};

document.addEventListener("DOMContentLoaded", ()=>{
  const saved = localStorage.getItem("rw_current_workspace") || "home";
  if(saved !== "home") rwOpenWorkspace(saved);
});
