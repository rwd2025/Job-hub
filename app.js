const SUPABASE_URL = "https://uxpkqwcmvtqvubibbrek.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4cGtxd2NtdnRxdnViaWJicmVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMzk4NjQsImV4cCI6MjA5MjgxNTg2NH0.afiaSFqkRFEXW5nPQVRXKZcpKkS6iF3T_hTQC2P15HQ";
const API_URL = "https://uxpkqwcmvtqvubibbrek.supabase.co/functions/v1/oracle-parts-search";

const $ = id => document.getElementById(id);
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

function setValue(id,val){
  const el = $(id);
  if(el) el.value = val || "";
}

function safeText(value){
  return String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]));
}

let currentScreen = "home";
const screenHistory = [];

function showScreen(id){
  if(!$(id)) return;
  if(currentScreen && currentScreen !== id) screenHistory.push(currentScreen);
  currentScreen = id;
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  $(id).classList.add("active");

  document.querySelectorAll(".bottomNav button").forEach(b=>b.classList.remove("active"));

  const map = {home:1,dieselAI:2,faultDoctor:2,parts:3,schematics:4,repairHud:4,settings:5,invoice:5,team:5,voice:5,vin:1,timeClock:5,fieldTools:5,visionPro:3,backendPro:5};
  const index = map[id] || 1;
  const btn = document.querySelector(`.bottomNav button:nth-child(${index})`);
  if(btn) btn.classList.add("active");

  $("sideMenu")?.classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
}

function goBack(){
  const last = screenHistory.pop();
  if(last){
    const prev = currentScreen;
    currentScreen = last;
    document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
    if($(last)) $(last).classList.add("active");
    document.querySelectorAll(".bottomNav button").forEach(b=>b.classList.remove("active"));
    const map = {home:1,dieselAI:2,faultDoctor:2,parts:3,schematics:4,repairHud:4,settings:5,invoice:5,team:5,voice:5,vin:1,timeClock:5,fieldTools:5,visionPro:3,backendPro:5};
    const btn = document.querySelector(`.bottomNav button:nth-child(${map[last] || 1})`);
    if(btn) btn.classList.add("active");
    window.scrollTo({top:0,behavior:"smooth"});
    screenHistory.push(prev);
  }else{
    showScreen("home");
  }
}

function toggleSideMenu(){ $("sideMenu")?.classList.toggle("open"); }
function underConstruction(name){ alert(name + " is under construction.\n\nThis button is ready. Backend feature coming soon."); }

function getShop(){
  return {
    name:"Rolling Wrench Diesel LLC", phone:"260-502-6222", website:"www.rollingwrenchdiesel.com",
    laborRate:"135", serviceCall:"250", tax:"0", cardFee:"0",
    terms:"Payment due upon completion. Parts and labor warranty subject to shop policy.",
    ...JSON.parse(localStorage.getItem("shopSettings") || "{}")
  };
}

function saveSettings(){
  const shop = {
    name:$("shopName")?.value || "Rolling Wrench Diesel LLC",
    phone:$("shopPhone")?.value || "260-502-6222",
    website:$("shopWebsite")?.value || "www.rollingwrenchdiesel.com",
    laborRate:$("defaultLaborRate")?.value || "135",
    serviceCall:$("defaultServiceCall")?.value || "250",
    tax:$("defaultTax")?.value || "0",
    cardFee:$("defaultCardFee")?.value || "0",
    terms:$("shopTerms")?.value || ""
  };
  localStorage.setItem("shopSettings", JSON.stringify(shop));
  loadSettings();
  if($("settingsOut")) $("settingsOut").textContent = "Settings saved.";
}

function loadSettings(){
  const s = getShop();
  setValue("shopName",s.name); setValue("shopPhone",s.phone); setValue("shopWebsite",s.website);
  setValue("defaultLaborRate",s.laborRate); setValue("defaultServiceCall",s.serviceCall);
  setValue("defaultTax",s.tax); setValue("defaultCardFee",s.cardFee); setValue("shopTerms",s.terms);
  setValue("laborRate",s.laborRate); setValue("serviceCall",s.serviceCall); setValue("taxRate",s.tax); setValue("cardFee",s.cardFee);
}

function getActiveTruck(){ return JSON.parse(localStorage.getItem("activeTruck") || "{}"); }
function updateActiveTruckBar(){
  const t = getActiveTruck();
  if($("activeVin")) $("activeVin").textContent = t.vin || "NONE";
  if($("activeYear")) $("activeYear").textContent = t.year || "----";
  if($("activeMake")) $("activeMake").textContent = t.make || "----";
  if($("activeModel")) $("activeModel").textContent = t.model || "----";
  if($("activeEngine")) $("activeEngine").textContent = t.engine || "----";
  if($("activeEsn")) $("activeEsn").textContent = t.esn || "----";
  if($("activeCpl")) $("activeCpl").textContent = t.cpl || "----";
}

function saveActiveTruck(){
  const truck = {
    vin:$("vinGlobal")?.value.trim().toUpperCase() || "",
    year:$("yearGlobal")?.value.trim() || "",
    make:$("makeGlobal")?.value.trim() || "",
    model:$("modelGlobal")?.value.trim() || "",
    engine:$("engine")?.value.trim() || "",
    esn:$("esnGlobal")?.value.trim() || "",
    cpl:$("cplGlobal")?.value.trim() || ""
  };
  localStorage.setItem("activeTruck", JSON.stringify(truck));
  setValue("invoiceVin",truck.vin);
  setValue("invoiceTruck",`${truck.year} ${truck.make} ${truck.model}`.trim());
  updateActiveTruckBar();
  alert("Active truck saved.");
}

function loadActiveTruckIntoFields(){
  const t = getActiveTruck();
  if(!t.vin) return;
  setValue("vinGlobal",t.vin); setValue("yearGlobal",t.year); setValue("makeGlobal",t.make); setValue("modelGlobal",t.model);
  setValue("engine",t.engine); setValue("esnGlobal",t.esn); setValue("cplGlobal",t.cpl);
  setValue("invoiceVin",t.vin); setValue("invoiceTruck",`${t.year || ""} ${t.make || ""} ${t.model || ""}`.trim());
}

function clearVehicleData(){
  localStorage.removeItem("activeTruck");
  ["vinGlobal","yearGlobal","makeGlobal","modelGlobal","engine","esnGlobal","cplGlobal","invoiceVin","invoiceTruck"].forEach(id=>setValue(id,""));
  updateActiveTruckBar(); alert("Active truck cleared.");
}

function ctx(){
  const t=getActiveTruck();
  return `VIN: ${$("vinGlobal")?.value || $("invoiceVin")?.value || t.vin || "none"}\nYear: ${$("yearGlobal")?.value || t.year || "unknown"}\nMake: ${$("makeGlobal")?.value || t.make || "unknown"}\nModel: ${$("modelGlobal")?.value || t.model || "unknown"}\nEngine: ${$("engine")?.value || t.engine || "unknown"}\nESN: ${$("esnGlobal")?.value || t.esn || "unknown"}\nCPL: ${$("cplGlobal")?.value || t.cpl || "unknown"}`.trim();
}

async function callOracle(payload){
  const body = {
    vin: payload.vin ?? $("vinGlobal")?.value ?? $("invoiceVin")?.value ?? getActiveTruck().vin ?? null,
    esn: payload.esn ?? $("esnGlobal")?.value ?? getActiveTruck().esn ?? null,
    cpl: payload.cpl ?? $("cplGlobal")?.value ?? getActiveTruck().cpl ?? null,
    year: payload.year ?? $("yearGlobal")?.value ?? getActiveTruck().year ?? "",
    make: payload.make ?? $("makeGlobal")?.value ?? getActiveTruck().make ?? "",
    model: payload.model ?? $("modelGlobal")?.value ?? getActiveTruck().model ?? "",
    engine: payload.engine ?? $("engine")?.value ?? getActiveTruck().engine ?? "",
    mode: payload.mode || "diesel_doctor",
    part_query: payload.part_query || payload.question || payload.query || "",
    question: payload.question || payload.part_query || payload.query || "",
    note: payload.note || "",
    vehicleContext: ctx()
  };

  const res = await fetch(API_URL,{method:"POST",headers:{"Content-Type":"application/json","apikey":SUPABASE_KEY,"Authorization":"Bearer " + SUPABASE_KEY},body:JSON.stringify(body)});
  const data = await res.json().catch(()=>({error:"Invalid JSON response from backend"}));
  if(!res.ok) throw new Error(data.error || JSON.stringify(data));
  return data;
}

function formatOracleData(data){
  const d = data?.data || data || {};
  if(typeof data === "string") return data;
  if(data.answer) return data.answer;
  if(data.message) return data.message;
  return `PART: ${d.oem_part || d.part || "UNKNOWN"}\nYEAR: ${d.year || "UNKNOWN"}\nMAKE: ${d.make || "UNKNOWN"}\nMODEL: ${d.model || "UNKNOWN"}\nENGINE: ${d.engine || "UNKNOWN"}\nVIN: ${d.vin || "NO VIN"}\nESN: ${d.esn || "NO ESN"}\nCPL: ${d.cpl || "NO CPL"}\nFITMENT: ${d.verified_fitment ? "VIN / ESN / CPL CONTEXT PROVIDED" : "NEEDS VIN / ESN / CPL"}\n\nSOURCE: ${data.source || "oracle"}\n\nNOTES:\n${(d.notes || []).join("\n") || "No notes returned."}`.trim();
}

