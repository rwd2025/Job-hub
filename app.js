const APP_VERSION = "TEST_BUILD_V1_CLEAN_CORE";
const $ = (id) => document.getElementById(id);
let screenHistory = ["home"];
let clockTimer = null;
let clockStartMs = null;
let invoiceParts = [];
let supabaseClient = null;

function safeText(id, text){ const el=$(id); if(el) el.textContent = text; }
function getVal(id){ return ($(id)?.value || "").trim(); }
function setVal(id,v){ const el=$(id); if(el) el.value = v || ""; }

document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
  loadActiveTruck();
  bindImagePreview("homeAiImage","homeAiPreview");
  bindImagePreview("visionImage","visionPreview");
  updateInvoicePartsViews();
  showScreen("home", true);
});

function showScreen(id, replace=false){
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const target=$(id) || $("home");
  target.classList.add("active");
  document.querySelectorAll(".bottomNav button").forEach(b=>b.classList.remove("active"));
  const navMap={home:0,faultDoctor:1,parts:2,repairHud:3,settings:4};
  const idx = navMap[id];
  if(idx !== undefined) document.querySelectorAll(".bottomNav button")[idx]?.classList.add("active");
  $("sideMenu")?.classList.remove("open");
  if(!replace && screenHistory[screenHistory.length-1] !== id) screenHistory.push(id);
  window.scrollTo({top:0,behavior:"smooth"});
}

function goBack(){
  if(screenHistory.length > 1){
    screenHistory.pop();
    showScreen(screenHistory[screenHistory.length-1], true);
  }else{
    showScreen("home", true);
  }
}

function toggleSideMenu(){ $("sideMenu")?.classList.toggle("open"); }

function vehicleContext(){
  return [
    `VIN:${$("activeVin")?.textContent || "NONE"}`,
    `YEAR:${$("activeYear")?.textContent || ""}`,
    `MAKE:${$("activeMake")?.textContent || ""}`,
    `MODEL:${$("activeModel")?.textContent || ""}`,
    `ENGINE:${$("activeEngine")?.textContent || ""}`,
    `ESN:${getVal("esnGlobal")}`,
    `CPL:${getVal("cplGlobal")}`
  ].join(" | ");
}

async function callAI(prompt){
  // Safe placeholder. Hook your Supabase Edge Function here later.
  await new Promise(r=>setTimeout(r,300));
  return `Rolling Wrench AI response:\n\n${prompt}\n\nVERIFY: Confirm VIN/ESN/CPL, OEM catalog, torque specs, and safety-critical procedures before ordering or repairing.`;
}

function saveSettings(){
  const settings = {
    shopName:getVal("shopName"), shopPhone:getVal("shopPhone"), shopWebsite:getVal("shopWebsite"),
    defaultLaborRate:getVal("defaultLaborRate"), defaultServiceCall:getVal("defaultServiceCall"),
    defaultTax:getVal("defaultTax"), defaultCardFee:getVal("defaultCardFee"), shopTerms:getVal("shopTerms"),
    supabaseUrl:getVal("supabaseUrl"), supabaseKey:getVal("supabaseKey")
  };
  localStorage.setItem("rwd_settings", JSON.stringify(settings));
  initSupabase();
  safeText("settingsOut","Settings saved.");
}

function loadSettings(){
  const defaults={defaultLaborRate:"135",defaultServiceCall:"250",defaultTax:"0",defaultCardFee:"0"};
  let settings={};
  try{ settings=JSON.parse(localStorage.getItem("rwd_settings")||"{}"); }catch(e){}
  settings={...defaults,...settings};
  Object.keys(settings).forEach(k=>setVal(k,settings[k]));
  setVal("laborRate", settings.defaultLaborRate);
  setVal("serviceCall", settings.defaultServiceCall);
  setVal("taxRate", settings.defaultTax);
  setVal("cardFee", settings.defaultCardFee);
  initSupabase();
}

function initSupabase(){
  const url=getVal("supabaseUrl"), key=getVal("supabaseKey");
  if(window.supabase && url && key){
    try{ supabaseClient = window.supabase.createClient(url,key); }catch(e){ supabaseClient=null; }
  }
}

function setTheme(theme){
  document.body.className = theme;
  localStorage.setItem("rwd_theme", theme);
}
const savedTheme = localStorage.getItem("rwd_theme"); if(savedTheme) document.body.className=savedTheme;