function renderOracleCard(targetId,title,data){
  const d = data?.data || {};
  const notes = Array.isArray(d.notes) ? d.notes.join("<br>") : (d.notes || data?.answer || "No notes returned.");
  $(targetId).innerHTML = `<div class="oracleCard"><div class="oracleTitle">${safeText(title)}</div><div class="vinGrid"><div><b>PART</b><span>${safeText(d.oem_part || d.part || "UNKNOWN")}</span></div><div><b>YEAR</b><span>${safeText(d.year || "UNKNOWN")}</span></div><div><b>MAKE</b><span>${safeText(d.make || "UNKNOWN")}</span></div><div><b>MODEL</b><span>${safeText(d.model || "UNKNOWN")}</span></div><div><b>ENGINE</b><span>${safeText(d.engine || "UNKNOWN")}</span></div><div><b>FITMENT</b><span>${d.verified_fitment ? "YES" : "NEEDS VIN / ESN"}</span></div><div><b>VIN</b><span>${safeText(d.vin || getActiveTruck().vin || "No VIN")}</span></div><div><b>SOURCE</b><span>${safeText(data?.source || "oracle")}</span></div></div><div class="oracleNote">${safeText(notes).replace(/\n/g,"<br>")}</div></div>`;
}

async function decodeVin(){
  const vin = $("vinGlobal")?.value.trim().toUpperCase() || "";
  if(!vin) return alert("Enter VIN first.");
  $("vinOut").textContent = "Decoding VIN...";
  try{
    const data = await callOracle({vin,part_query:"VIN decode",mode:"vin_decode"});
    const d = data?.data || {};
    setValue("yearGlobal",d.year || ""); setValue("makeGlobal",d.make || ""); setValue("modelGlobal",d.model || ""); setValue("engine",d.engine || "");
    if(d.esn) setValue("esnGlobal",d.esn); if(d.cpl) setValue("cplGlobal",d.cpl);
    saveActiveTruck();
    renderOracleCard("vinOut","VIN DECODE SUCCESS",data);
    $("vinOut").innerHTML += `<div class="smartNote">Saved as active truck.</div>`;
  }catch(e){ $("vinOut").textContent = "VIN ERROR: " + e.message; }
}

function smartSearchTerm(q, data){
  const d=data?.data||{};
  return d.oem_part || d.part || d.part_number || q || $("partNote")?.value.trim() || getActiveTruck().engine || "";
}

async function askPart(){
  const q = $("partq")?.value.trim() || "";
  const note = $("partNote")?.value.trim() || "";
  if(!q && !note){ $("partOut").textContent = "Enter part number, part name, VIN, ESN, CPL, or description."; return; }
  $("partOut").textContent = "Running Oracle + Universal Diesel Database...";

  try{
    const oracleData = await callOracle({part_query:q || note,note,mode:"parts_lookup"});
    renderOracleCard("partOut","ORACLE VERIFIED PART LOOKUP",oracleData);

    const term = smartSearchTerm(q || note, oracleData);
    const universal = await universalSearch(term);
    renderUniversalResults("partOut", universal, term);

    const repair = await getRepairKit(term);
    renderRepairKit("partOut", repair);
  }catch(e){
    $("partOut").textContent = "SEARCH ERROR: " + e.message;
  }
}

async function getRepairKit(component){
  if(!supabaseClient) throw new Error("Supabase client not loaded.");
  const term = String(component || "").trim();
  if(!term) return null;
  const { data, error } = await supabaseClient
    .from("repair_kits")
    .select("*")
    .or(`component_name.ilike.%${term}%,engine_family.ilike.%${term}%,oem_part_number.ilike.%${term}%`)
    .limit(3);
  if(error) return null;
  return data || [];
}

async function universalSearch(search){
  if(!supabaseClient) throw new Error("Supabase client not loaded.");
  const term = String(search || "").trim();
  if(!term) return {};
  const { data, error } = await supabaseClient.rpc("universal_diesel_search", { search_text: term });
  if(error) throw error;
  return data || {};
}

function card(title, badge, inner, note=""){
  return `<div class="smartCard"><div class="smartCardTitle"><span>${safeText(title)}</span>${badge?`<span class="badge ${badge.cls||""}">${safeText(badge.text)}</span>`:""}</div>${inner}${note?`<div class="smartNote">${safeText(note)}</div>`:""}</div>`;
}
function gridCell(k,v){ return `<div class="smartCell"><b>${safeText(k)}</b><span>${safeText(v || "—")}</span></div>`; }
function asArray(x){ return Array.isArray(x) ? x : []; }

function renderUniversalResults(targetId, universal, term){
  if(!universal || typeof universal !== "object") return;
  const pieces=[];
  const parts=asArray(universal.parts);
  const crosses=asArray(universal.cross_refs || universal.part_cross_refs);
  const torques=asArray(universal.torque_specs);
  const labor=asArray(universal.labor_times);
  const failures=asArray(universal.common_failures);
  const fluids=asArray(universal.fluids_filters);
  const tests=asArray(universal.diagnostic_tests);
  const suppliers=asArray(universal.supplier_links);

  if(parts.length){
    pieces.push(card("DATABASE PART MATCHES",{text:`${parts.length} HIT${parts.length>1?"S":""}`,cls:"good"},`<div class="smartGrid">${parts.slice(0,6).map(p=>gridCell(p.manufacturer || p.brand || "PART", `${p.part_number || p.oem_part_number || "UNKNOWN"} — ${p.description || p.category || ""}`)).join("")}</div>`));
  }
  if(crosses.length){
    pieces.push(card("OEM / AFTERMARKET CROSS REFERENCES",{text:`${crosses.length} REF${crosses.length>1?"S":""}`,cls:"hot"},`<div class="smartGrid">${crosses.slice(0,8).map(p=>gridCell(p.brand || p.source_name || "CROSS", `${p.oem_part_number || p.source_part || p.part_number || ""} → ${p.aftermarket_part_number || p.cross_part || p.cross_ref_number || ""} ${p.confidence_score ? "("+p.confidence_score+")" : ""}`)).join("")}</div>`));
  }
  if(labor.length){
    pieces.push(card("LABOR TIME",{text:"QUOTE READY",cls:"good"},`<div class="smartGrid">${labor.slice(0,4).map(l=>gridCell(l.component_name || l.labor_operation || "LABOR", `${l.labor_hours || "?"} hrs — ${l.difficulty || ""}`)).join("")}</div>`));
  }
  if(torques.length){
    pieces.push(card("TORQUE SPECS",{text:"VERIFY",cls:"warn"},`<div class="smartGrid">${torques.slice(0,6).map(t=>gridCell(t.fastener || t.component_name || "FASTENER", `${t.torque_value || "UNKNOWN"} ${t.sequence_notes || ""}`)).join("")}</div>`));
  }
  if(fluids.length){
    pieces.push(card("FLUIDS / FILTERS",{text:"SERVICE",cls:"good"},`<div class="smartGrid">${fluids.slice(0,4).map(f=>gridCell(f.engine_family || f.service_type || "SERVICE", [f.oil_filter,f.fuel_filter,f.water_separator,f.oil_capacity].filter(Boolean).join(" | "))).join("")}</div>`));
  }
  if(failures.length || tests.length){
    pieces.push(card("DIAGNOSTIC MEMORY",{text:"BUDDY",cls:"hot"},`<div class="smartGrid">${failures.slice(0,3).map(f=>gridCell(f.fault_code || f.symptom || "FAILURE", f.common_fix || f.likely_causes || "Check notes")).join("")}${tests.slice(0,3).map(t=>gridCell(t.test_name || t.fault_code || "TEST", t.pass_fail_specs || t.next_step_if_failed || "Run test")).join("")}</div>`));
  }
  if(suppliers.length){
    pieces.push(card("SUPPLIER LINKS",{text:"BUY",cls:"good"},`<div class="smartGrid">${suppliers.slice(0,4).map(s=>gridCell(s.supplier_name || "SUPPLIER", s.part_number || s.search_url || "")).join("")}</div>`));
  }
  if(!pieces.length){
    pieces.push(card("UNIVERSAL DATABASE",{text:"NO LOCAL HIT",cls:"warn"},`<div class="emptyNote">No local SQL database matches for “${safeText(term)}” yet. Add records to parts, part_cross_refs, repair_kits, labor_times, torque_specs, or common_failures.</div>`));
  }
  $(targetId).innerHTML += `<div class="resultGroup">${pieces.join("")}</div>`;
}

function renderRepairKit(targetId, kits){
  const list=asArray(kits);
  if(!list.length) return;
  for(const k of list.slice(0,3)){
    $(targetId).innerHTML += card("SMART REPAIR KIT",{text:"KIT",cls:"good"},`<div class="smartGrid">${gridCell("COMPONENT",k.component_name)}${gridCell("ENGINE",k.engine_family)}${gridCell("OEM PART",k.oem_part_number)}${gridCell("LABOR",k.labor_hours ? k.labor_hours+" hrs" : "—")}${gridCell("GASKETS",k.gasket_set)}${gridCell("SEALS",k.seals)}${gridCell("O-RINGS",k.o_rings)}${gridCell("HARDWARE",k.hardware)}</div>`, `${k.torque_specs || ""}\n${k.repair_notes || ""}`.trim());
  }
}


function clearPartFields(){
  setValue("partq","");
  setValue("partNote","");
  if($("partOut")) $("partOut").textContent = "Enter a part, VIN, ESN, CPL, or description.";
}

function getSavedParts(){
  return JSON.parse(localStorage.getItem("savedParts") || "[]");
}

function saveCurrentPart(){
  const q = $("partq")?.value.trim() || "";
  const note = $("partNote")?.value.trim() || "";
  const out = $("partOut")?.innerText.trim() || "";
  if(!q && !out){ alert("Lookup or enter a part first."); return; }
  const list = getSavedParts();
  list.unshift({
    query:q || "Saved part",
    note,
    result:out.slice(0,900),
    truck:getActiveTruck(),
    saved_at:new Date().toLocaleString()
  });
  localStorage.setItem("savedParts", JSON.stringify(list.slice(0,50)));
  renderSavedParts();
  alert("Part saved.");
}

function renderSavedParts(){
  const box = $("savedPartsOut");
  if(!box) return;
  const list = getSavedParts();
  if(!list.length){ box.textContent = "Saved parts will appear here."; return; }
  box.innerHTML = `<div class="smartCardTitle"><span>SAVED PARTS</span><span class="badge good">${list.length}</span></div>` +
    list.slice(0,5).map((p,i)=>`<div class="smartNote"><b>${i+1}. ${safeText(p.query)}</b><br>${safeText(p.saved_at)}<br>${safeText(p.note || "")}</div>`).join("");
}

function getClock(){
  return JSON.parse(localStorage.getItem("jobClock") || "{}");
}
function saveClock(c){ localStorage.setItem("jobClock", JSON.stringify(c)); }
function clockIn(){
  const c = getClock();
  c.start = new Date().toISOString();
  c.stop = null;
  saveClock(c);
  renderClock();
}
function clockOut(){
  const c = getClock();
  if(!c.start){ alert("Clock in first."); return; }
  c.stop = new Date().toISOString();
  saveClock(c);
  renderClock();
}
function resetClock(){
  if(!confirm("Reset job clock?")) return;
  localStorage.removeItem("jobClock");
  renderClock();
}
function clockHours(c){
  if(!c.start) return 0;
  const start = new Date(c.start);
  const stop = c.stop ? new Date(c.stop) : new Date();
  return Math.max(0,(stop-start)/36e5);
}
function renderClock(){
  const c = getClock();
  const h = clockHours(c);
  const rate = Number($("laborRate")?.value || getShop().laborRate || 135);
  if($("clockStart")) $("clockStart").textContent = c.start ? new Date(c.start).toLocaleString() : "--";
  if($("clockStop")) $("clockStop").textContent = c.stop ? new Date(c.stop).toLocaleString() : "--";
  if($("clockHours")) $("clockHours").textContent = h.toFixed(2);
  if($("clockLabor")) $("clockLabor").textContent = money(h * rate);
}
function sendClockToInvoice(){
  const c = getClock();
  const h = clockHours(c);
  setValue("laborHours", h.toFixed(2));
  showScreen("invoice");
}

async function runDoctorSearch(){
  const q = $("doctorAsk")?.value.trim() || "";
  if(!q){ $("doctorOut").textContent = "Ask Diesel Doctor a question first."; return; }
  $("doctorOut").textContent = "Diesel Doctor thinking...";
  try{
    const data = await callOracle({part_query:q,question:q,mode:"global_doctor_search"});
    $("doctorOut").textContent = formatOracleData(data);
  }catch(e){ $("doctorOut").textContent = "Diesel Doctor error: " + e.message; }
}

async function homeAI(){
  const q = $("homeAiAsk")?.value.trim() || "";
  const file = $("homeAiImage")?.files?.[0];
  if(!q && !file){ $("homeAiOut").textContent = "Ask Diesel AI a question or add a picture."; return; }
  $("homeAiOut").textContent = file ? "Reading picture..." : "Thinking...";
  let note = "";
  if(file){ const base64 = await imageToBase64(file); note = { image:base64.split(",")[1], question:q || "Analyze uploaded image" }; }
  try{
    const data = await callOracle({part_query:q || "Analyze uploaded image",question:q || "Analyze uploaded image",mode:"diesel_ai",note});
    $("homeAiOut").textContent = formatOracleData(data);
  }catch(e){ $("homeAiOut").textContent = "Diesel AI error: " + e.message; }
}

async function runDiag(){
  const q = $("diagq")?.value.trim() || "";
  const note = $("diagNote")?.value.trim() || "";
  if(!q){ $("diagOut").textContent = "Enter fault code or symptom first."; return; }
  $("diagOut").textContent = "Fault Doctor running Oracle + Diesel Brain...";
  if($("intelOut")) $("intelOut").textContent = "Searching Diesel Brain memory...";
  try{
    const data = await callOracle({part_query:q,question:q,note,mode:"fault_doctor"});
    renderDiagnosticOracle("diagOut", data, q);
    await renderDieselIntelligence(q, note);
  }catch(e){
    $("diagOut").textContent = "DIAGNOSTIC ERROR: " + e.message;
    try{ await renderDieselIntelligence(q, note); }catch(_){}
  }
}


function renderDiagnosticOracle(targetId, data, query){
  const d = data?.data || data || {};
  const answer = data?.answer || data?.message || d.answer || "";
  const html = `
    <div class="oracleCard diagCard">
      <div class="oracleTitle">FAULT DOCTOR ORACLE</div>
      <div class="smartGrid">
        ${gridCell("QUERY", query || "—")}
        ${gridCell("ENGINE", d.engine || getActiveTruck().engine || "UNKNOWN")}
        ${gridCell("VIN", d.vin || getActiveTruck().vin || "NO VIN")}
        ${gridCell("SOURCE", data?.source || "oracle")}
      </div>
      <div class="oracleNote" style="white-space:pre-wrap;">${safeText(answer || formatOracleData(data))}</div>
    </div>`;
  if($(targetId)) $(targetId).innerHTML = html;
}

function extractFaultTerms(q){
  const text = String(q || "").toUpperCase();
  const out = [];
  const spn = text.match(/SPN\s*([0-9]+)/i);
  const fmi = text.match(/FMI\s*([0-9]+)/i);
  if(spn) out.push("SPN " + spn[1]);
  if(fmi) out.push("FMI " + fmi[1]);
  if(spn && fmi) out.push("SPN " + spn[1] + " FMI " + fmi[1]);
  text.split(/[^A-Z0-9]+/).filter(w=>w.length>3).slice(0,8).forEach(w=>out.push(w));
  return [...new Set(out)];
}

async function dieselBrainSearch(search, note=""){
  if(!supabaseClient) throw new Error("Supabase client not loaded.");
  const term = String(search || "").trim();
  if(!term) return { common_failures:[], diagnostic_tests:[], known_patterns:[], repair_memory:[] };

  let rpcData = null;
  try{
    const { data, error } = await supabaseClient.rpc("diesel_brain_search", { search_text: term, vin_text: activeVin() || null });
    if(error) throw error;
    rpcData = data;
  }catch(e){
    console.warn("diesel_brain_search RPC fallback", e.message);
  }

  if(rpcData) return rpcData;

  const [failures, tests, notes] = await Promise.all([
    supabaseClient.from("common_failures").select("*").or(`fault_code.ilike.%${term}%,symptom.ilike.%${term}%,engine_family.ilike.%${term}%,likely_causes.ilike.%${term}%,common_fix.ilike.%${term}%`).limit(8),
    supabaseClient.from("diagnostic_tests").select("*").or(`fault_code.ilike.%${term}%,symptom.ilike.%${term}%,engine_family.ilike.%${term}%,test_name.ilike.%${term}%`).limit(8),
    supabaseClient.from("repair_notes").select("*").or(`symptom.ilike.%${term}%,repair_action.ilike.%${term}%`).limit(8)
  ]);

  return {
    common_failures: failures.data || [],
    diagnostic_tests: tests.data || [],
    known_patterns: [],
    repair_memory: notes.data || []
  };
}

function renderIntelligenceCards(data, q){
  const failures = asArray(data.common_failures);
  const tests = asArray(data.diagnostic_tests);
  const patterns = asArray(data.known_patterns);
  const memory = asArray(data.repair_memory || data.repair_notes);
  const pieces = [];

  if(failures.length){
    pieces.push(card("LIKELY ROOT CAUSES", {text:`${failures.length} HIT${failures.length>1?"S":""}`, cls:"hot"},
      `<div class="smartGrid">${failures.slice(0,6).map((f,i)=>gridCell(`#${i+1} ${f.fault_code || f.symptom || "CAUSE"}`, `${f.likely_causes || ""} → ${f.common_fix || ""}`)).join("")}</div>`,
      "Ranked from Diesel Brain database. Verify readings before replacing parts."));
  }

  if(tests.length){
    pieces.push(card("DEALER-STYLE TEST STEPS", {text:"GUIDED", cls:"good"},
      `<div class="smartGrid">${tests.slice(0,5).map(t=>gridCell(t.test_name || t.fault_code || "TEST", `${t.test_steps || ""} ${t.pass_fail_specs ? " | SPEC: "+t.pass_fail_specs : ""}`)).join("")}</div>`));
  }

  if(patterns.length){
    pieces.push(card("KNOWN BAD ENGINE PATTERNS", {text:"WATCH", cls:"warn"},
      `<div class="smartGrid">${patterns.slice(0,5).map(p=>gridCell(p.engine_family || p.platform || "PATTERN", `${p.pattern || p.symptom || ""} ${p.warning || p.common_fix || ""}`)).join("")}</div>`));
  }

  if(memory.length){
    pieces.push(card("SHOP REPAIR MEMORY", {text:`${memory.length} NOTE${memory.length>1?"S":""}`, cls:"good"},
      `<div class="smartGrid">${memory.slice(0,6).map(m=>gridCell(m.verified_fix ? "VERIFIED FIX" : "REPAIR NOTE", `${m.symptom || ""} → ${m.repair_action || m.notes || ""}`)).join("")}</div>`));
  }

  if(!pieces.length){
    pieces.push(card("DIESEL BRAIN", {text:"NO LOCAL MATCH", cls:"warn"},
      `<div class="smartGrid">${gridCell("SEARCH", q)}${gridCell("NEXT STEP", "Save confirmed fixes to build shop memory.")}</div>`,
      "No local diagnostic match yet. Oracle result above may still help."));
  }

  return pieces.join("");
}