async function decodeVin(){
  const vin=getVal("vinGlobal");
  if(!vin){ alert("Enter VIN"); return; }
  safeText("vinOut","Decoding VIN...");
  try{
    const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${encodeURIComponent(vin)}?format=json`);
    const json = await res.json();
    const r = json.Results?.[0] || {};
    if(r.ModelYear) setVal("yearGlobal", r.ModelYear);
    if(r.Make) setVal("makeGlobal", r.Make);
    if(r.Model) setVal("modelGlobal", r.Model);
    saveActiveTruck();
    safeText("vinOut", `VIN decoded.\nYear: ${r.ModelYear || "Unknown"}\nMake: ${r.Make || "Unknown"}\nModel: ${r.Model || "Unknown"}\nEngine: ${r.EngineModel || getVal("engine") || "Verify manually"}\n\nAdd ESN/CPL when available for exact parts.`);
  }catch(e){
    safeText("vinOut","VIN decode failed. Check connection or enter vehicle manually.\n"+e.message);
  }
}

function saveActiveTruck(){
  const truck = {
    vin:getVal("vinGlobal") || "NONE",
    year:getVal("yearGlobal") || "----",
    make:getVal("makeGlobal") || "----",
    model:getVal("modelGlobal") || "----",
    engine:getVal("engine") || "----",
    esn:getVal("esnGlobal") || "----",
    cpl:getVal("cplGlobal") || "----"
  };
  localStorage.setItem("rwd_active_truck", JSON.stringify(truck));
  loadActiveTruck();
  safeText("vinOut",`Active truck saved.\n${vehicleContext()}`);
}

function loadActiveTruck(){
  let t={};
  try{ t=JSON.parse(localStorage.getItem("rwd_active_truck")||"{}"); }catch(e){}
  $("activeVin")&&( $("activeVin").textContent=t.vin||"NONE" );
  $("activeYear")&&( $("activeYear").textContent=t.year||"----" );
  $("activeMake")&&( $("activeMake").textContent=t.make||"----" );
  $("activeModel")&&( $("activeModel").textContent=t.model||"----" );
  $("activeEngine")&&( $("activeEngine").textContent=t.engine||"----" );
}

function clearVehicleData(){
  ["vinGlobal","yearGlobal","makeGlobal","modelGlobal","engine","esnGlobal","cplGlobal"].forEach(id=>setVal(id,""));
  localStorage.removeItem("rwd_active_truck");
  loadActiveTruck();
  safeText("vinOut","Vehicle data cleared.");
}

async function masterSearch(){
  const q=getVal("masterAsk");
  if(!q){ alert("Enter a search"); return; }
  safeText("masterOut","Thinking...");
  const answer = await callAI(`MASTER SEARCH\nContext: ${vehicleContext()}\nQuestion: ${q}\nRoute answer through parts, diagnostics, repair memory, invoice/job workflow when relevant.`);
  safeText("masterOut", answer);
}

async function askPart(){
  const q=getVal("partq"), note=getVal("partNote");
  if(!q && !note){ alert("Enter part number or part name"); return; }
  safeText("partOut","Looking up part...");
  const answer = await callAI(`OEM PART LOOKUP\nContext: ${vehicleContext()}\nPart query: ${q}\nNotes: ${note}\nRules: Identify part first. Do not guess exact fitment without VIN/ESN/CPL/OEM catalog. Include OEM, aftermarket, interchange, warnings, verify steps.`);
  safeText("partOut", answer);
}

function runInterchangeOnly(){ safeText("partOut",`Interchange chain ready.\nQuery: ${getVal("partq")}\n\nNext backend hook: universal_diesel_search + recursive cross refs.`); }
function addManualPartToInvoice(){
  const name=getVal("manualPartName") || getVal("partq") || "Part";
  const num=getVal("manualPartNumber");
  const qty=parseFloat(getVal("manualPartQty")||"1");
  const price=parseFloat(getVal("manualPartPrice")||"0");
  const supplier=getVal("manualPartSupplier");
  invoiceParts.push({name,num,qty,price,supplier});
  localStorage.setItem("rwd_invoice_parts", JSON.stringify(invoiceParts));
  updateInvoicePartsViews();
  safeText("partOut",`Added to invoice: ${qty} x ${name} ${num ? "#"+num : ""}`);
}
function saveCurrentPart(){ safeText("partOut", "Part saved locally for this test build."); }
function clearPartFields(){ ["partq","partNote","manualPartName","manualPartNumber","manualPartPrice","manualPartSupplier"].forEach(id=>setVal(id,"")); setVal("manualPartQty","1"); safeText("partOut","Parts fields cleared."); }

function updateInvoicePartsViews(){
  try{ invoiceParts=JSON.parse(localStorage.getItem("rwd_invoice_parts")||"[]"); }catch(e){ invoiceParts=[]; }
  const txt = invoiceParts.length ? invoiceParts.map((p,i)=>`${i+1}. ${p.qty} x ${p.name} ${p.num?`#${p.num}`:""} @ $${p.price.toFixed(2)} ${p.supplier?`(${p.supplier})`:""}`).join("\n") : "Invoice parts will appear here.";
  safeText("invoicePartsOut",txt); safeText("invoicePartsOutInvoice",txt);
}

async function homeAI(){
  const q=getVal("homeAiAsk");
  if(!q){ alert("Ask a question"); return; }
  safeText("homeAiOut","Thinking...");
  safeText("homeAiOut", await callAI(`DIESEL AI\nContext:${vehicleContext()}\nQuestion:${q}`));
}
function startVoiceInput(){ alert("Voice input placeholder. iPhone dictation can be used in the keyboard."); }
function startPartVoiceInput(){ startVoiceInput(); }

async function runDiag(){
  const q=getVal("diagq"), note=getVal("diagNote");
  if(!q && !note){ alert("Enter fault code or symptom"); return; }
  safeText("diagOut","Running Fault Doctor...");
  safeText("diagOut", await callAI(`FAULT DOCTOR\nContext:${vehicleContext()}\nFault/Symptom:${q}\nNotes:${note}\nReturn likely causes, tests, common misdiagnosis warnings, repair path, parts categories, and verify steps.`));
}
function runIntelligenceOnly(){ safeText("intelOut",`Diesel Brain scan:\n${getVal("diagq") || getVal("masterAsk") || "No symptom entered"}\n\nLikely failure ranking will connect to repair_memory + knowledge_base_embeddings later.`); }
function saveVerifiedFix(){ safeText("intelOut","Verified fix saved locally for test build. Backend table hook comes next."); }
function clearDiagFields(){ setVal("diagq",""); setVal("diagNote",""); safeText("diagOut","Enter fault code or symptom."); safeText("intelOut","Diesel Brain results will appear here."); }

function buildInvoice(){
  const labor=parseFloat(getVal("laborHours")||"0");
  const rate=parseFloat(getVal("laborRate")||getVal("defaultLaborRate")||"135");
  const call=parseFloat(getVal("serviceCall")||getVal("defaultServiceCall")||"250");
  const extraParts=parseFloat(getVal("partsCost")||"0");
  const taxPct=parseFloat(getVal("taxRate")||"0");
  const cardPct=parseFloat(getVal("cardFee")||"0");
  const partsTotal = invoiceParts.reduce((s,p)=>s+(p.qty*p.price),0)+extraParts;
  const laborTotal=labor*rate;
  const subtotal=laborTotal+call+partsTotal;
  const tax=subtotal*(taxPct/100);
  const card=(subtotal+tax)*(cardPct/100);
  const total=subtotal+tax+card;
  const text=`ROLLING WRENCH DIESEL\nINVOICE / QUOTE\n\nCustomer: ${getVal("custName")}\nPhone: ${getVal("custPhone")}\nTruck: ${getVal("invoiceTruck")}\nVIN: ${getVal("invoiceVin")}\n\nWork Performed:\n${getVal("laborDesc")}\n\nParts:\n${invoiceParts.length?invoiceParts.map(p=>`${p.qty} x ${p.name} ${p.num?`#${p.num}`:""} - $${(p.qty*p.price).toFixed(2)}`).join("\n"):"No itemized parts"}\n\nLabor: $${laborTotal.toFixed(2)}\nService Call: $${call.toFixed(2)}\nParts: $${partsTotal.toFixed(2)}\nTax: $${tax.toFixed(2)}\nCard Fee: $${card.toFixed(2)}\nTOTAL DUE: $${total.toFixed(2)}`;
  safeText("quoteOut", text);
}
function saveInvoice(){ localStorage.setItem("rwd_last_invoice", $("quoteOut")?.textContent||""); safeText("quoteOut", ($("quoteOut")?.textContent||"")+"\n\nSaved locally."); }
function copyText(id){ const txt=$(id)?.textContent||""; navigator.clipboard?.writeText(txt); alert("Copied."); }
function clearInvoiceForm(){ ["custName","custPhone","invoiceTruck","invoiceVin","laborHours","partsCost","laborDesc"].forEach(id=>setVal(id,"")); safeText("quoteOut","Invoice output will appear here."); }

function clockIn(){ clockStartMs=Date.now(); localStorage.setItem("rwd_clock_start",String(clockStartMs)); $("clockStart").textContent=new Date(clockStartMs).toLocaleString(); $("clockStatusText").textContent="CLOCKED IN"; if(clockTimer) clearInterval(clockTimer); clockTimer=setInterval(updateClock,1000); updateClock(); }
function clockOut(){ updateClock(); $("clockStop").textContent=new Date().toLocaleString(); $("clockStatusText").textContent="CLOCKED OUT"; if(clockTimer) clearInterval(clockTimer); }
function resetClock(){ clockStartMs=null; localStorage.removeItem("rwd_clock_start"); ["clockStart","clockStop"].forEach(id=>safeText(id,"--")); safeText("clockHours","0.00"); safeText("clockLabor","$0.00"); safeText("clockLiveTimer","0.00 hrs"); safeText("clockStatusText","CLOCKED OUT"); }
function updateClock(){ if(!clockStartMs) return; const hrs=(Date.now()-clockStartMs)/3600000; const rate=parseFloat(getVal("laborRate")||getVal("defaultLaborRate")||"135"); safeText("clockHours",hrs.toFixed(2)); safeText("clockLiveTimer",hrs.toFixed(2)+" hrs"); safeText("clockLabor","$"+(hrs*rate).toFixed(2)); }
function sendClockToInvoice(){ const hrs=$("clockHours")?.textContent||"0.00"; setVal("laborHours",hrs); showScreen("invoice"); }

function dropGpsPin(){ if(!navigator.geolocation){ safeText("fieldOut","GPS not supported."); return; } safeText("fieldOut","Getting GPS..."); navigator.geolocation.getCurrentPosition(pos=>{ const c=`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`; setVal("fieldGps",c); safeText("fieldOut","GPS saved: "+c); },err=>safeText("fieldOut","GPS failed: "+err.message)); }
function openCurrentGpsMap(){ const c=getVal("fieldGps"); if(c) window.open(`https://maps.google.com/?q=${encodeURIComponent(c)}`,"_blank"); else alert("Drop GPS pin first."); }
function buildDotChecklistNote(){ safeText("fieldOut",`DOT/FIELD NOTE\nLocation: ${getVal("fieldLocationName")}\nGPS: ${getVal("fieldGps")}\nStatus: ${getVal("roadsideStatus")}\nETA: ${getVal("customerEta")}\nNote: ${getVal("fieldNote")}`); }
function copyCustomerUpdate(){ const msg=`Rolling Wrench update: ${getVal("roadsideStatus")}. ETA/Note: ${getVal("customerEta") || getVal("fieldNote")}`; navigator.clipboard?.writeText(msg); safeText("fieldOut","Customer update copied:\n"+msg); }

function scanVisionPhoto(){ safeText("visionOut","Vision scan placeholder. Browser OCR/AI hook comes next. For now, paste text into RAW TEXT and tap CLEAN TEXT."); }
function cleanVisionText(){ const raw=getVal("visionRaw"); const cleaned=raw.toUpperCase().replace(/[^A-Z0-9\- ]/g," ").replace(/\s+/g," ").trim(); setVal("visionClean",cleaned); safeText("visionOut","Cleaned scan text."); }
function sendVisionToParts(){ setVal("partq", getVal("visionClean")); showScreen("parts"); }
function sendVisionToVin(){ setVal("vinGlobal", getVal("visionClean")); showScreen("vin"); }
function clearVisionScan(){ ["visionRaw","visionClean","visionNote"].forEach(id=>setVal(id,"")); $("visionPreview")?.classList.remove("hasImage"); safeText("visionOut","Camera OCR ready."); }

function runBackendExpansionSearch(){ safeText("backendOut",`Backend search queued:\n${getVal("backendSearchQ")}\n\nSupabase RPC hook: universal_diesel_search.`); }
function queueStagingImport(){ safeText("backendOut",`Import note queued locally:\nSource: ${getVal("importSourceName")}\nCategory: ${getVal("importCategory")}\nNotes: ${getVal("importNotes")}`); }
async function testSupabaseConnection(){ initSupabase(); safeText("backendOut", supabaseClient ? "Supabase client initialized. Next test table/RPC." : "Supabase not configured in Settings."); }

function runAIBrainSearch(){ safeText("brainOut",`AI Brain search:\n${getVal("brainSearchText")}\n\nNext hook: embeddings + repair memory + manual/TSB chunks.`); }
function runHybridRagSearch(){ runAIBrainSearch(); }
function saveVerifiedRepairMemory(){ safeText("brainOut","Repair memory saved locally for test build. Backend table hook comes next."); }
function underConstruction(name){ alert(`${name} is staged in the clean build. Backend hooks come next.`); }

function bindImagePreview(inputId,imgId){
  const input=$(inputId), img=$(imgId);
  if(!input||!img) return;
  input.addEventListener("change", () => {
    const file=input.files?.[0];
    if(!file) return;
    img.src=URL.createObjectURL(file);
    img.classList.add("hasImage");
  });
}

window.addEventListener("error", e => {
  console.error(e.error || e.message);
});