async function renderDieselIntelligence(q, note=""){
  const box = $("intelOut") || $("diagOut");
  if(box) box.textContent = "Searching Diesel Brain...";
  const terms = extractFaultTerms(q);
  let all = { common_failures:[], diagnostic_tests:[], known_patterns:[], repair_memory:[] };
  const searches = [q, ...terms].filter(Boolean).slice(0,5);
  for(const s of searches){
    try{
      const data = await dieselBrainSearch(s, note);
      all.common_failures.push(...asArray(data.common_failures));
      all.diagnostic_tests.push(...asArray(data.diagnostic_tests));
      all.known_patterns.push(...asArray(data.known_patterns));
      all.repair_memory.push(...asArray(data.repair_memory || data.repair_notes));
    }catch(e){
      console.warn("Diesel brain term failed", s, e.message);
    }
  }
  // simple de-dupe by JSON id / content
  for(const k of Object.keys(all)){
    const seen = new Set();
    all[k] = all[k].filter(x=>{ const key = x.id || JSON.stringify(x).slice(0,160); if(seen.has(key)) return false; seen.add(key); return true; });
  }
  if(box) box.innerHTML = renderIntelligenceCards(all, q);
  return all;
}

async function runIntelligenceOnly(){
  const q = $("diagq")?.value.trim() || $("doctorAsk")?.value.trim() || "";
  const note = $("diagNote")?.value.trim() || "";
  if(!q){ alert("Enter a fault code or symptom first."); return; }
  try{ await renderDieselIntelligence(q, note); }catch(e){ if($("intelOut")) $("intelOut").textContent = "Diesel Brain error: " + e.message; }
}

async function saveVerifiedFix(){
  const symptom = $("diagq")?.value || $("doctorAsk")?.value || "";
  const action = $("diagOut")?.innerText || $("intelOut")?.innerText || $("laborDesc")?.value || "";
  if(!symptom || !action){ alert("Run a diagnostic and add a symptom first."); return; }
  try{
    await cloudInsert("repair_notes", { vin: activeVin(), symptom, repair_action: action.slice(0,1800), verified_fix: true });
    await saveTruckHistoryCloud("verified_fix", `${symptom}\n${action.slice(0,600)}`);
    alert("Verified fix saved to Diesel Brain memory.");
  }catch(e){
    alert("Verified fix save failed: " + e.message);
  }
}

function clearDiagFields(){
  setValue("diagq", "");
  setValue("diagNote", "");
  if($("diagOut")) $("diagOut").textContent = "Enter fault code or symptom.";
  if($("intelOut")) $("intelOut").textContent = "Diesel Brain results will appear here.";
}

function imageToBase64(file){ return new Promise((resolve,reject)=>{ const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); }); }
function wireImagePreview(){
  const input = $("homeAiImage"), preview = $("homeAiPreview");
  if(!input || !preview) return;
  input.addEventListener("change",()=>{ const file = input.files?.[0]; if(!file) return; preview.src = URL.createObjectURL(file); preview.style.display = "block"; });
}

function money(n){ return "$" + Number(n || 0).toFixed(2); }
function buildInvoice(){
  const shop = getShop();
  const h = Number($("laborHours")?.value || 0), r = Number($("laborRate")?.value || 0), service = Number($("serviceCall")?.value || 0), parts = Number($("partsCost")?.value || 0), taxPct = Number($("taxRate")?.value || 0), cardPct = Number($("cardFee")?.value || 0);
  const labor = h*r, subtotal=labor+service+parts, tax=subtotal*(taxPct/100), card=(subtotal+tax)*(cardPct/100), total=subtotal+tax+card;
  const txt = `${shop.name}\n${shop.phone}\n${shop.website}\n\nCUSTOMER:\n${$("custName")?.value || ""}\n${$("custPhone")?.value || ""}\n\nVEHICLE:\n${$("invoiceTruck")?.value || ""}\nVIN: ${$("invoiceVin")?.value || ""}\n\nWORK:\n${$("laborDesc")?.value || ""}\n\nLabor: ${money(labor)}\nService Call: ${money(service)}\nParts: ${money(parts)}\nTax: ${money(tax)}\nCard Fee: ${money(card)}\n\nTOTAL DUE:\n${money(total)}\n\nTERMS:\n${shop.terms}`.trim();
  $("quoteOut").textContent = txt;
}
function copyText(id){ const text = $(id)?.textContent || ""; navigator.clipboard?.writeText(text); alert("Copied."); }
function findNearestDealer(){
  if(!navigator.geolocation){ alert("GPS not supported."); return; }
  navigator.geolocation.getCurrentPosition(pos=>{ const q = "FleetPride OR Cummins Dealer OR Kenworth OR Peterbilt OR Freightliner Parts"; window.open(`https://www.google.com/maps/search/${encodeURIComponent(q)}/@${pos.coords.latitude},${pos.coords.longitude},12z`,"_blank"); },()=>alert("Location permission denied."));
}
function startVoiceInput(){
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SpeechRecognition){ alert("Voice input not supported on this browser yet."); return; }
  const recognition = new SpeechRecognition(); recognition.lang = "en-US"; recognition.onresult = e=>{ const text = e.results[0][0].transcript; if($("homeAiAsk")) $("homeAiAsk").value = text; if($("doctorAsk")) $("doctorAsk").value = text; }; recognition.start();
}
const VoiceNavigator = {active:false,toggle(){this.active=!this.active; const btn=$("voice-toggle"); if(btn) btn.textContent=`VOICE: ${this.active ? "ON" : "OFF"}`; if(this.active) this.speak("Diesel Doctor Voice Navigator active. Backend feature coming soon.");},speak(text){if(!("speechSynthesis" in window)) return; const msg = new SpeechSynthesisUtterance(text); msg.rate=.9; window.speechSynthesis.speak(msg);}};

window.addEventListener("error",e=>{ localStorage.setItem("diesel_doctor_last_error",`${e.message} line ${e.lineno}`); });
window.addEventListener("DOMContentLoaded",()=>{ loadSettings(); loadActiveTruckIntoFields(); updateActiveTruckBar(); wireImagePreview(); renderSavedParts(); renderClock(); setInterval(renderClock,30000); });


/* =========================
   FULL SHOP FEATURE PACK
   ========================= */
function getInvoiceParts(){
  try{return JSON.parse(localStorage.getItem("invoiceParts") || "[]");}catch(e){return []}
}
function saveInvoiceParts(list){
  localStorage.setItem("invoiceParts", JSON.stringify((list||[]).slice(0,100)));
  renderInvoiceParts();
}
function partPhotoData(){
  return localStorage.getItem("currentPartPhoto") || "";
}
function partRowHtml(p,i,withRemove=true){
  const qty = Number(p.qty || 1), price = Number(p.price || 0), total = qty * price;
  return `<div class="invoiceLine">
    <b>${safeText(p.name || "Part")}</b> <span class="totalBadge">${money(total)}</span>
    <small>Part #: ${safeText(p.number || "N/A")} | Qty: ${qty} | Unit: ${money(price)} | Supplier: ${safeText(p.supplier || "")}</small>
    ${p.note ? `<small>${safeText(p.note)}</small>` : ""}
    ${p.photo ? `<img class="partThumb" src="${p.photo}" alt="part photo">` : ""}
    ${withRemove ? `<button class="secondaryBtn" onclick="removeInvoicePart(${i})">REMOVE</button>` : ""}
  </div>`;
}
function renderInvoiceParts(){
  const parts = getInvoiceParts();
  const total = parts.reduce((sum,p)=>sum + Number(p.qty||1)*Number(p.price||0),0);
  const html = parts.length
    ? `<div class="smartCardTitle"><span>INVOICE PARTS</span><span class="totalBadge">${money(total)}</span></div><div class="partsList">${parts.map((p,i)=>partRowHtml(p,i,true)).join("")}</div>`
    : "Invoice parts will appear here.";
  if($("invoicePartsOut")) $("invoicePartsOut").innerHTML = html;
  if($("invoicePartsOutInvoice")) $("invoicePartsOutInvoice").innerHTML = html;
}
function removeInvoicePart(i){
  const list=getInvoiceParts(); list.splice(i,1); saveInvoiceParts(list);
}
function clearInvoiceParts(){
  if(!confirm("Clear all invoice parts?")) return;
  saveInvoiceParts([]);
}
function addManualPartToInvoice(){
  const p={
    name:$("manualPartName")?.value.trim() || $("partq")?.value.trim() || "Part",
    number:$("manualPartNumber")?.value.trim() || "",
    qty:Number($("manualPartQty")?.value || 1),
    price:Number($("manualPartPrice")?.value || 0),
    supplier:$("manualPartSupplier")?.value.trim() || "",
    note:$("partNote")?.value.trim() || "",
    photo:partPhotoData(),
    truck:getActiveTruck(),
    added_at:new Date().toLocaleString()
  };
  if(!p.name && !p.number){ alert("Enter a part name or part number."); return; }
  const list=getInvoiceParts(); list.push(p); saveInvoiceParts(list);
  alert("Part added to invoice.");
}
function addLookupToInvoice(){
  const q=$("partq")?.value.trim() || "Lookup result";
  const out=$("partOut")?.innerText.trim() || "";
  const p={name:q,number:$("manualPartNumber")?.value.trim() || "",qty:Number($("manualPartQty")?.value || 1),price:Number($("manualPartPrice")?.value || 0),supplier:$("manualPartSupplier")?.value.trim() || "Lookup",note:out.slice(0,800),photo:partPhotoData(),truck:getActiveTruck(),added_at:new Date().toLocaleString()};
  const list=getInvoiceParts(); list.push(p); saveInvoiceParts(list); alert("Lookup result added to invoice.");
}
function wirePartPhoto(){
  const input=$("partPhoto"), preview=$("partPhotoPreview");
  if(!input || !preview) return;
  input.addEventListener("change",()=>{
    const file=input.files?.[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=()=>{ localStorage.setItem("currentPartPhoto", reader.result); preview.src=reader.result; preview.style.display="block"; };
    reader.readAsDataURL(file);
  });
}
function startPartVoiceInput(){
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SpeechRecognition){ alert("Voice input not supported on this browser."); return; }
  const r=new SpeechRecognition(); r.lang="en-US";
  r.onresult=e=>{ const text=e.results[0][0].transcript; setValue("partq", text); setValue("manualPartName", text); };
  r.start();
}
const oldClearPartFields = clearPartFields;
clearPartFields = function(){
  oldClearPartFields();
  ["manualPartName","manualPartNumber","manualPartPrice","manualPartSupplier"].forEach(id=>setValue(id,""));
  setValue("manualPartQty","1");
  localStorage.removeItem("currentPartPhoto");
  if($("partPhotoPreview")){ $("partPhotoPreview").src=""; $("partPhotoPreview").style.display="none"; }
};

function invoicePartsTotal(){return getInvoiceParts().reduce((s,p)=>s+Number(p.qty||1)*Number(p.price||0),0);}
function invoicePartsText(){
  const parts=getInvoiceParts();
  if(!parts.length) return "No line-item parts added.";
  return parts.map((p,i)=>`${i+1}. ${p.name || "Part"} | #${p.number || "N/A"} | Qty ${p.qty || 1} | ${money(p.price || 0)} each | ${money(Number(p.qty||1)*Number(p.price||0))} | ${p.supplier || ""}`).join("\n");
}
buildInvoice = function(){
  const shop=getShop();
  const h=Number($("laborHours")?.value||0), r=Number($("laborRate")?.value||0), service=Number($("serviceCall")?.value||0);
  const manualParts=Number($("partsCost")?.value||0), lineParts=invoicePartsTotal();
  const taxPct=Number($("taxRate")?.value||0), cardPct=Number($("cardFee")?.value||0);
  const labor=h*r, parts=manualParts+lineParts, subtotal=labor+service+parts, tax=subtotal*(taxPct/100), card=(subtotal+tax)*(cardPct/100), total=subtotal+tax+card;
  const txt=`${shop.name}\n${shop.phone}\n${shop.website}\n\nCUSTOMER:\n${$("custName")?.value || ""}\n${$("custPhone")?.value || ""}\n\nVEHICLE:\n${$("invoiceTruck")?.value || ""}\nVIN: ${$("invoiceVin")?.value || ""}\n\nWORK:\n${$("laborDesc")?.value || ""}\n\nPARTS:\n${invoicePartsText()}\n\nLabor: ${money(labor)}\nService Call: ${money(service)}\nParts: ${money(parts)}\nTax: ${money(tax)}\nCard Fee: ${money(card)}\n\nTOTAL DUE:\n${money(total)}\n\nTERMS:\n${shop.terms}`.trim();
  if($("quoteOut")) $("quoteOut").textContent=txt;
  return {shop,h,r,service,parts,labor,tax,card,total,text:txt,invoiceParts:getInvoiceParts()};
};
function getSavedInvoices(){try{return JSON.parse(localStorage.getItem("savedInvoices")||"[]");}catch(e){return []}}
function saveInvoice(){
  const built=buildInvoice();
  const inv={id:Date.now(),customer:$("custName")?.value||"",phone:$("custPhone")?.value||"",truck:$("invoiceTruck")?.value||"",vin:$("invoiceVin")?.value||"",laborHours:$("laborHours")?.value||"",laborRate:$("laborRate")?.value||"",serviceCall:$("serviceCall")?.value||"",partsCost:$("partsCost")?.value||"",taxRate:$("taxRate")?.value||"",cardFee:$("cardFee")?.value||"",laborDesc:$("laborDesc")?.value||"",parts:getInvoiceParts(),output:built.text,total:built.total,saved_at:new Date().toLocaleString()};
  const list=getSavedInvoices(); list.unshift(inv); localStorage.setItem("savedInvoices", JSON.stringify(list.slice(0,50))); renderSavedInvoices(); alert("Invoice saved.");
}
function loadInvoice(i){
  const inv=getSavedInvoices()[i]; if(!inv){alert("Invoice not found."); return;}
  setValue("custName",inv.customer); setValue("custPhone",inv.phone); setValue("invoiceTruck",inv.truck); setValue("invoiceVin",inv.vin); setValue("laborHours",inv.laborHours); setValue("laborRate",inv.laborRate); setValue("serviceCall",inv.serviceCall); setValue("partsCost",inv.partsCost); setValue("taxRate",inv.taxRate); setValue("cardFee",inv.cardFee); setValue("laborDesc",inv.laborDesc);
  saveInvoiceParts(inv.parts||[]); if($("quoteOut")) $("quoteOut").textContent=inv.output||""; showScreen("invoice");
}
function loadLastInvoice(){loadInvoice(0)}
function renderSavedInvoices(){
  const box=$("savedInvoicesOut"); if(!box) return; const list=getSavedInvoices();
  if(!list.length){ box.textContent="Saved invoices will appear here."; return; }
  box.innerHTML=`<div class="smartCardTitle"><span>SAVED INVOICES</span><span class="badge good">${list.length}</span></div>` + list.slice(0,8).map((inv,i)=>`<div class="invoiceLine"><b>${safeText(inv.customer || "Invoice")}</b> <span class="totalBadge">${money(inv.total||0)}</span><small>${safeText(inv.saved_at)} | ${safeText(inv.truck)} | VIN ${safeText(inv.vin)}</small><button class="secondaryBtn" onclick="loadInvoice(${i})">LOAD</button></div>`).join("");
}
function clearInvoiceForm(){
  if(!confirm("Clear invoice fields?")) return;
  ["custName","custPhone","invoiceTruck","invoiceVin","laborHours","partsCost","laborDesc"].forEach(id=>setValue(id,""));
  loadSettings(); if($("quoteOut")) $("quoteOut").textContent="Invoice output will appear here.";
}

const oldSaveCurrentPart = saveCurrentPart;
saveCurrentPart = function(){
  const q=$("partq")?.value.trim() || $("manualPartName")?.value.trim() || $("manualPartNumber")?.value.trim() || "Saved part";
  const note=$("partNote")?.value.trim() || "";
  const out=$("partOut")?.innerText.trim() || "";
  const list=getSavedParts();
  list.unshift({query:q,number:$("manualPartNumber")?.value.trim()||"",supplier:$("manualPartSupplier")?.value.trim()||"",price:$("manualPartPrice")?.value||"",note,result:out.slice(0,900),photo:partPhotoData(),truck:getActiveTruck(),saved_at:new Date().toLocaleString()});
  localStorage.setItem("savedParts", JSON.stringify(list.slice(0,50))); renderSavedParts(); alert("Part saved.");
};
renderSavedParts = function(){
  const box=$("savedPartsOut"); if(!box) return; const list=getSavedParts();
  if(!list.length){ box.textContent="Saved parts will appear here."; return; }
  box.innerHTML=`<div class="smartCardTitle"><span>SAVED PARTS</span><span class="badge good">${list.length}</span></div><div class="partsList">` + list.slice(0,8).map((p,i)=>`<div class="partLine"><b>${safeText(p.query)}</b><small>${safeText(p.saved_at)} | #${safeText(p.number||"")} | ${safeText(p.supplier||"")} | ${safeText(p.price?money(p.price):"")}</small>${p.photo?`<img class="partThumb" src="${p.photo}" alt="saved part">`:""}<button class="secondaryBtn" onclick="addSavedPartToInvoice(${i})">ADD TO INVOICE</button></div>`).join("") + `</div>`;
};
function addSavedPartToInvoice(i){
  const p=getSavedParts()[i]; if(!p) return;
  const list=getInvoiceParts(); list.push({name:p.query,number:p.number,qty:1,price:Number(p.price||0),supplier:p.supplier,note:p.note||p.result||"",photo:p.photo||"",truck:p.truck,added_at:new Date().toLocaleString()}); saveInvoiceParts(list); alert("Saved part added to invoice.");
}

window.addEventListener("DOMContentLoaded",()=>{ wirePartPhoto(); renderInvoiceParts(); renderSavedInvoices(); renderSavedParts(); renderClock(); });


/* ===============================
   PHASE 1 SHOP OS CLOUD WIRING
   saved_jobs • saved_parts • labor_clock • truck_history • repair_notes
   =============================== */
function cloudReady(){
  return !!supabaseClient;
}
function activeVin(){
  return ($("invoiceVin")?.value || $("vinGlobal")?.value || getActiveTruck().vin || "").trim().toUpperCase();
}
function activeTruckText(){
  const t = getActiveTruck();
  return ($("invoiceTruck")?.value || `${t.year || ""} ${t.make || ""} ${t.model || ""}`.trim() || "").trim();
}
async function cloudInsert(table, payload){
  if(!cloudReady()) throw new Error("Supabase client not loaded.");
  const { data, error } = await supabaseClient.from(table).insert(payload).select().limit(1);
  if(error) throw error;
  return data?.[0] || null;
}
async function cloudSelect(table, vin, limit=20){
  if(!cloudReady()) throw new Error("Supabase client not loaded.");
  let q = supabaseClient.from(table).select("*").order("created_at", { ascending:false }).limit(limit);
  if(vin) q = q.eq("vin", vin);
  const { data, error } = await q;
  if(error) throw error;
  return data || [];
}
async function saveTruckHistoryCloud(eventType, notes){
  try{
    await cloudInsert("truck_history", {
      vin: activeVin(),
      event_type: eventType || "job_event",
      notes: notes || ""
    });
  }catch(e){
    console.warn("Truck history cloud save failed", e.message);
  }
}
async function saveJobCloud(){
  const built = buildInvoice ? buildInvoice() : {text:$("quoteOut")?.textContent || "", total:0, labor:0, parts:0};
  const t = getActiveTruck();
  const payload = {
    vin: activeVin(),
    year: $("yearGlobal")?.value || t.year || "",
    make: $("makeGlobal")?.value || t.make || "",
    model: $("modelGlobal")?.value || t.model || "",
    engine: $("engine")?.value || t.engine || "",
    customer_name: $("custName")?.value || "",
    customer_phone: $("custPhone")?.value || "",
    complaint: $("complaintText")?.value || "",
    cause: $("causeText")?.value || "",
    correction: $("correctionText")?.value || $("laborDesc")?.value || "",
    labor_hours: Number($("laborHours")?.value || 0),
    labor_total: Number(built.labor || 0),
    parts_total: Number(built.parts || 0),
    grand_total: Number(built.total || 0),
    invoice_text: built.text || $("quoteOut")?.textContent || ""
  };
  try{
    await cloudInsert("saved_jobs", payload);
    await saveTruckHistoryCloud("saved_job", `Saved job: ${payload.customer_name || "customer"} / ${payload.complaint || "no complaint entered"}`);
    if($("cloudHistoryOut")) $("cloudHistoryOut").innerHTML = `<span class="cloudOk">Cloud job saved.</span>`;
    alert("Job saved to Supabase.");
  }catch(e){
    const msg = "Cloud save failed: " + e.message;
    if($("cloudHistoryOut")) $("cloudHistoryOut").innerHTML = `<span class="cloudWarn">${safeText(msg)}</span>`;
    alert(msg);
  }
}
async function loadJobHistoryCloud(){
  const box = $("cloudHistoryOut");
  const vin = activeVin();
  if(box) box.textContent = "Loading cloud history...";
  try{
    const rows = await cloudSelect("saved_jobs", vin, 15);
    if(!box) return;
    if(!rows.length){ box.textContent = vin ? "No cloud jobs saved for this VIN yet." : "No cloud jobs found."; return; }
    box.innerHTML = `<div class="smartCardTitle"><span>CLOUD JOB HISTORY</span><span class="badge good">${rows.length}</span></div>` + rows.map((r,i)=>`
      <div class="invoiceLine">
        <b>${safeText(r.customer_name || "Saved Job")}</b> <span class="totalBadge">${money(r.grand_total || 0)}</span>
        <small>${safeText(new Date(r.created_at).toLocaleString())} | VIN ${safeText(r.vin || "")}</small>
        <small>Complaint: ${safeText(r.complaint || "")}</small>
        <small>Correction: ${safeText(r.correction || "")}</small>
        <button class="secondaryBtn" onclick="loadCloudJobToInvoice(${i})">LOAD TO INVOICE</button>
      </div>`).join("");
    window.__cloudJobs = rows;
  }catch(e){
    if(box) box.innerHTML = `<span class="cloudWarn">Cloud history error: ${safeText(e.message)}</span>`;
  }
}
function loadCloudJobToInvoice(i){
  const r = (window.__cloudJobs || [])[i];
  if(!r) return alert("Cloud job not found.");
  setValue("custName", r.customer_name || "");
  setValue("custPhone", r.customer_phone || "");
  setValue("invoiceTruck", `${r.year || ""} ${r.make || ""} ${r.model || ""}`.trim());
  setValue("invoiceVin", r.vin || "");
  setValue("laborHours", r.labor_hours || "");
  setValue("complaintText", r.complaint || "");
  setValue("causeText", r.cause || "");
  setValue("correctionText", r.correction || "");
  setValue("laborDesc", r.correction || "");
  if($("quoteOut")) $("quoteOut").textContent = r.invoice_text || "";
  showScreen("invoice");
}

const __phase1_oldSaveActiveTruck = saveActiveTruck;
saveActiveTruck = function(){
  __phase1_oldSaveActiveTruck();
  saveTruckHistoryCloud("active_truck_saved", ctx()).catch(()=>{});
};

const __phase1_oldClockIn = clockIn;
clockIn = function(){
  __phase1_oldClockIn();
  const c = getClock();
  cloudInsert("labor_clock", {
    vin: activeVin(),
    technician: "Rolling Wrench Diesel",
    start_time: c.start,
    stop_time: null,
    labor_hours: 0,
    notes: "Clock started from Rolling Cecil AI"
  }).then(row=>{
    if(row?.id){ c.cloud_id = row.id; saveClock(c); }
  }).catch(e=>console.warn("Clock cloud start failed", e.message));
};

const __phase1_oldClockOut = clockOut;
clockOut = function(){
  __phase1_oldClockOut();
  const c = getClock();
  const h = clockHours(c);
  if(!c.cloud_id){
    cloudInsert("labor_clock", {
      vin: activeVin(),
      technician: "Rolling Wrench Diesel",
      start_time: c.start,
      stop_time: c.stop,
      labor_hours: h,
      notes: "Clock completed from Rolling Cecil AI"
    }).catch(e=>console.warn("Clock cloud save failed", e.message));
    return;
  }
  supabaseClient.from("labor_clock").update({stop_time:c.stop,labor_hours:h,notes:"Clock completed from Rolling Cecil AI"}).eq("id", c.cloud_id)
    .then(({error})=>{ if(error) console.warn("Clock cloud update failed", error.message); });
};

const __phase1_oldSaveCurrentPart = saveCurrentPart;
saveCurrentPart = function(){
  __phase1_oldSaveCurrentPart();
  const payload = {
    vin: activeVin(),
    oem_part: $("manualPartNumber")?.value || $("partq")?.value || "",
    aftermarket_part: "",
    component_name: $("manualPartName")?.value || $("partq")?.value || "",
    manufacturer: $("manualPartSupplier")?.value || "",
    qty: Number($("manualPartQty")?.value || 1),
    price: Number($("manualPartPrice")?.value || 0),
    notes: $("partNote")?.value || $("partOut")?.innerText?.slice(0,900) || ""
  };
  cloudInsert("saved_parts", payload).catch(e=>console.warn("Saved part cloud failed", e.message));
};

async function saveRepairNoteCloud(){
  const symptom = $("diagq")?.value || $("doctorAsk")?.value || "";
  const action = $("diagOut")?.innerText || $("doctorOut")?.innerText || $("laborDesc")?.value || "";
  if(!symptom && !action){ alert("Enter a symptom or diagnostic result first."); return; }
  try{
    await cloudInsert("repair_notes", {
      vin: activeVin(),
      symptom,
      repair_action: action.slice(0,1800),
      verified_fix: false
    });
    await saveTruckHistoryCloud("repair_note", `${symptom}\n${action.slice(0,400)}`);
    alert("Repair note saved to cloud.");
  }catch(e){
    alert("Repair note cloud save failed: " + e.message);
  }
}

window.addEventListener("DOMContentLoaded",()=>{
  if($("cloudHistoryOut")) $("cloudHistoryOut").textContent = "Cloud job history ready.";
});


/* PHASE 4 FIELD TOOLS PRO */
function getOfflineQueue(){
  try{return JSON.parse(localStorage.getItem("offlineQueue") || "[]");}catch(e){return []}
}
function saveOfflineQueue(list){
  localStorage.setItem("offlineQueue", JSON.stringify((list || []).slice(0,100)));
  renderOfflineQueue();
}
function activeTruckSummary(){
  const t=getActiveTruck();
  return `${t.year || ""} ${t.make || ""} ${t.model || ""} ${t.engine || ""}`.trim();
}
function dropGpsPin(){
  const out=$("fieldOut");
  if(!navigator.geolocation){ alert("GPS not supported on this device/browser."); return; }
  if(out) out.textContent="Getting GPS location...";
  navigator.geolocation.getCurrentPosition(pos=>{
    const gps=`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
    setValue("fieldGps", gps);
    const map=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(gps)}`;
    localStorage.setItem("lastGpsMap", map);
    if(out) out.innerHTML=`<div class="smartCardTitle"><span>GPS PIN DROPPED</span><span class="badge good">READY</span></div><b>${safeText(gps)}</b><br><button class="secondaryBtn" onclick="openCurrentGpsMap()">OPEN MAP</button>`;
  },err=>{
    if(out) out.textContent="GPS error: " + err.message;
  },{enableHighAccuracy:true,timeout:12000,maximumAge:60000});
}
function openCurrentGpsMap(){
  const gps=$("fieldGps")?.value.trim() || "";
  const map=gps ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(gps)}` : localStorage.getItem("lastGpsMap");
  if(!map){ alert("Drop GPS pin first."); return; }
  window.open(map,"_blank");
}
function getChecklistItems(){
  return Array.from(document.querySelectorAll(".dotCheck:checked")).map(x=>x.value);
}
function buildDotChecklistNote(){
  const items=getChecklistItems();
  const note=`DOT / FIELD CHECKLIST\nVIN: ${activeVin() || "NONE"}\nUnit: ${activeTruckSummary() || "UNKNOWN"}\nLocation: ${$("fieldLocationName")?.value || ""}\nGPS: ${$("fieldGps")?.value || ""}\nStatus: ${$("roadsideStatus")?.value || ""}\n\nChecked:\n${items.length ? items.map(x=>"- "+x).join("\n") : "- No checklist items selected"}\n\nField Notes:\n${$("fieldNote")?.value || ""}`;
  if($("fieldOut")) $("fieldOut").textContent=note;
  return note;
}
function addChecklistToInvoice(){
  const note=buildDotChecklistNote();
  const current=$("laborDesc")?.value || "";
  setValue("laborDesc", (current ? current + "\n\n" : "") + note);
  alert("Checklist added to invoice/work notes.");
}
function fieldPhotoData(){
  const img=$("fieldPhotoPreview");
  return img && img.src && img.style.display !== "none" ? img.src : "";
}
function saveFieldJobLocal(){
  const job={
    id:Date.now(),
    vin:activeVin(),
    truck:activeTruckSummary(),
    customer:$("custName")?.value || "",
    phone:$("custPhone")?.value || "",
    location:$("fieldLocationName")?.value || "",
    gps:$("fieldGps")?.value || "",
    status:$("roadsideStatus")?.value || "",
    eta:$("customerEta")?.value || "",
    checklist:getChecklistItems(),
    note:$("fieldNote")?.value || "",
    photo:fieldPhotoData(),
    saved_at:new Date().toLocaleString()
  };
  const list=getOfflineQueue();
  list.unshift({type:"field_job", payload:job});
  saveOfflineQueue(list);
  saveTruckHistoryCloud("field_job_saved", `${job.status} ${job.location} ${job.gps} ${job.note}`.slice(0,900)).catch(()=>{});
  if($("fieldOut")) $("fieldOut").innerHTML=`<span class="cloudOk">Field job saved locally and queued.</span>`;
}
function queueOfflineSync(){
  const built={
    type:"job_sync",
    payload:{
      vin:activeVin(), truck:activeTruckSummary(), customer:$("custName")?.value || "",
      invoice:$("quoteOut")?.innerText || "", field_note:$("fieldNote")?.value || "",
      gps:$("fieldGps")?.value || "", created_at:new Date().toISOString()
    }
  };
  const q=getOfflineQueue(); q.unshift(built); saveOfflineQueue(q);
  alert("Added to offline sync queue.");
}
function renderOfflineQueue(){
  const box=$("offlineQueueOut"); if(!box) return;
  const q=getOfflineQueue();
  if(!q.length){ box.textContent="Offline queue empty."; return; }
  box.innerHTML=`<div class="smartCardTitle"><span>OFFLINE QUEUE</span><span class="badge warn">${q.length}</span></div>` + q.slice(0,8).map((item,i)=>`<div class="invoiceLine"><b>${safeText(item.type)}</b><small>${safeText(item.payload?.saved_at || item.payload?.created_at || "Queued")}</small><small>VIN ${safeText(item.payload?.vin || "")}</small><button class="secondaryBtn" onclick="removeOfflineQueueItem(${i})">REMOVE</button></div>`).join("");
}
function removeOfflineQueueItem(i){ const q=getOfflineQueue(); q.splice(i,1); saveOfflineQueue(q); }
function copyCustomerUpdate(){
  const text=`Rolling Wrench Diesel Update\nStatus: ${$("roadsideStatus")?.value || "On job"}\nUnit: ${activeTruckSummary() || "your unit"}\nVIN: ${activeVin() || ""}\nETA/Update: ${$("customerEta")?.value || "Working on it now"}\nLocation: ${$("fieldLocationName")?.value || ""}\nNotes: ${$("fieldNote")?.value || ""}`.trim();
  navigator.clipboard?.writeText(text);
  if($("fieldOut")) $("fieldOut").textContent=text;
  alert("Customer update copied.");
}
function wireFieldPhotoPreview(){
  const input=$("fieldPhoto"); const preview=$("fieldPhotoPreview");
  if(!input || !preview) return;
  input.addEventListener("change",()=>{
    const file=input.files?.[0]; if(!file) return;
    preview.src=URL.createObjectURL(file); preview.style.display="block";
  });
}
const __phase4OldDOMContentLoaded = window.__phase4DomReady || null;
window.addEventListener("DOMContentLoaded",()=>{
  wireFieldPhotoPreview();
  renderOfflineQueue();
});


/* ===============================
   PHASE 5 OCR + VISION PRO
   Camera scan -> clean text -> lookup -> invoice -> work order note
   =============================== */
function getVisionScans(){
  try{return JSON.parse(localStorage.getItem("visionScans") || "[]");}catch(e){return []}
}
function saveVisionScans(list){
  localStorage.setItem("visionScans", JSON.stringify((list || []).slice(0,50)));
  renderVisionHistory();
}
function visionImageData(){
  return localStorage.getItem("currentVisionImage") || "";
}
function wireVisionPreview(){
  const input=$("visionImage"), preview=$("visionPreview");
  if(!input || !preview) return;
  input.addEventListener("change",()=>{
    const file=input.files?.[0];
    if(!file) return;
    const reader=new FileReader();
    reader.onload=()=>{
      localStorage.setItem("currentVisionImage", reader.result);
      preview.src=reader.result;
      preview.style.display="block";
      if($("visionOut")) $("visionOut").textContent="Photo loaded. Tap SCAN PHOTO or type/paste text into RAW TEXT.";
    };
    reader.readAsDataURL(file);
  });
}
function normalizeScanText(text){
  return String(text || "")
    .toUpperCase()
    .replace(/[|]/g,"1")
    .replace(/[O]/g,"0")
    .replace(/[^A-Z0-9\-\s\.\/]/g," ")
    .replace(/\s+/g," ")
    .trim();
}
function extractPartCandidates(text){
  const t=normalizeScanText(text);
  const matches=t.match(/\b[A-Z0-9][A-Z0-9\-\.\/]{3,24}\b/g) || [];
  const bad=new Set(["PART","NUMBER","MODEL","SERIAL","FILTER","ENGINE","DIESEL","WARNING","CAUTION","MADE","DATE","CODE","TYPE","QTY"]);
  return [...new Set(matches.filter(x=>!bad.has(x) && /\d/.test(x)))].slice(0,12);
}
function bestVisionCandidate(text){
  const list=extractPartCandidates(text);
  return list[0] || normalizeScanText(text).slice(0,80);
}
async function scanVisionPhoto(){
  const img=visionImageData();
  const rawManual=$("visionRaw")?.value.trim() || "";
  const type=$("visionType")?.value || "Part Label";
  if(!img && !rawManual){ alert("Add a photo or paste scan text first."); return; }
  if($("visionOut")) $("visionOut").textContent="Scanning photo with Rolling Cecil AI...";
  try{
    let raw=rawManual;
    if(img){
      const data=await callOracle({
        mode:"vision_ocr_scan",
        part_query:`OCR scan ${type}`,
        question:`Read this ${type}. Extract part numbers, VIN, brand, label text, prices if receipt, and any repair-useful notes. Return concise plain text.`,
        note:{image:img.split(",")[1], scan_type:type, vehicleContext:ctx()}
      });
      raw = data?.answer || data?.message || data?.data?.text || data?.data?.notes?.join("\n") || JSON.stringify(data,null,2);
    }
    setValue("visionRaw", raw);
    const cleaned=bestVisionCandidate(raw);
    setValue("visionClean", cleaned);
    const scans=getVisionScans();
    scans.unshift({type, raw:String(raw).slice(0,1200), cleaned, note:$("visionNote")?.value || "", vin:activeVin(), truck:activeTruckSummary(), image:img, saved_at:new Date().toLocaleString()});
    saveVisionScans(scans);
    if($("visionOut")) $("visionOut").innerHTML=`<div class="smartCardTitle"><span>SCAN COMPLETE</span><span class="badge good">${safeText(type)}</span></div><div class="smartGrid">${gridCell("BEST READ", cleaned)}${gridCell("CANDIDATES", extractPartCandidates(raw).join(", ") || "No clean candidates")}</div><div class="smartNote">${safeText(String(raw).slice(0,900))}</div>`;
  }catch(e){
    if($("visionOut")) $("visionOut").textContent="Vision Scan Error: " + e.message;
  }
}
function cleanVisionText(){
  const raw=$("visionRaw")?.value || "";
  const cleaned=bestVisionCandidate(raw);
  setValue("visionClean", cleaned);
  if($("visionOut")) $("visionOut").innerHTML=`<div class="smartCardTitle"><span>CLEANED TEXT</span><span class="badge good">READY</span></div><div class="smartGrid">${gridCell("BEST", cleaned)}${gridCell("CANDIDATES", extractPartCandidates(raw).join(", ") || "—")}</div>`;
}
function sendVisionToParts(){
  const clean=$("visionClean")?.value.trim() || bestVisionCandidate($("visionRaw")?.value || "");
  if(!clean){ alert("Scan or enter text first."); return; }
  setValue("partq", clean);
  setValue("manualPartNumber", clean);
  const note=[$("partNote")?.value || "", "Vision scan: " + ($("visionNote")?.value || "")].filter(Boolean).join("\n");
  setValue("partNote", note);
  showScreen("parts");
}
async function lookupVisionPart(){
  sendVisionToParts();
  await askPart();
}
function addVisionPartToInvoice(){
  const clean=$("visionClean")?.value.trim() || bestVisionCandidate($("visionRaw")?.value || "");
  if(!clean){ alert("Scan or enter a part number first."); return; }
  setValue("manualPartNumber", clean);
  if(!$("manualPartName")?.value) setValue("manualPartName", $("visionType")?.value || "Scanned Part");
  addManualPartToInvoice();
  if($("visionOut")) $("visionOut").textContent="Scanned part added to invoice.";
}
function sendVisionToVin(){
  const raw=normalizeScanText($("visionClean")?.value || $("visionRaw")?.value || "");
  const vin=(raw.match(/\b[A-HJ-NPR-Z0-9]{17}\b/) || [raw])[0];
  if(!vin){ alert("No VIN found. Correct CLEANED field first."); return; }
  setValue("vinGlobal", vin);
  setValue("invoiceVin", vin);
  showScreen("vin");
}
async function saveVisionPhotoNote(){
  const entry={
    vin:activeVin(), truck:activeTruckSummary(), scan_type:$("visionType")?.value || "Photo",
    cleaned_text:$("visionClean")?.value || "", raw_text:$("visionRaw")?.value || "",
    note:$("visionNote")?.value || "", image:visionImageData(), saved_at:new Date().toLocaleString()
  };
  const list=getVisionScans(); list.unshift(entry); saveVisionScans(list);
  try{ await cloudInsert("photo_notes", {vin:entry.vin, note_type:entry.scan_type, cleaned_text:entry.cleaned_text, raw_text:entry.raw_text, notes:entry.note}); }catch(e){}
  if($("visionOut")) $("visionOut").innerHTML=`<span class="cloudOk">Photo note saved.</span>`;
}
function clearVisionScan(){
  ["visionRaw","visionClean","visionNote"].forEach(id=>setValue(id,""));
  localStorage.removeItem("currentVisionImage");
  if($("visionPreview")){ $("visionPreview").src=""; $("visionPreview").style.display="none"; }
  if($("visionImage")) $("visionImage").value="";
  if($("visionOut")) $("visionOut").textContent="Camera OCR ready. Add a photo, then tap SCAN PHOTO.";
}
function renderVisionHistory(){
  const box=$("visionHistoryOut"); if(!box) return;
  const scans=getVisionScans();
  if(!scans.length){ box.textContent="Vision scan history will appear here."; return; }
  box.innerHTML=`<div class="smartCardTitle"><span>VISION HISTORY</span><span class="badge good">${scans.length}</span></div>` + scans.slice(0,8).map((s,i)=>`<div class="partLine"><b>${safeText(s.cleaned || s.cleaned_text || s.type || "Scan")}</b><small>${safeText(s.saved_at || "")} | VIN ${safeText(s.vin || "")}</small>${s.image?`<img class="partThumb" src="${s.image}" alt="scan">`:""}<button class="secondaryBtn" onclick="loadVisionScan(${i})">LOAD</button></div>`).join("");
}
function loadVisionScan(i){
  const s=getVisionScans()[i]; if(!s) return;
  setValue("visionType", s.type || s.scan_type || "Part Label");
  setValue("visionRaw", s.raw || s.raw_text || "");
  setValue("visionClean", s.cleaned || s.cleaned_text || "");
  setValue("visionNote", s.note || s.notes || "");
  if(s.image){ localStorage.setItem("currentVisionImage", s.image); if($("visionPreview")){ $("visionPreview").src=s.image; $("visionPreview").style.display="block"; } }
  showScreen("visionPro");
}
window.addEventListener("DOMContentLoaded",()=>{ wireVisionPreview(); renderVisionHistory(); });


// PHASE 7 BACKEND EXPANSION PRO
async function backendExpansionSearch(term){
  if(!supabaseClient) throw new Error("Supabase client not loaded.");
  const search_text = String(term || "").trim();
  if(!search_text) throw new Error("Enter backend search text.");
  const { data, error } = await supabaseClient.rpc("backend_expansion_search", { search_text });
  if(error) throw error;
  return data || {};
}

async function recursiveInterchangeSearch(term){
  if(!supabaseClient) throw new Error("Supabase client not loaded.");
  const search_text = String(term || "").trim();
  if(!search_text) throw new Error("Enter a part number for interchange chain.");
  const { data, error } = await supabaseClient.rpc("recursive_interchange_chain", { search_text });
  if(error) throw error;
  return data || [];
}

function renderBackendObject(title, obj){
  const blocks=[];
  const order=[
    ["parts","PARTS"], ["cross_refs","CROSS REFERENCES"], ["interchange_chains","INTERCHANGE CHAINS"],
    ["torque_specs","TORQUE SPECS"], ["labor_times","LABOR TIMES"], ["fluids_filters","FLUIDS / FILTERS"],
    ["known_failures","KNOWN FAILURES"], ["repair_procedures","REPAIR PROCEDURES"], ["supplier_pricing","SUPPLIER PRICING"],
    ["staging_imports","STAGING IMPORTS"]
  ];
  for(const [key,label] of order){
    const rows=asArray(obj?.[key]);
    if(!rows.length) continue;
    blocks.push(card(label,{text:`${rows.length}`,cls:"good"},`<div class="smartGrid">${rows.slice(0,8).map(r=>gridCell(
      r.part_number || r.oem_part_number || r.component_name || r.engine_family || r.fault_code || r.procedure_name || r.supplier_name || r.source_name || "MATCH",
      r.description || r.aftermarket_part_number || r.torque_value || (r.labor_hours ? r.labor_hours+" hrs" : "") || r.common_fix || r.price || r.notes || r.category || "Stored result"
    )).join("")}</div>`));
  }
  if(!blocks.length){
    blocks.push(card(title,{text:"NO HIT",cls:"warn"},`<div class="emptyNote">No expanded backend matches yet. Add records or import catalog rows into staging.</div>`));
  }
  return `<div class="resultGroup">${blocks.join("")}</div>`;
}

async function runBackendExpansionSearch(){
  const q = $("backendSearchQ")?.value.trim() || $("partq")?.value.trim() || $("doctorAsk")?.value.trim() || "";
  if(!q){ alert("Enter backend search text."); return; }
  if($("backendOut")) $("backendOut").textContent="Searching expanded backend...";
  try{
    const data = await backendExpansionSearch(q);
    $("backendOut").innerHTML = renderBackendObject("BACKEND EXPANSION", data);
  }catch(e){
    $("backendOut").innerHTML = card("BACKEND ERROR",{text:"ERROR",cls:"warn"},`<div class="emptyNote">${safeText(e.message)}</div>`);
  }
}

async function runInterchangeChain(){
  const q = $("backendSearchQ")?.value.trim() || $("partq")?.value.trim() || "";
  if(!q){ alert("Enter a part number first."); return; }
  if($("backendOut")) $("backendOut").textContent="Building interchange chain...";
  try{
    const chain = await recursiveInterchangeSearch(q);
    if(!chain.length){
      $("backendOut").innerHTML = card("INTERCHANGE CHAIN",{text:"NO CHAIN",cls:"warn"},`<div class="emptyNote">No chain found for ${safeText(q)} yet.</div>`);
      return;
    }
    $("backendOut").innerHTML = card("RECURSIVE INTERCHANGE CHAIN",{text:`${chain.length} LINKS`,cls:"hot"},`<div class="smartGrid">${chain.slice(0,20).map(c=>gridCell(c.source_part || c.part_number || "SOURCE", `${c.cross_part || c.cross_ref_number || "MATCH"} ${c.confidence_score ? "("+c.confidence_score+")" : ""}`)).join("")}</div>`);
  }catch(e){
    $("backendOut").innerHTML = card("INTERCHANGE ERROR",{text:"ERROR",cls:"warn"},`<div class="emptyNote">${safeText(e.message)}</div>`);
  }
}

function getImportQueue(){ return JSON.parse(localStorage.getItem("backendImportQueue") || "[]"); }
function saveImportQueue(list){ localStorage.setItem("backendImportQueue", JSON.stringify(list.slice(0,80))); }
async function queueStagingImport(){
  const source=$("importSourceName")?.value.trim() || "Manual Field Import";
  const category=$("importCategory")?.value.trim() || "Uncategorized";
  const notes=$("importNotes")?.value.trim() || "";
  if(!notes){ alert("Paste import notes or rows first."); return; }
  const entry={source,category,notes,vin:activeVin(),created_at:new Date().toISOString()};
  const q=getImportQueue(); q.unshift(entry); saveImportQueue(q);
  try{ await cloudInsert("staging_catalog_imports", {source_name:source, system_category:category, raw_payload:entry, notes}); }catch(e){}
  loadImportQueue();
  if($("backendOut")) $("backendOut").innerHTML = card("IMPORT QUEUED",{text:"READY",cls:"good"},`<div class="smartGrid">${gridCell("SOURCE",source)}${gridCell("CATEGORY",category)}${gridCell("ROWS/NOTES",notes.slice(0,120))}</div>`);
}
function loadImportQueue(){
  const box=$("importQueueOut"); if(!box) return;
  const q=getImportQueue();
  if(!q.length){ box.textContent="Import queue ready."; return; }
  box.innerHTML=`<div class="smartCardTitle"><span>LOCAL IMPORT QUEUE</span><span class="badge good">${q.length}</span></div>`+q.slice(0,10).map((x,i)=>`<div class="partLine"><b>${safeText(x.source)}</b><small>${safeText(x.category)} | ${safeText(new Date(x.created_at).toLocaleString())}</small><p>${safeText(x.notes).slice(0,180)}</p></div>`).join("");
}
function clearBackendPro(){
  ["backendSearchQ","importSourceName","importCategory","importNotes"].forEach(id=>setValue(id,""));
  if($("backendOut")) $("backendOut").textContent="Backend expansion ready. Search a part, engine, system, fault, torque spec, labor job, or staged import.";
}
window.addEventListener("DOMContentLoaded",()=>{ loadImportQueue(); });
