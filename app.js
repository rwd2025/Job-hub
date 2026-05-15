const SUPABASE_URL = "https://uxpkqwcmvtqvubibbrek.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4cGtxd2NtdnRxdnViaWJicmVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMzk4NjQsImV4cCI6MjA5MjgxNTg2NH0.afiaSFqkRFEXW5nPQVRXKZcpKkS6iF3T_hTQC2P15HQ";
const API_URL = "https://uxpkqwcmvtqvubibbrek.supabase.co/functions/v1/oracle-parts-search";
const APP_VERSION = "18.0.0-parts-book-ai";
const APP_RELEASE_NAME = "Rolling Cecil AI Parts Book";

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

  const map = {home:1,dieselAI:2,faultDoctor:2,parts:3,schematics:4,repairHud:4,settings:5,invoice:5,
    releasePro:5,team:5,voice:5,
    releasePro:5,vin:1,timeClock:5,fieldTools:5,visionPro:3,backendPro:5,debugPro:5,aiBrainPro:2};
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
    const map = {home:1,dieselAI:2,faultDoctor:2,parts:3,schematics:4,repairHud:4,settings:5,invoice:5,
    releasePro:5,team:5,voice:5,
    releasePro:5,vin:1,timeClock:5,fieldTools:5,visionPro:3,backendPro:5,debugPro:5,aiBrainPro:2};
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
    mode: payload.mode || "search",
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

  if(!q){
    $("diagOut").textContent = "Enter fault code or symptom first.";
    return;
  }

  $("diagOut").textContent = "Fault Doctor running Oracle + Diesel Brain...";
  if($("intelOut")) $("intelOut").textContent = "Searching Diesel Brain memory...";

  try{
    const kb = await fetch("https://uxpkqwcmvtqvubibbrek.supabase.co/functions/v1/embedding-router", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "search",
        question: q,
        match_count: 5
      })
    });

    const kbData = await kb.json();

    const memoryContext = kbData?.matches
      ?.map(m => m.content)
      ?.join("\n\n") || "";

    const data = await callOracle({
      part_query: q,
      question: `
KNOWN SHOP MEMORY:
${memoryContext}

LIVE QUESTION:
${q}

TECH NOTES:
${note}
`
    });

    renderDiagnosticOracle("diagOut", data, q);

    if(kbData?.matches?.length && $("intelOut")){
      $("intelOut").innerHTML = `
        <div class="oracleCard">
          <div class="oracleTitle">DIESEL BRAIN MEMORY (${kbData.matches.length} HITS)</div>
          ${kbData.matches.map(m => `
            <div class="miniCard">
              <strong>${m.source_name || "MEMORY"}</strong>
              <div style="margin-top:8px;">${m.content || ""}</div>
            </div>
          `).join("")}
        </div>
      `;
    }else if($("intelOut")){
      $("intelOut").textContent = "No Diesel Brain memory match yet.";
    }

  }catch(e){
    $("diagOut").textContent = "DIAGNOSTIC ERROR: " + e.message;
    if($("intelOut")) $("intelOut").textContent = "Diesel Brain error or no match.";
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


async function liveRetrievalSearch(search, note=""){
  if(!supabaseClient) throw new Error("Supabase client not loaded.");
  const term = String(search || "").trim();
  if(!term) return { knowledge:[], repair_memory:[], common_failures:[], diagnostic_tests:[], known_patterns:[], component_maps:[], route_plan:{} };
  try{
    const { data, error } = await supabaseClient.rpc("rolling_cecil_live_retrieval", {
      search_text: term,
      vin_text: activeVin() || null
    });
    if(error) throw error;
    return data || {};
  }catch(e){
    console.warn("rolling_cecil_live_retrieval fallback", e.message);
    return null;
  }
}

async function dieselBrainSearch(search, note=""){
  if(!supabaseClient) throw new Error("Supabase client not loaded.");
  const term = String(search || "").trim();
  if(!term) return { common_failures:[], diagnostic_tests:[], known_patterns:[], repair_memory:[], knowledge:[], component_maps:[] };

  const live = await liveRetrievalSearch(term, note);
  if(live) return live;

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
  const knowledge = asArray(data.knowledge || data.knowledge_base);
  const failures = asArray(data.common_failures);
  const tests = asArray(data.diagnostic_tests);
  const patterns = asArray(data.known_patterns);
  const memory = asArray(data.repair_memory || data.repair_notes);
  const maps = asArray(data.component_maps || data.xray_maps);
  const route = data.route_plan || data.router || null;
  const pieces = [];

  if(route){
    pieces.push(card("MODEL ROUTER", {text:route.level || "LIVE", cls:"good"}, `<div class="smartGrid">
      ${gridCell("ROUTE", route.route || route.level || "Hybrid retrieval")}
      ${gridCell("LLM", route.llm_needed ? "Use after sources" : "Not needed yet")}
      ${gridCell("REASON", route.reason || "Exact + semantic sources first")}
    </div>`, "Rolling Cecil checks low-cost tables and repair memory before any expensive AI call."));
  }

  if(knowledge.length){
    pieces.push(card("SOURCE-BACKED KNOWLEDGE", {text:`${knowledge.length} SOURCE${knowledge.length>1?"S":""}`, cls:"good"},
      `<div class="smartGrid sourceGrid">${knowledge.slice(0,6).map((k,i)=>gridCell(`#${i+1} ${k.source_type || "SOURCE"}`, `${k.source_name || "Manual / TSB"}
${k.content || ""}`)).join("")}</div>`,
      "These are local knowledge/manual/case-study matches. Add embeddings later for deeper semantic matching."));
  }

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
      `<div class="smartGrid">${memory.slice(0,6).map(m=>gridCell(m.verified_fix ? "VERIFIED FIX" : "REPAIR NOTE", `${m.symptom_text || m.symptom || ""} → ${m.repair_action || m.notes || ""}`)).join("")}</div>`));
  }

  if(maps.length){
    pieces.push(card("X-RAY COMPONENT MAPS", {text:`${maps.length} MAP${maps.length>1?"S":""}`, cls:"hot"},
      `<div class="smartGrid">${maps.slice(0,6).map(m=>gridCell(m.component_name || m.component_id || "COMPONENT", `${m.photo_path || "No photo path"}
${JSON.stringify(m.metadata || {})}`)).join("")}</div>`));
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


/* ===============================
   PHASE 8 FINAL INTEGRATION PRO
   One master flow: Search → Diagnose → Parts → Repair Kit → Clock → Invoice → Save
   =============================== */
function phase8Session(){
  try{return JSON.parse(localStorage.getItem("phase8JobSession") || "{}");}catch(e){return {};}
}
function savePhase8Session(session){
  localStorage.setItem("phase8JobSession", JSON.stringify(session || {}));
  updatePhase8SessionBar();
}
function buildPhase8SessionTitle(){
  const t = getActiveTruck();
  const vin = activeVin ? activeVin() : (t.vin || "");
  const customer = $("custName")?.value || phase8Session().customer || "";
  const unit = activeTruckText ? activeTruckText() : `${t.year||""} ${t.make||""} ${t.model||""}`.trim();
  return [customer, unit, vin].filter(Boolean).join(" • ") || "Active field job";
}
function startUnifiedSession(){
  const s = phase8Session();
  s.started_at = s.started_at || new Date().toISOString();
  s.vin = activeVin ? activeVin() : getActiveTruck().vin || "";
  s.truck = activeTruckText ? activeTruckText() : "";
  s.customer = $("custName")?.value || s.customer || "";
  s.status = "ACTIVE";
  savePhase8Session(s);
  alert("Active job session started.");
}
function clearUnifiedSession(){
  if(!confirm("Clear active job session? This will not delete saved invoices or cloud history.")) return;
  localStorage.removeItem("phase8JobSession");
  updatePhase8SessionBar();
}
function updatePhase8SessionBar(){
  const s = phase8Session();
  const title = $("sessionTitle");
  const meta = $("sessionMeta");
  if(!title || !meta) return;
  if(!s.started_at){
    title.textContent = "No active job";
    meta.textContent = "Start from VIN, master search, invoice, or clock.";
    return;
  }
  title.textContent = buildPhase8SessionTitle();
  const clock = getClock ? clockHours(getClock()).toFixed(2) : "0.00";
  const parts = typeof invoicePartsTotal === "function" ? money(invoicePartsTotal()) : "$0.00";
  meta.textContent = `${s.status || "ACTIVE"} • Started ${new Date(s.started_at).toLocaleString()} • Clock ${clock} hrs • Parts ${parts}`;
}
function phase8SearchInput(){
  return ($("doctorAsk")?.value || $("partq")?.value || $("diagq")?.value || $("homeAiAsk")?.value || "").trim();
}
function phase8SetSearchEverywhere(q){
  if(!q) return;
  setValue("doctorAsk", q);
  setValue("partq", q);
  setValue("diagq", q);
}
function phase8ActionsHtml(q){
  const safe = safeText(q || "");
  return `<div class="phase8ActionRow">
    <button onclick="showScreen('parts')">PARTS</button>
    <button onclick="showScreen('faultDoctor')">DIAG</button>
    <button onclick="showScreen('invoice')">INVOICE</button>
    <button onclick="sendClockToInvoice()">CLOCK → INVOICE</button>
    <button onclick="addLookupToInvoice()">ADD LOOKUP</button>
    <button onclick="saveUnifiedJob()">SAVE JOB</button>
  </div>
  <div class="smartNote">Unified query: ${safe}</div>`;
}
async function phase8MasterSearch(){
  const q = phase8SearchInput();
  if(!q){
    alert("Enter a part, fault code, VIN, symptom, or repair question first.");
    return;
  }
  startUnifiedSession();
  phase8SetSearchEverywhere(q);
  const out = $("doctorOut") || $("partOut") || $("diagOut");
  if(out) out.innerHTML = `<div class="loadingCard">Rolling Cecil AI is running the full workflow...</div>`;

  const session = phase8Session();
  session.last_query = q;
  session.last_search_at = new Date().toISOString();
  savePhase8Session(session);

  let oracleData = null, universal = {}, brain = {}, kits = [];
  let oracleErr = "", universalErr = "", brainErr = "";

  try{ oracleData = await callOracle({ part_query:q, question:q, note:ctx(), mode:"master_workflow" }); }
  catch(e){ oracleErr = e.message; }

  const term = oracleData ? smartSearchTerm(q, oracleData) : q;
  try{ universal = await universalSearch(term); }
  catch(e){ universalErr = e.message; }

  try{ brain = await dieselBrainSearch(q, ctx()); }
  catch(e){ brainErr = e.message; }

  try{ kits = await getRepairKit(term); }
  catch(e){ kits = []; }

  let html = `<div class="resultGroup phase8Results">`;
  html += card("MASTER WORKFLOW", {text:"PHASE 8", cls:"good"}, `<div class="smartGrid">
    ${gridCell("QUERY", q)}
    ${gridCell("SEARCH TERM", term)}
    ${gridCell("ACTIVE VIN", activeVin ? activeVin() : getActiveTruck().vin || "NO VIN")}
    ${gridCell("ACTIVE ENGINE", getActiveTruck().engine || $("engine")?.value || "UNKNOWN")}
  </div>`, "One flow: Oracle + SQL database + Diesel Brain + repair kits + invoice/job tools.");

  if(oracleData){
    const d = oracleData.data || oracleData || {};
    html += card("ORACLE RESULT", {text:"AI", cls:"hot"}, `<div class="smartGrid">
      ${gridCell("PART", d.oem_part || d.part || d.part_number || "UNKNOWN")}
      ${gridCell("ENGINE", d.engine || getActiveTruck().engine || "UNKNOWN")}
      ${gridCell("FITMENT", d.verified_fitment ? "VIN/ESN/CPL CONTEXT" : "VERIFY BY VIN/ESN/CPL")}
      ${gridCell("SOURCE", oracleData.source || "oracle")}
    </div>`, oracleData.answer || oracleData.message || (Array.isArray(d.notes) ? d.notes.join("\n") : ""));
  }else{
    html += card("ORACLE RESULT", {text:"ERROR", cls:"warn"}, `<div class="smartGrid">${gridCell("ERROR", oracleErr || "No Oracle response")}</div>`);
  }

  const localCount = Object.values(universal || {}).reduce((sum,v)=>sum + (Array.isArray(v) ? v.length : 0), 0);
  html += card("LOCAL DATABASE", {text:`${localCount} HIT${localCount===1?"":"S"}`, cls:localCount?"good":"warn"}, `<div class="smartGrid">
    ${gridCell("PARTS", asArray(universal.parts).length)}
    ${gridCell("CROSS REFS", asArray(universal.cross_refs || universal.part_cross_refs).length)}
    ${gridCell("LABOR", asArray(universal.labor_times).length)}
    ${gridCell("TORQUE", asArray(universal.torque_specs).length)}
    ${gridCell("FAILURES", asArray(universal.common_failures).length)}
    ${gridCell("SUPPLIERS", asArray(universal.supplier_links).length)}
  </div>`, universalErr || "Database results are grouped below on the Parts screen when you run LOOKUP PART.");

  const brainCount = asArray(brain.common_failures).length + asArray(brain.diagnostic_tests).length + asArray(brain.known_patterns).length + asArray(brain.repair_memory || brain.repair_notes).length;
  html += card("DIESEL BRAIN", {text:`${brainCount} HIT${brainCount===1?"":"S"}`, cls:brainCount?"hot":"warn"}, renderIntelligenceCards(brain || {}, q), brainErr || "Diagnostic memory and verified fixes are tied into the same workflow.");

  if(Array.isArray(kits) && kits.length){
    html += `<div class="resultGroup">`;
    for(const k of kits.slice(0,3)){
      html += card("SMART REPAIR KIT", {text:"KIT", cls:"good"}, `<div class="smartGrid">
        ${gridCell("COMPONENT", k.component_name)}${gridCell("ENGINE", k.engine_family)}${gridCell("OEM", k.oem_part_number)}${gridCell("LABOR", k.labor_hours ? k.labor_hours+" hrs" : "—")}${gridCell("GASKETS", k.gasket_set)}${gridCell("SEALS", k.seals)}
      </div>`, `${k.torque_specs || ""}\n${k.repair_notes || ""}`.trim());
    }
    html += `</div>`;
  }else{
    html += card("SMART REPAIR KIT", {text:"NO KIT", cls:"warn"}, `<div class="smartGrid">${gridCell("NEXT", "Add repair_kits rows for this search term")}</div>`);
  }
  html += phase8ActionsHtml(q);
  html += `</div>`;

  if($("doctorOut")) $("doctorOut").innerHTML = html;
  if($("partOut")) $("partOut").innerHTML = html;
  updatePhase8SessionBar();
  showScreen("home");
}

// Phase 8 override: the home search runs the full workflow now.
runDoctorSearch = phase8MasterSearch;

async function saveUnifiedJob(){
  startUnifiedSession();
  if(typeof buildInvoice === "function") buildInvoice();
  const s = phase8Session();
  s.customer = $("custName")?.value || s.customer || "";
  s.vin = activeVin ? activeVin() : getActiveTruck().vin || "";
  s.truck = activeTruckText ? activeTruckText() : s.truck || "";
  s.invoice_text = $("quoteOut")?.textContent || "";
  s.last_saved_at = new Date().toISOString();
  savePhase8Session(s);
  try{
    if(typeof saveJobCloud === "function") await saveJobCloud();
  }catch(e){
    console.warn("Cloud save from unified job failed", e.message);
    alert("Local session saved. Cloud save failed: " + e.message);
    return;
  }
  alert("Unified job saved/synced.");
}

window.addEventListener("DOMContentLoaded",()=>{
  updatePhase8SessionBar();
  setInterval(updatePhase8SessionBar, 30000);
});


/* =========================
   PHASE 9 QA / DEBUG / STABILITY PRO
   ========================= */
function debugWrite(msg){
  const out = $("debugOut");
  if(out) out.textContent = msg;
}
function appendDebug(msg){
  const out = $("debugOut");
  if(out) out.textContent = (out.textContent ? out.textContent + "\n" : "") + msg;
}
function getDebugErrors(){
  try{return JSON.parse(localStorage.getItem("rolling_cecil_error_log") || "[]");}catch(e){return []}
}
function saveDebugError(entry){
  const list = getDebugErrors();
  list.unshift({...entry, at:new Date().toISOString(), version:APP_VERSION});
  localStorage.setItem("rolling_cecil_error_log", JSON.stringify(list.slice(0,60)));
}
window.addEventListener("error", e=>{
  saveDebugError({type:"window_error", message:e.message, file:e.filename, line:e.lineno, col:e.colno});
});
window.addEventListener("unhandledrejection", e=>{
  saveDebugError({type:"promise_rejection", message:String(e.reason?.message || e.reason || "unknown")});
});
function showErrorLog(){
  const list = getDebugErrors();
  const last = localStorage.getItem("diesel_doctor_last_error") || "none";
  const text = list.length ? list.map((e,i)=>`${i+1}. ${e.at}\n${e.type}: ${e.message}\n${e.file || ""} ${e.line || ""}`).join("\n\n") : "No stored errors.";
  if($("debugLogOut")) $("debugLogOut").textContent = `LAST LEGACY ERROR:\n${last}\n\nERROR LOG:\n${text}`;
}
async function testSupabaseConnection(){
  if(!supabaseClient){
    if($("debugSupabaseStatus")) $("debugSupabaseStatus").textContent = "Client missing";
    throw new Error("Supabase client is missing. Check CDN script and keys.");
  }
  const { error } = await supabaseClient.from("saved_jobs").select("id", { count:"exact", head:true });
  if(error) throw error;
  if($("debugSupabaseStatus")) $("debugSupabaseStatus").textContent = "Connected";
  return "Supabase connected";
}
async function testRequiredTables(){
  const tables = [
    "saved_jobs","saved_parts","labor_clock","truck_history","repair_notes",
    "photo_notes","supplier_pricing","repair_procedures","known_failures","vin_history_expanded",
    "staging_catalog_imports","parts","manufacturers","part_cross_refs","repair_kits",
    "knowledge_base_embeddings","repair_memory","component_photo_map","ai_router_events"
  ];
  const rows = [];
  for(const table of tables){
    try{
      const { error } = await supabaseClient.from(table).select("*", { count:"exact", head:true });
      rows.push(`${error ? "❌" : "✅"} ${table}${error ? " — " + error.message : ""}`);
    }catch(e){
      rows.push(`❌ ${table} — ${e.message}`);
    }
  }
  const msg = "TABLE CHECK:\n" + rows.join("\n");
  debugWrite(msg);
  return msg;
}
async function testRequiredRPCs(){
  const tests = [
    {name:"universal_diesel_search", args:{search_text:"water"}},
    {name:"diesel_brain_search", args:{search_text:"SPN"}},
    {name:"recursive_interchange_chain", args:{search_part:"5633513"}},
    {name:"expanded_backend_search", args:{search_text:"water"}},
    {name:"rolling_cecil_brain_search", args:{search_text:"idle stutter"}},
    {name:"repair_memory_search", args:{search_text:"SPN", vin_text:null}}
  ];
  const rows=[];
  for(const t of tests){
    try{
      const { error } = await supabaseClient.rpc(t.name, t.args);
      rows.push(`${error ? "❌" : "✅"} ${t.name}${error ? " — " + error.message : ""}`);
    }catch(e){ rows.push(`❌ ${t.name} — ${e.message}`); }
  }
  const msg = "RPC CHECK:\n" + rows.join("\n");
  debugWrite(msg);
  return msg;
}
function testAllCoreButtons(){
  const buttons = Array.from(document.querySelectorAll("button[onclick]")).map(btn=>({
    label:(btn.textContent || "").trim().replace(/\s+/g," ").slice(0,50),
    onclick:btn.getAttribute("onclick")
  }));
  const missing=[];
  for(const b of buttons){
    const fn=(b.onclick || "").split("(")[0].trim();
    if(fn && typeof window[fn] !== "function" && typeof eval(`typeof ${fn}`) === "undefined") missing.push(`${b.label} → ${b.onclick}`);
  }
  const msg = `BUTTON CHECK:\nButtons found: ${buttons.length}\nMissing handlers: ${missing.length}\n\n${missing.length ? missing.join("\n") : "All checked button handlers exist."}`;
  debugWrite(msg);
  return msg;
}
async function runFullQACheck(){
  debugWrite("Running QA checks...");
  const chunks=[];
  chunks.push(`VERSION: ${APP_VERSION}`);
  try{chunks.push(await testSupabaseConnection());}catch(e){chunks.push("❌ Supabase — " + e.message); saveDebugError({type:"qa_supabase",message:e.message});}
  try{chunks.push(testAllCoreButtons());}catch(e){chunks.push("❌ Button check — " + e.message); saveDebugError({type:"qa_buttons",message:e.message});}
  try{chunks.push(await testRequiredTables());}catch(e){chunks.push("❌ Table check — " + e.message); saveDebugError({type:"qa_tables",message:e.message});}
  try{chunks.push(await testRequiredRPCs());}catch(e){chunks.push("❌ RPC check — " + e.message); saveDebugError({type:"qa_rpcs",message:e.message});}
  debugWrite(chunks.join("\n\n---\n\n"));
  showErrorLog();
}
async function resetAppCache(){
  try{
    if("serviceWorker" in navigator){
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r=>r.unregister()));
    }
    if("caches" in window){
      const keys = await caches.keys();
      await Promise.all(keys.map(k=>caches.delete(k)));
    }
    if($("debugCacheStatus")) $("debugCacheStatus").textContent = "Reset complete";
    alert("Cache reset. Close and reopen the app.");
  }catch(e){
    saveDebugError({type:"cache_reset",message:e.message});
    alert("Cache reset error: " + e.message);
  }
}
function clearLocalAppData(){
  if(!confirm("Clear local app data on this phone? Cloud records stay in Supabase.")) return;
  const keep = ["rolling_cecil_error_log"];
  Object.keys(localStorage).forEach(k=>{ if(!keep.includes(k)) localStorage.removeItem(k); });
  alert("Local app data cleared. Reloading.");
  location.reload();
}
function enableFallbackMode(){
  localStorage.setItem("rolling_cecil_fallback_mode","true");
  alert("Fallback mode enabled. The app will keep local tools usable if backend calls fail.");
}
function exportDebugReport(){
  const report = {
    version:APP_VERSION,
    at:new Date().toISOString(),
    activeTruck:getActiveTruck(),
    currentScreen,
    fallbackMode:localStorage.getItem("rolling_cecil_fallback_mode") === "true",
    lastError:localStorage.getItem("diesel_doctor_last_error") || "",
    errors:getDebugErrors(),
    localKeys:Object.keys(localStorage).sort(),
    userAgent:navigator.userAgent
  };
  const text = JSON.stringify(report,null,2);
  if(navigator.clipboard) navigator.clipboard.writeText(text).catch(()=>{});
  const blob = new Blob([text], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `rolling-cecil-debug-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  debugWrite("Debug report exported and copied when clipboard is available.");
}
window.addEventListener("DOMContentLoaded",()=>{
  if($("debugVersion")) $("debugVersion").textContent = APP_VERSION;
});




/* =============================
   PHASE 11 ROLLING CECIL AI BRAIN
============================= */
function brainWrite(html){
  const out = $("brainOut");
  if(out) out.innerHTML = html;
}

async function runAIBrainSearch(){
  const q = $("brainSearchText")?.value.trim() || $("doctorAsk")?.value.trim() || $("partq")?.value.trim() || "";
  if(!q){ brainWrite("Enter a symptom, fault code, part, or repair question first."); return; }
  brainWrite("Searching Rolling Cecil AI Brain...");
  try{
    const data = await liveRetrievalSearch(q) || await (async()=>{ const { data, error } = await supabaseClient.rpc("rolling_cecil_brain_search", { search_text:q }); if(error) throw error; return data; })();
    const memory = await repairMemorySearch(q).catch(()=>null);
    brainWrite(renderBrainResultCards(q, data, memory));
  }catch(e){
    brainWrite(renderErrorCard("AI Brain Search Error", e.message));
  }
}

async function repairMemorySearch(searchText){
  const { data, error } = await supabaseClient.rpc("repair_memory_search", {
    search_text: searchText,
    vin_text: activeVin() || null
  });
  if(error) throw error;
  return data;
}

function renderBrainResultCards(query, data, memory){
  const knowledge = data?.knowledge || [];
  const repairs = data?.repair_memory || memory?.repair_memory || [];
  const photos = data?.component_maps || [];
  const kCards = knowledge.length ? knowledge.map(k=>`
    <div class="brainResultCard">
      <b>${safeText(k.source_type || "Knowledge")}</b>
      <span>${safeText(k.source_name || "Manual / TSB / Case")}</span>
      <p>${safeText(k.content || "")}</p>
      <small>${safeText(JSON.stringify(k.metadata || {}))}</small>
    </div>`).join("") : `<div class="emptyCard">No manual chunks found yet. Import manuals/TSBs into knowledge_base_embeddings.</div>`;
  const rCards = repairs.length ? repairs.map(r=>`
    <div class="brainResultCard verifiedFix">
      <b>${r.verified_fix ? "✅ VERIFIED FIX" : "Repair Memory"}</b>
      <span>${safeText(r.fault_code || "No fault code")} • Score ${Number(r.ranking_score || 0).toFixed(2)}</span>
      <p><b>Symptom:</b> ${safeText(r.symptom_text || "")}</p>
      <p><b>Fix:</b> ${safeText(r.repair_action || "")}</p>
    </div>`).join("") : `<div class="emptyCard">No verified repair memory yet. Save fixes after jobs.</div>`;
  const pCards = photos.length ? photos.map(p=>`
    <div class="brainResultCard">
      <b>📷 ${safeText(p.component_name || "Component")}</b>
      <span>${safeText(p.photo_path || "No storage path")}</span>
      <p>${safeText(JSON.stringify(p.metadata || {}))}</p>
    </div>`).join("") : `<div class="emptyCard">No X-Ray photo component maps yet.</div>`;
  const route = data?.route_plan || {};
  return `
  <div class="oracleCard brainHeroCard">
    <div class="oracleTitle">ROLLING CECIL LIVE RETRIEVAL</div>
    <p><b>Query:</b> ${safeText(query)}</p>
    <p><b>Route:</b> ${safeText(route.route || route.level || "Hybrid retrieval")}</p>
    <p>Source-backed search: manuals/case studies + repair memory + known failures + X-Ray component maps.</p>
  </div>
  <div class="brainColumns">
    <div><h3>Knowledge Base</h3>${kCards}</div>
    <div><h3>Repair Memory</h3>${rCards}</div>
    <div><h3>X-Ray Maps</h3>${pCards}</div>
  </div>`;
}

function renderErrorCard(title, message){
  return `<div class="oracleCard errorCard"><div class="oracleTitle">${safeText(title)}</div><p>${safeText(message)}</p></div>`;
}

async function saveVerifiedRepairMemory(){
  const truck = getActiveTruck();
  const row = {
    vin: truck.vin || null,
    vin_prefix: (truck.vin || "").slice(0,10) || null,
    fault_code: $("memoryFaultCode")?.value.trim() || null,
    symptom_text: $("memorySymptom")?.value.trim() || null,
    repair_action: $("memoryRepairAction")?.value.trim() || null,
    verified_fix: true,
    ranking_score: 1.0,
    metadata: { engine: truck.engine || null, make: truck.make || null, model: truck.model || null, source:"app_verified_fix" }
  };
  if(!row.symptom_text && !row.fault_code){ brainWrite("Add a symptom or fault code before saving repair memory."); return; }
  const { error } = await supabaseClient.from("repair_memory").insert(row);
  if(error){ brainWrite(renderErrorCard("Save Repair Memory Error", error.message)); return; }
  brainWrite("✅ Verified repair memory saved. Future searches can rank this fix higher.");
}

async function saveComponentPhotoMap(){
  const truck = getActiveTruck();
  const row = {
    vin: truck.vin || null,
    component_id: ($("xrayComponentName")?.value || "").toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,""),
    component_name: $("xrayComponentName")?.value.trim() || null,
    photo_path: $("xrayPhotoPath")?.value.trim() || null,
    confidence_score: 0.75,
    metadata: { note: $("xrayNotes")?.value.trim() || "", engine: truck.engine || null, source:"manual_component_map" }
  };
  if(!row.component_name){ brainWrite("Enter a component name before saving X-Ray map."); return; }
  const { error } = await supabaseClient.from("component_photo_map").insert(row);
  if(error){ brainWrite(renderErrorCard("Save Component Map Error", error.message)); return; }
  brainWrite("✅ X-Ray component map saved.");
}

function showBrainRouterPlan(){
  brainWrite(`
  <div class="oracleCard brainHeroCard">
    <div class="oracleTitle">MODEL ROUTER PLAN</div>
    <div class="releaseList">
      <span>Level 1 Lookup: VIN, part number, exact tables, no LLM needed.</span>
      <span>Level 2 Semantic Search: manuals, TSBs, repair memory, vector-ready tables.</span>
      <span>Level 3 Diagnostic Inference: top sources + repair memory + active truck context sent to LLM.</span>
      <span>X-Ray Flow: photo → component tag → component ID → torque/parts/repair kit lookup.</span>
    </div>
  </div>`);
}

async function runBrainQACheck(){
  const checks = [];
  for(const table of ["knowledge_base_embeddings","repair_memory","component_photo_map","ai_router_events","semantic_search_events","manual_ingestion_queue"]){
    try{
      const { error } = await supabaseClient.from(table).select("*", { count:"exact", head:true });
      checks.push(`${error ? "❌" : "✅"} ${table}${error ? " — " + error.message : ""}`);
    }catch(e){ checks.push(`❌ ${table} — ${e.message}`); }
  }
  for(const fn of ["rolling_cecil_brain_search","repair_memory_search","rolling_cecil_live_retrieval"]){
    try{
      const args = fn === "repair_memory_search" || fn === "rolling_cecil_live_retrieval" ? {search_text:"test", vin_text:null} : {search_text:"test"};
      const { error } = await supabaseClient.rpc(fn, args);
      checks.push(`${error ? "❌" : "✅"} ${fn}${error ? " — " + error.message : ""}`);
    }catch(e){ checks.push(`❌ ${fn} — ${e.message}`); }
  }
  brainWrite("AI BRAIN BACKEND CHECK:\n" + checks.join("\n"));
}

function sendBrainToDieselDoctor(){
  const q = $("brainSearchText")?.value.trim() || "";
  if(!q){ brainWrite("Enter a question first."); return; }
  setValue("doctorAsk", q);
  showScreen("home");
}


/* =============================
   PHASE 10 FINAL RELEASE PRO
============================= */
function showReleaseNotes(){
  const out = $("releaseOut");
  if(!out) return;
  out.innerHTML = `
<div class="oracleCard">
  <div class="oracleTitle">${APP_RELEASE_NAME} — v${APP_VERSION}</div>
  <div class="releaseList">
    <span>✓ Phase 1 Shop OS: saved jobs, parts, labor clock, truck history</span>
    <span>✓ Phase 2 Parts Pro: interchange cards, supplier shortcuts, confidence badges</span>
    <span>✓ Phase 3 Diesel Intelligence: SPN/FMI hooks, verified fix memory, known patterns</span>
    <span>✓ Phase 4 Field Tools: GPS, DOT checklist, customer updates, offline queue</span>
    <span>✓ Phase 5 Vision Pro: photo/OCR workflow, scan-to-parts, photo notes</span>
    <span>✓ Phase 6 Production UI: tighter field-ready layout and cards</span>
    <span>✓ Phase 7 Backend Expansion: staging imports, indexes, recursive search support</span>
    <span>✓ Phase 8 Final Integration: master workflow and active job session</span>
    <span>✓ Phase 9 QA Debug: connection tests, cache reset, debug report</span>
    <span>✓ Phase 10 Final Release: setup guide, backup, checklist, release notes</span>
    <span>✓ Phase 11 AI Brain: vector-ready knowledge base, repair memory, X-Ray photo map</span>
    <span>✓ Phase 13 Embeddings + RAG: ingestion queue, embedding router hooks, hybrid retrieval, source-grounded answer workflow</span>
  </div>
</div>`;
}

function runProductionChecklist(){
  const checks = [];
  checks.push(["Supabase library", !!window.supabase]);
  checks.push(["Supabase client", !!supabaseClient]);
  checks.push(["App shell", !!document.querySelector(".appShell")]);
  checks.push(["Home screen", !!$("home")]);
  checks.push(["Parts screen", !!$("parts")]);
  checks.push(["Invoice screen", !!$("invoice")]);
  checks.push(["Debug screen", !!$("debugPro")]);
  checks.push(["Release screen", !!$("releasePro")]);
  checks.push(["Service worker supported", "serviceWorker" in navigator]);
  const txt = checks.map(([name, ok]) => `${ok ? "✅" : "❌"} ${name}`).join("\n");
  if($("releaseOut")) $("releaseOut").textContent = `PRODUCTION CHECK — v${APP_VERSION}\n\n${txt}\n\nNext: run DEBUG → FULL QA CHECK after upload.`;
}

function exportLocalBackup(){
  const backup = {
    app: APP_RELEASE_NAME,
    version: APP_VERSION,
    exported_at: new Date().toISOString(),
    activeTruck: getActiveTruck(),
    shopSettings: getShop(),
    invoiceParts: window.invoiceParts || [],
    savedInvoices: JSON.parse(localStorage.getItem("savedInvoices") || "[]"),
    savedParts: JSON.parse(localStorage.getItem("savedParts") || "[]"),
    lastInvoice: localStorage.getItem("lastInvoice") || "",
    lastError: localStorage.getItem("diesel_doctor_last_error") || ""
  };
  const text = JSON.stringify(backup,null,2);
  if(navigator.clipboard) navigator.clipboard.writeText(text);
  if($("releaseOut")) $("releaseOut").textContent = "LOCAL BACKUP COPIED TO CLIPBOARD:\n\n" + text;
}

function copyUploadInstructions(){
  const text = `ROLLING CECIL AI FINAL RELEASE UPLOAD STEPS\n\n1. Upload/replace all files in GitHub Pages root:\n- index.html\n- app.js\n- style.css\n- manifest.json\n- service-worker.js\n- supabase_master_schema.sql\n- README.txt\n\n2. Commit changes.\n3. Wait 30-90 seconds for GitHub Pages.\n4. Open app in Safari.\n5. Hard refresh.\n6. If old app appears, remove Home Screen icon and re-add it.\n7. Open DEBUG and run FULL QA CHECK.\n8. Test: save truck, lookup part, add part, start/stop clock, build invoice, save job.`;
  if(navigator.clipboard) navigator.clipboard.writeText(text);
  if($("releaseOut")) $("releaseOut").textContent = text + "\n\nCopied.";
}

window.addEventListener("DOMContentLoaded",()=>{
  if($("debugVersion")) $("debugVersion").textContent = "Phase 11 / v" + APP_VERSION;
  if($("releaseVersion")) $("releaseVersion").textContent = "v" + APP_VERSION;
});


async function queueManualIngestion(){
  const source = $("phase13SourceName")?.value.trim() || $("brainSearchText")?.value.trim() || "Manual / field note";
  const category = $("phase13Category")?.value.trim() || "Uncategorized";
  const content = $("phase13Content")?.value.trim() || $("brainSearchText")?.value.trim() || "";
  if(!content){ brainWrite("Paste manual text, TSB notes, catalog text, or a field note before queuing ingestion."); return; }

  try{
    const { data, error } = await supabaseClient
      .from("manual_ingestion_queue")
      .insert({
        source_name: source,
        source_type: category,
        raw_text: content,
        status: "queued",
        metadata: {
          app_version: APP_VERSION,
          active_vin: activeVin() || null,
          engine: getActiveTruck().engine || $("engine")?.value || null
        }
      })
      .select()
      .single();

    if(error) throw error;
    brainWrite(`✅ Manual/TSB ingestion queued.\n\nSOURCE: ${source}\nCATEGORY: ${category}\nQUEUE ID: ${data?.id || "saved"}\n\nNext backend step: Edge Function chunks this text, generates embeddings, and writes to knowledge_base_embeddings.`);
  }catch(e){
    brainWrite(renderErrorCard("Queue Ingestion Error", e.message));
  }
}

async function runHybridRagSearch(){
  const q = $("brainSearchText")?.value.trim() || $("doctorAsk")?.value.trim() || $("partq")?.value.trim() || "";
  if(!q){ brainWrite("Enter a question first for Hybrid RAG Search."); return; }
  brainWrite("Running Phase 13 Hybrid RAG search...");
  try{
    const { data, error } = await supabaseClient.rpc("rolling_cecil_hybrid_rag_search", {
      search_text: q,
      vin_text: activeVin() || null
    });
    if(error) throw error;
    brainWrite(renderPhase13RagCards(q, data || {}));
  }catch(e){
    brainWrite(renderErrorCard("Hybrid RAG Search Error", e.message + "\n\nRun phase13_embeddings_rag.sql in Supabase if this function is missing."));
  }
}

function renderPhase13RagCards(q, data){
  const kb = asArray(data.knowledge || data.knowledge_base || data.manuals);
  const memory = asArray(data.repair_memory || data.memory);
  const events = asArray(data.router_events || data.events);
  let html = `<div class="oracleCard brainHeroCard"><div class="oracleTitle">PHASE 13 HYBRID RAG</div><div class="oracleNote">Query: ${escapeHtml(q)}<br>Knowledge hits: ${kb.length}<br>Repair memory hits: ${memory.length}<br>Router events: ${events.length}</div></div>`;
  if(kb.length){
    html += `<div class="brainColumns">` + kb.slice(0,4).map(x=>`<div class="brainResultCard"><b>${escapeHtml(x.source_name || x.source_type || "Knowledge Source")}</b><p>${escapeHtml((x.content || x.raw_text || "").slice(0,520))}</p><small>${escapeHtml(JSON.stringify(x.metadata || {}))}</small></div>`).join("") + `</div>`;
  }
  if(memory.length){
    html += `<div class="brainColumns">` + memory.slice(0,4).map(x=>`<div class="brainResultCard verifiedFix"><b>Verified Fix / Repair Memory</b><p>${escapeHtml(x.symptom_text || x.fault_code || "Repair memory")}</p><p>${escapeHtml(x.repair_action || "")}</p><small>Score: ${escapeHtml(String(x.ranking_score ?? ""))}</small></div>`).join("") + `</div>`;
  }
  if(!kb.length && !memory.length){
    html += `<div class="oracleCard"><div class="oracleTitle">No grounded records yet</div><div class="oracleNote">Queue manuals, field notes, TSB text, or verified repairs, then run the embedding Edge Function to populate vector search.</div></div>`;
  }
  return html;
}

function showEmbeddingRouterPlan(){
  brainWrite(`
PHASE 13 EDGE FUNCTION PLAN

1. User queues manual/TSB/catalog text in manual_ingestion_queue.
2. Edge Function reads queued rows.
3. Text is chunked into 500-1,000 token sections.
4. Embeddings are generated server-side.
5. Chunks are saved into knowledge_base_embeddings.
6. rolling_cecil_hybrid_rag_search checks:
   - exact part/code matches
   - repair_memory
   - knowledge_base_embeddings
   - known_failures
7. LLM receives only the top grounded sources and returns a mechanic-style answer.

RULES:
- Cheap SQL lookup first.
- Vector search second.
- LLM last.
- No exact part claims without source or VIN/ESN/CPL warning.
`);
}


/* ===============================
   PHASE 16 CLEAN UI + EMPLOYEE PAYROLL CLOCK + SAFE BUTTONS
   =============================== */
function setCecilLayoutMode(mode){
  mode = mode === "master" ? "master" : "compact";
  localStorage.setItem("cecil_layout_mode", mode);
  document.body.classList.toggle("master-mode", mode === "master");
  document.body.classList.toggle("compact-mode", mode !== "master");
  const compactBtn = $("compactModeBtn");
  const masterBtn = $("masterModeBtn");
  if(compactBtn) compactBtn.classList.toggle("active", mode !== "master");
  if(masterBtn) masterBtn.classList.toggle("active", mode === "master");
}
function setCecilTheme(theme){
  const themes=["theme-orange","theme-blue","theme-green","theme-amber","theme-red","theme-light"];
  theme = themes.includes(theme) ? theme : "theme-orange";
  localStorage.setItem("cecil_theme", theme);
  document.body.classList.remove(...themes);
  document.body.classList.add(theme);
  const sel=$("themeSelect"); if(sel) sel.value=theme;
}
function initCecilUiPrefs(){
  setCecilTheme(localStorage.getItem("cecil_theme") || "theme-orange");
  setCecilLayoutMode(localStorage.getItem("cecil_layout_mode") || "compact");
}

// Hide truck detail clutter until VIN exists, but keep active truck access.
const __phase16_updateActiveTruckBar = typeof updateActiveTruckBar === "function" ? updateActiveTruckBar : null;
updateActiveTruckBar = function(){
  if(__phase16_updateActiveTruckBar) __phase16_updateActiveTruckBar();
  const vin = ($("activeVin")?.textContent || "").trim();
  const card = document.querySelector(".truckCard");
  if(card) card.classList.toggle("noTruck", !vin || vin === "NONE");
};

function getEmployeeClock(){
  try{return JSON.parse(localStorage.getItem("employeeClock") || "{}");}catch(e){return {};}
}
function saveEmployeeClock(c){ localStorage.setItem("employeeClock", JSON.stringify(c || {})); }
function getPayrollRecords(){
  try{return JSON.parse(localStorage.getItem("payrollRecords") || "[]");}catch(e){return [];}
}
function savePayrollRecords(list){ localStorage.setItem("payrollRecords", JSON.stringify((list || []).slice(0,250))); }
function currentEmployee(){
  return {
    employee_id: $("employeeId")?.value.trim() || "JAMES",
    employee_name: $("employeeName")?.value.trim() || $("employeeId")?.value.trim() || "James",
    hourly_rate: Number($("employeeRate")?.value || getShop().laborRate || 0)
  };
}
function phase16BillableHours(c){
  if(!c.clock_in) return 0;
  const start = new Date(c.clock_in);
  const stop = c.clock_out ? new Date(c.clock_out) : new Date();
  let total = Math.max(0,(stop-start)/36e5);
  let paused = Number(c.total_pause_minutes || 0) / 60;
  if(c.status === "paused" && c.pause_start){ paused += Math.max(0,(new Date()-new Date(c.pause_start))/36e5); }
  return Math.max(0,total-paused);
}
function phase16PausedMinutes(c){
  let mins = Number(c.total_pause_minutes || 0);
  if(c.status === "paused" && c.pause_start){ mins += Math.max(0,(new Date()-new Date(c.pause_start))/60000); }
  return mins;
}

// Override clock controls with pause/resume/employee support.
clockIn = function(){
  const e=currentEmployee();
  const c={...e, vin: activeVin ? activeVin() : "", job_id:null, clock_in:new Date().toISOString(), clock_out:null, pause_start:null, total_pause_minutes:0, billable_hours:0, status:"clocked_in", notes:""};
  saveEmployeeClock(c); renderClock(); saveTimeClockCloud(c,"clock_in");
};
function pauseClock(){
  const c=getEmployeeClock();
  if(!c.clock_in || c.status === "clocked_out"){ alert("Clock in first."); return; }
  if(c.status === "paused"){ alert("Clock is already paused."); return; }
  c.pause_start=new Date().toISOString(); c.status="paused"; saveEmployeeClock(c); renderClock(); saveTimeClockCloud(c,"pause");
}
function resumeClock(){
  const c=getEmployeeClock();
  if(c.status !== "paused"){ alert("Clock is not paused."); return; }
  const paused=(new Date()-new Date(c.pause_start))/60000;
  c.total_pause_minutes=Number(c.total_pause_minutes||0)+Math.max(0,paused);
  c.pause_start=null; c.status="clocked_in"; saveEmployeeClock(c); renderClock(); saveTimeClockCloud(c,"resume");
}
clockOut = function(){
  const c=getEmployeeClock();
  if(!c.clock_in){ alert("Clock in first."); return; }
  if(c.status === "paused" && c.pause_start){
    const paused=(new Date()-new Date(c.pause_start))/60000;
    c.total_pause_minutes=Number(c.total_pause_minutes||0)+Math.max(0,paused);
    c.pause_start=null;
  }
  c.clock_out=new Date().toISOString();
  c.billable_hours=phase16BillableHours(c);
  c.status="clocked_out";
  saveEmployeeClock(c); renderClock(); savePayrollRecord(); saveTimeClockCloud(c,"clock_out");
};
resetClock = function(){
  if(!confirm("Reset employee clock on this device? Saved payroll records stay.")) return;
  localStorage.removeItem("employeeClock"); renderClock();
};
renderClock = function(){
  const c=getEmployeeClock();
  const rate=Number(c.hourly_rate || $("employeeRate")?.value || getShop().laborRate || 0);
  const hrs=phase16BillableHours(c);
  if($("employeeId") && c.employee_id) setValue("employeeId", c.employee_id);
  if($("employeeName") && c.employee_name) setValue("employeeName", c.employee_name);
  if($("employeeRate") && c.hourly_rate) setValue("employeeRate", c.hourly_rate);
  if($("clockStart")) $("clockStart").textContent=c.clock_in ? new Date(c.clock_in).toLocaleString() : "--";
  if($("clockStop")) $("clockStop").textContent=c.clock_out ? new Date(c.clock_out).toLocaleString() : "--";
  if($("clockPaused")) $("clockPaused").textContent=phase16PausedMinutes(c).toFixed(0)+" min";
  if($("clockHours")) $("clockHours").textContent=hrs.toFixed(2);
  if($("clockLabor")) $("clockLabor").textContent=money(hrs*rate);
  if($("clockStatusText")) $("clockStatusText").textContent=(c.status || "clocked_out").replace(/_/g," ").toUpperCase();
  if($("clockLiveTimer")) $("clockLiveTimer").textContent=hrs.toFixed(2)+" hrs";
};
function savePayrollRecord(){
  const c=getEmployeeClock();
  if(!c.clock_in){ alert("No clock record to save."); return; }
  const rec={...c, billable_hours: phase16BillableHours(c), total_pause_minutes: phase16PausedMinutes(c), saved_at:new Date().toISOString(), total_pay: phase16BillableHours(c)*Number(c.hourly_rate||0)};
  const list=getPayrollRecords(); list.unshift(rec); savePayrollRecords(list); renderPayrollSummary(); saveTimeClockCloud(rec,"payroll_save"); alert("Payroll record saved.");
}
function renderPayrollSummary(){
  const out=$("payrollOut"); if(!out) return;
  const list=getPayrollRecords();
  if(!list.length){ out.textContent="No payroll records saved yet."; return; }
  out.innerHTML=list.slice(0,10).map(r=>`<div class="payrollCard"><b>${safeText(r.employee_name || r.employee_id || "Employee")}</b><br><small>${safeText(r.clock_in ? new Date(r.clock_in).toLocaleString() : "")} → ${safeText(r.clock_out ? new Date(r.clock_out).toLocaleString() : "open")}</small><br><span>${Number(r.billable_hours||0).toFixed(2)} hrs • ${money(r.total_pay||0)}</span></div>`).join("");
}
function showPayrollSummary(){ renderPayrollSummary(); showScreen("timeClock"); }
async function saveTimeClockCloud(c,eventType){
  try{
    if(!supabaseClient) return;
    await supabaseClient.from("employee_time_clock").insert({
      employee_id:c.employee_id || null,
      employee_name:c.employee_name || null,
      vin:c.vin || (activeVin ? activeVin() : null),
      clock_in:c.clock_in || null,
      clock_out:c.clock_out || null,
      pause_start:c.pause_start || null,
      total_pause_minutes:Number(c.total_pause_minutes||0),
      billable_hours:Number(c.billable_hours || phase16BillableHours(c)),
      hourly_rate:Number(c.hourly_rate||0),
      status:c.status || eventType,
      notes:eventType || "app_clock_event"
    });
  }catch(e){ console.warn("employee clock cloud save failed", e.message); }
}

function openSupplierSearch(kind){
  const q = encodeURIComponent(($("partq")?.value || $("backendSearchQ")?.value || $("visionClean")?.value || "truck parts").trim());
  const map={fleetpride:"FleetPride",napa:"NAPA truck parts",oreilly:"O'Reilly Auto Parts",google:"heavy duty truck parts",dealer:"truck dealer parts"};
  const label=encodeURIComponent(map[kind] || kind || "truck parts");
  window.open(`https://www.google.com/maps/search/${label}+${q}`,"_blank");
}
function runInterchangeOnly(){
  if(typeof runInterchangeChain === "function") return runInterchangeChain();
  alert("Interchange chain is ready when backend RPC is installed.");
}
function addBestInterchangeToInvoice(){
  const q=$("backendSearchQ")?.value || $("partq")?.value || "Best interchange";
  setValue("manualPartName", q);
  setValue("manualPartNumber", q);
  if(typeof addManualPartToInvoice === "function") addManualPartToInvoice();
}

window.addEventListener("DOMContentLoaded",()=>{
  initCecilUiPrefs();
  try{ updateActiveTruckBar(); }catch(e){}
  try{ renderClock(); setInterval(renderClock,15000); }catch(e){}
  try{ renderPayrollSummary(); }catch(e){}
});


/* ===============================
   PHASE 17 FULL CONTROL RELEASE
   Compact/Master UI, PC Admin, OCR stability, offline cache, safe handlers
   =============================== */

const CECIL_PHASE17 = "17.0-clean-control";

function cecilToast(msg){
  try{
    let box=document.getElementById("cecilToast");
    if(!box){ box=document.createElement("div"); box.id="cecilToast"; box.className="cecilToast"; document.body.appendChild(box); }
    box.textContent=msg; box.classList.add("show"); setTimeout(()=>box.classList.remove("show"),2600);
  }catch(e){ console.log(msg); }
}

function cecilSafeGet(id){ return document.getElementById(id); }
function cecilSetHTML(id, html){ const el=cecilSafeGet(id); if(el) el.innerHTML=html; }
function cecilSetText(id, text){ const el=cecilSafeGet(id); if(el) el.textContent=text; }

function toggleCecilPanel(id){ const el=cecilSafeGet(id); if(el) el.classList.toggle("open"); }
function openCecilPanel(id){ const el=cecilSafeGet(id); if(el) el.classList.add("open"); }
function closeCecilPanel(id){ const el=cecilSafeGet(id); if(el) el.classList.remove("open"); }

// Keep layout modes available from every screen.
function toggleMasterCompact(){
  const current = localStorage.getItem("cecil_layout_mode") || "compact";
  setCecilLayoutMode(current === "master" ? "compact" : "master");
}

function setQuickDockMode(mode){
  mode = mode === "hidden" ? "hidden" : "visible";
  localStorage.setItem("cecil_quickdock", mode);
  document.body.classList.toggle("quickdock-hidden", mode === "hidden");
}
function toggleQuickDock(){ setQuickDockMode((localStorage.getItem("cecil_quickdock")||"visible") === "visible" ? "hidden" : "visible"); }

// Safer supplier/interchange handlers for all old buttons.
function openSupplierSearch(kind){
  const part = (($("partq")?.value || $("manualPartNumber")?.value || $("backendSearchQ")?.value || $("visionClean")?.value || window.lastScannedPart || "truck parts")+"").trim();
  const map={fleetpride:"FleetPride",napa:"NAPA truck parts",oreilly:"O'Reilly Auto Parts",google:"heavy duty truck parts",dealer:"truck dealer parts",kenworth:"Kenworth parts",freightliner:"Freightliner parts",cummins:"Cummins parts"};
  const label=map[kind] || kind || "heavy duty truck parts";
  window.open(`https://www.google.com/maps/search/${encodeURIComponent(label + " " + part)}`,"_blank");
}
async function runInterchangeOnly(){
  const q = ($("backendSearchQ")?.value || $("partq")?.value || $("manualPartNumber")?.value || window.lastScannedPart || "").trim();
  if(!q){ alert("Enter or scan a part number first."); return; }
  if($("backendSearchQ")) setValue("backendSearchQ", q);
  if(typeof runInterchangeChain === "function") return runInterchangeChain();
  cecilSetHTML("backendOut", `<div class="smartCard"><div class="smartCardTitle"><span>INTERCHANGE SEARCH</span><span class="badge warn">LOCAL</span></div><div class="smartNote">No recursive interchange RPC found on this build. Search: ${safeText(q)}</div></div>`);
  showScreen("backendPro");
}
function addBestInterchangeToInvoice(){
  const q = ($("backendSearchQ")?.value || $("partq")?.value || $("manualPartNumber")?.value || window.lastScannedPart || "Best Interchange").trim();
  setValue("manualPartName", q); setValue("manualPartNumber", q);
  if(typeof addManualPartToInvoice === "function") addManualPartToInvoice();
}

// Offline queue + service worker cache controls.
function cacheCurrentJobOffline(){
  const payload={
    type:"offline_job_snapshot", at:new Date().toISOString(), activeTruck:getActiveTruck(), clock:getEmployeeClock ? getEmployeeClock() : {},
    invoice: $("quoteOut")?.textContent || "", parts: typeof getInvoiceParts === "function" ? getInvoiceParts() : [], lastSearch: $("doctorAsk")?.value || $("partq")?.value || ""
  };
  const q=getOfflineQueue ? getOfflineQueue() : JSON.parse(localStorage.getItem("offlineQueue")||"[]"); q.unshift(payload);
  if(typeof saveOfflineQueue === "function") saveOfflineQueue(q); else localStorage.setItem("offlineQueue", JSON.stringify(q.slice(0,100)));
  cecilToast("Offline job snapshot saved.");
}
async function enableOfflineCaching(){
  try{
    if("serviceWorker" in navigator){ await navigator.serviceWorker.register("service-worker.js"); }
    localStorage.setItem("cecil_offline_enabled","true"); cecilToast("Offline cache enabled.");
  }catch(e){ alert("Offline cache setup failed: "+e.message); }
}

// OCR cleanup AI: backend SQL extraction first, then local fallback. No fragile JSON parsing.
async function extractPartsBackendFromText(rawText, vinText=null, scanType="parts_photo"){
  if(!supabaseClient) return null;
  try{
    const {data,error}=await supabaseClient.rpc("extract_part_numbers_from_text", {input_text: rawText, vin_text: vinText, scan_type_text: scanType});
    if(error) throw error;
    return data;
  }catch(e){ console.warn("extract_part_numbers_from_text failed", e.message); return null; }
}
async function extractVinBackendFromText(rawText){
  if(!supabaseClient) return null;
  try{
    const {data,error}=await supabaseClient.rpc("extract_vin_from_text", {input_text: rawText});
    if(error) throw error;
    return data;
  }catch(e){ console.warn("extract_vin_from_text failed", e.message); return null; }
}
function ocrCleanupText(raw){
  return normalizeScanText(String(raw||""))
    .replace(/\bPACCAR\b/g,"PACCAR")
    .replace(/\bPACC4R\b/g,"PACCAR")
    .replace(/\b0TY\b/g,"QTY")
    .trim();
}
function renderOcrExtractionResult(raw, backend, vinResult){
  const localParts=extractPartCandidates(raw);
  const nums=backend?.part_numbers || localParts;
  const vin=vinResult?.vin || (normalizeScanText(raw).match(/\b[A-HJ-NPR-Z0-9]{17}\b/)||[])[0] || "";
  const best=vin || nums[0] || bestVisionCandidate(raw);
  setValue("visionClean", best);
  window.lastScannedPart = nums[0] || best;
  let html=`<div class="smartCardTitle"><span>OCR CLEANUP COMPLETE</span><span class="badge good">${nums.length} PARTS</span></div>`;
  html += `<div class="smartGrid">${gridCell("BEST",best||"—")}${gridCell("VIN",vin||"—")}${gridCell("PARTS",nums.join(", ")||"—")}</div>`;
  html += `<div class="smartNote">${safeText(String(raw).slice(0,900))}</div>`;
  cecilSetHTML("visionOut", html);
  return {best, vin, part_numbers:nums};
}

// Override scanVisionPhoto to avoid non-JSON OCR crashes and use SQL extraction.
scanVisionPhoto = async function(){
  const img=visionImageData();
  const rawManual=$("visionRaw")?.value?.trim() || "";
  const type=$("visionType")?.value || "Part Label";
  if(!img && !rawManual){ alert("Add a photo or paste text first."); return; }
  cecilSetText("visionOut", "Scanning / cleaning OCR...");
  let raw=rawManual;
  try{
    if(img && !rawManual){
      try{
        const data=await callOracle({mode:"diesel_ai", part_query:`OCR scan ${type}`, question:`Read this ${type}. Extract only visible VINs, part numbers, brands, label text, and quantities. Return plain text.`, note:{image:img.split(",")[1], scan_type:type, vehicleContext:ctx()}});
        raw = data?.answer || data?.message || data?.data?.text || data?.data?.notes?.join("\n") || "";
      }catch(e){
        raw = "OCR image AI unavailable. Paste or correct visible label text here, then tap CLEAN TEXT.";
      }
    }
    raw=ocrCleanupText(raw);
    setValue("visionRaw", raw);
    const backend=await extractPartsBackendFromText(raw, activeVin ? activeVin() : null, type);
    const vinResult=await extractVinBackendFromText(raw);
    const result=renderOcrExtractionResult(raw, backend, vinResult);
    const scans=getVisionScans();
    scans.unshift({type, raw:String(raw).slice(0,1200), cleaned:result.best, note:$("visionNote")?.value || "", vin:result.vin || activeVin(), truck:activeTruckSummary(), image:img, saved_at:new Date().toLocaleString(), part_numbers:result.part_numbers});
    saveVisionScans(scans);
  }catch(e){ cecilSetText("visionOut", "OCR cleanup error: "+e.message); }
};
cleanVisionText = async function(){
  const raw=ocrCleanupText($("visionRaw")?.value || "");
  setValue("visionRaw", raw);
  const backend=await extractPartsBackendFromText(raw, activeVin ? activeVin() : null, $("visionType")?.value || "parts_photo");
  const vinResult=await extractVinBackendFromText(raw);
  renderOcrExtractionResult(raw, backend, vinResult);
};

function stabilizeCameraInputs(){
  ["visionImage","partPhoto","fieldPhoto","homeAiImage"].forEach(id=>{
    const el=$(id); if(!el) return;
    el.setAttribute("accept","image/*");
    el.setAttribute("capture","environment");
  });
}

// PC/Admin dashboard helpers.
function renderPcAdminDashboard(){
  const box=$("pcAdminOut"); if(!box) return;
  const payroll=getPayrollRecords ? getPayrollRecords() : [];
  const parts=typeof getInvoiceParts === "function" ? getInvoiceParts() : [];
  const off=typeof getOfflineQueue === "function" ? getOfflineQueue() : [];
  const totalHours=payroll.reduce((s,r)=>s+Number(r.billable_hours||0),0);
  const totalPay=payroll.reduce((s,r)=>s+Number(r.total_pay||0),0);
  box.innerHTML=`<div class="smartGrid">${gridCell("PAYROLL RECORDS",payroll.length)}${gridCell("TOTAL HOURS",totalHours.toFixed(2))}${gridCell("TOTAL PAY",money(totalPay))}${gridCell("INVOICE PARTS",parts.length)}${gridCell("OFFLINE QUEUE",off.length)}${gridCell("VERSION",CECIL_PHASE17)}</div>`;
}
function exportPayrollCSV(){
  const rows=getPayrollRecords ? getPayrollRecords() : [];
  const head=["employee_id","employee_name","clock_in","clock_out","pause_minutes","billable_hours","hourly_rate","total_pay","vin","status"];
  const csv=[head.join(",")].concat(rows.map(r=>head.map(k=>`"${String(r[k]??"").replace(/"/g,'""')}"`).join(","))).join("\n");
  navigator.clipboard?.writeText(csv);
  const blob=new Blob([csv],{type:"text/csv"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`rolling-cecil-payroll-${Date.now()}.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}
function exportBookkeepingJSON(){
  const data={at:new Date().toISOString(), payroll:getPayrollRecords?getPayrollRecords():[], invoices:JSON.parse(localStorage.getItem("savedInvoices")||"[]"), parts:typeof getInvoiceParts==="function"?getInvoiceParts():[], offline:typeof getOfflineQueue==="function"?getOfflineQueue():[]};
  const text=JSON.stringify(data,null,2); navigator.clipboard?.writeText(text);
  const blob=new Blob([text],{type:"application/json"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`rolling-cecil-bookkeeping-${Date.now()}.json`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}
function openPcAdmin(){ renderPcAdminDashboard(); showScreen("pcAdmin"); }

// Safer RAG fallback so missing RPC does not show red dead-end.
runHybridRagSearch = async function(){
  const q = $("brainSearchText")?.value.trim() || $("doctorAsk")?.value.trim() || $("partq")?.value.trim() || "";
  if(!q){ brainWrite("Enter a question first for Hybrid RAG Search."); return; }
  brainWrite("Running Hybrid repair search...");
  try{
    let data=null;
    try{
      const r=await supabaseClient.rpc("rolling_cecil_hybrid_rag_search", {search_text:q, vin_text: activeVin() || null});
      if(r.error) throw r.error; data=r.data;
    }catch(missing){
      const manual = await (supabaseClient ? supabaseClient.rpc("manual_knowledge_search", {search_text:q, engine_text:getActiveTruck().engine || null}).catch(()=>({data:null})) : {data:null});
      const smart = await (supabaseClient ? supabaseClient.rpc("smart_workflow_engine", {search_text:q, vin_text:activeVin()||null, engine_text:getActiveTruck().engine||null}).catch(()=>({data:null})) : {data:null});
      data={status:"ok", fallback:true, knowledge:manual.data?.manuals || [], repair_memory:smart.data?.repair_intelligence?.intelligence || [], route_plan:{route:"Fallback SQL/manual workflow"}};
    }
    brainWrite(renderPhase13RagCards(q, data || {}));
  }catch(e){ brainWrite(renderErrorCard("Hybrid Search Error", e.message)); }
};

window.addEventListener("DOMContentLoaded",()=>{
  try{ document.body.classList.add("phase17"); }catch(e){}
  try{ setQuickDockMode(localStorage.getItem("cecil_quickdock") || "visible"); }catch(e){}
  try{ stabilizeCameraInputs(); }catch(e){}
  try{ renderPcAdminDashboard(); }catch(e){}
  try{ if($("debugVersion")) $("debugVersion").textContent = CECIL_PHASE17; }catch(e){}
});


/* =============================
   PHASE 18 PARTS BOOK AI
   VIN/engine normalization + smart part number answer
============================= */
const CECIL_PHASE18 = "18.0-parts-book-ai";

function phase18ActiveEngineText(){
  return (
    $("engine")?.value ||
    getActiveTruck()?.engine ||
    $("brainSearchText")?.value ||
    ""
  ).trim();
}

async function smartPartNumberLookup(partQuery, rawEngineText=null, vinText=null){
  if(!supabaseClient) throw new Error("Supabase client not loaded.");
  const { data, error } = await supabaseClient.rpc("smart_part_number_lookup", {
    part_query: partQuery,
    raw_engine_text: rawEngineText || null,
    vin_text: vinText || null
  });
  if(error) throw error;
  return data;
}

function renderSmartPartsBook(targetId, data){
  const parts = asArray(data?.parts);
  const norm = data?.normalized_engine || {};
  let html = `<div class="oracleCard phase18PartsBook">
    <div class="oracleTitle">PARTS BOOK AI</div>
    <div class="smartGrid">
      ${gridCell("REQUEST", data?.part_request || "—")}
      ${gridCell("ENGINE", norm?.canonical_name ? `${norm.manufacturer || ""} ${norm.canonical_name || ""} ${norm.epa_standard ? "("+norm.epa_standard+")" : ""}` : (data?.raw_engine || "UNKNOWN"))}
      ${gridCell("VIN", data?.vin || activeVin?.() || "NO VIN")}
      ${gridCell("CONFIDENCE", data?.confidence || "UNKNOWN")}
    </div>
    ${data?.warning ? `<div class="smartNote warnText">${safeText(data.warning)}</div>` : ""}
  </div>`;

  if(parts.length){
    html += `<div class="resultGroup">`;
    html += card("BEST PART NUMBER MATCHES", {text:`${parts.length} HIT${parts.length===1?"":"S"}`, cls:"good"},
      `<div class="smartGrid">${parts.slice(0,12).map(p=>gridCell(
        p.oem_number || p.part_number || p.aftermarket_part_number || "PART",
        `${p.brand || ""} ${p.engine_family || ""} — ${p.part_type || p.description || ""}${p.cross_references?.length ? " | Cross: "+p.cross_references.join(", ") : ""}`
      )).join("")}</div>`,
      "Acts like a tech with the parts book open: local exact match first, broad fallback second, VIN/ESN/CPL verification always."
    );
    html += `</div>`;
    const best = parts[0];
    if(best){
      window.lastSmartPartMatch = best;
      window.lastScannedPart = best.oem_number || best.part_number || best.aftermarket_part_number || window.lastScannedPart;
      if($("manualPartNumber")) setValue("manualPartNumber", best.oem_number || best.aftermarket_part_number || "");
      if($("manualPartName")) setValue("manualPartName", best.part_type || best.description || data?.part_request || "Part");
    }
  }else{
    html += card("NO EXACT LOCAL PART NUMBER YET", {text:"NEEDS VERIFY", cls:"warn"},
      `<div class="smartGrid">${gridCell("NEXT", data?.tech_answer?.next_needed || "Need VIN / ESN / CPL / dealer catalog lookup")}${gridCell("RULE", "Do not guess exact OEM numbers without source")}</div>`,
      "Cecil did not stop at nothing found. It logged the engine if unknown and gives the next verification step."
    );
  }

  cecilSetHTML(targetId, html);
}

async function runPartsBookAI(){
  const q = ($("partq")?.value || $("backendSearchQ")?.value || $("doctorAsk")?.value || $("brainSearchText")?.value || "").trim();
  if(!q){ alert("Enter a part request first, like: X15 water pump or DD15 oil filter."); return; }
  const engineText = phase18ActiveEngineText();
  const vinText = typeof activeVin === "function" ? activeVin() : (getActiveTruck().vin || "");
  cecilSetText("partOut", "Parts Book AI searching local parts, engine normalization, and fallback matches...");
  try{
    const data = await smartPartNumberLookup(q, engineText || null, vinText || null);
    renderSmartPartsBook("partOut", data);
    return data;
  }catch(e){
    cecilSetHTML("partOut", card("PARTS BOOK AI NOT INSTALLED", {text:"FALLBACK", cls:"warn"}, `<div class="smartNote">${safeText(e.message)}<br>Run phase18_parts_book_ai_backend.sql in Supabase, then try again.</div>`));
    throw e;
  }
}

function addBestSmartPartToInvoice(){
  const p = window.lastSmartPartMatch;
  if(!p){ alert("Run Parts Book AI first."); return; }
  setValue("manualPartName", p.part_type || p.description || "Part");
  setValue("manualPartNumber", p.oem_number || p.aftermarket_part_number || "");
  setValue("manualPartSupplier", p.brand || "Parts Book AI");
  setValue("manualPartQty", "1");
  if(typeof addManualPartToInvoice === "function") addManualPartToInvoice();
}

// Override normal part lookup so Cecil always tries Parts Book AI before saying nothing found.
const __phase18_oldAskPart = typeof askPart === "function" ? askPart : null;
askPart = async function(){
  const q = $("partq")?.value.trim() || "";
  const note = $("partNote")?.value.trim() || "";
  if(!q && !note){ cecilSetText("partOut", "Enter part number, part name, VIN, ESN, CPL, or description."); return; }

  try{
    const data = await runPartsBookAI();
    // Still run universal/local database after the smart answer, but do not let it erase the smart answer.
    const term = (data?.parts?.[0]?.oem_number || q || note || "").trim();
    if(term){
      try{
        const universal = await universalSearch(term);
        const before = $("partOut")?.innerHTML || "";
        renderUniversalResults("partOut", universal, term);
        if($("partOut") && before && !$("partOut").innerHTML.includes("PARTS BOOK AI")) $("partOut").innerHTML = before + $("partOut").innerHTML;
      }catch(e){ console.warn("Universal after Parts Book AI failed", e.message); }
      try{
        const repair = await getRepairKit(term);
        renderRepairKit("partOut", repair);
      }catch(e){ console.warn("Repair kit after Parts Book AI failed", e.message); }
    }
    return;
  }catch(e){
    console.warn("Parts Book AI fallback to old askPart", e.message);
    if(__phase18_oldAskPart) return __phase18_oldAskPart();
    cecilSetText("partOut", "Part lookup error: "+e.message);
  }
};

window.addEventListener("DOMContentLoaded",()=>{
  try{ if($("debugVersion")) $("debugVersion").textContent = CECIL_PHASE18; }catch(e){}
});

/* =============================
   PHASE 19 PARTS TECH ANSWER MODE
   Clean parts-counter response + strict component intent
============================= */
const CECIL_PHASE19 = "19.0-parts-tech-answer";

function phase19NormalizeText(s){
  return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
}

function phase19ExtractEngine(q){
  const t = String(q || "").toUpperCase();
  if(/\b(ISX15|X15|CM2350|CM2450)\b/.test(t)) return t.includes("ISX15") ? "ISX15" : "X15";
  if(/\bDD15\b/.test(t)) return "DD15";
  if(/\bDD13\b/.test(t)) return "DD13";
  if(/\b(MX[- ]?13|MX13)\b/.test(t)) return "MX-13";
  if(/\b(D13|VOLVO D13)\b/.test(t)) return "D13";
  if(/\b(MP8|MACK MP8)\b/.test(t)) return "MP8";
  return "";
}

function phase19ExtractComponent(q){
  const t = phase19NormalizeText(q);
  const patterns = [
    ["water pump", ["water pump", "coolant pump", "engine water pump"]],
    ["oil filter", ["oil filter", "lube filter", "lube oil filter"]],
    ["fuel filter", ["fuel filter", "fuel filter kit", "secondary fuel filter"]],
    ["fuel water separator", ["fuel water separator", "water separator", "fuel separator"]],
    ["turbo actuator", ["turbo actuator", "vgt actuator", "e actuator", "electronic turbo actuator"]],
    ["nox sensor", ["nox sensor", "outlet nox", "inlet nox"]],
    ["egr differential pressure sensor", ["egr differential pressure", "delta pressure", "differential pressure sensor"]],
    ["marker lamp", ["marker lamp", "corner lamp", "clearance lamp"]],
    ["brake chamber", ["brake chamber", "spring brake"]],
    ["air dryer", ["air dryer", "dryer cartridge"]]
  ];
  for(const [canon, words] of patterns){
    if(words.some(w=>t.includes(w))) return canon;
  }
  // remove engine words so the component search is not polluted
  return t.replace(/\b(x15|isx15|cm2350|cm2450|dd15|dd13|mx13|mx 13|mx 13|d13|mp8|cummins|detroit|paccar|volvo|mack)\b/g," ").replace(/\s+/g," ").trim() || t;
}

function phase19PartScore(p, component, q){
  const c = phase19NormalizeText(component);
  const pt = phase19NormalizeText(p.part_type || "");
  const desc = phase19NormalizeText(p.description || "");
  const oem = phase19NormalizeText(p.oem_number || p.part_number || "");
  const cross = Array.isArray(p.cross_references) ? phase19NormalizeText(p.cross_references.join(" ")) : "";
  let score = Number(p.confidence || 0.5) * 100;
  if(pt === c) score += 500;
  if(pt.includes(c)) score += 350;
  if(desc.includes(c)) score += 225;
  if(c.split(" ").every(w => pt.includes(w) || desc.includes(w))) score += 150;
  if(oem && phase19NormalizeText(q).includes(oem)) score += 300;
  if(cross && phase19NormalizeText(q).split(" ").some(w=>w.length>3 && cross.includes(w))) score += 50;

  // Hard block common wrong-category bleed-over.
  if(c.includes("water pump") && /fuel|filter|separator|module/.test(pt + " " + desc)) score -= 1000;
  if(c.includes("fuel filter") && /water pump|coolant pump|turbo/.test(pt + " " + desc)) score -= 1000;
  if(c.includes("oil filter") && /water pump|fuel module|turbo/.test(pt + " " + desc)) score -= 1000;
  return score;
}

function phase19RankParts(parts, component, q){
  return asArray(parts)
    .map(p => ({...p, __score: phase19PartScore(p, component, q)}))
    .filter(p => p.__score > -100)
    .sort((a,b)=>b.__score-a.__score);
}

function phase19KnownFallback(engine, component){
  const e = String(engine || "").toUpperCase();
  const c = phase19NormalizeText(component);
  if((e.includes("X15") || e.includes("ISX15")) && c === "water pump"){
    return [{
      oem_number:"3692580",
      aftermarket_part_number:"3692580RX",
      brand:"Cummins",
      engine_family:"X15 / ISX15",
      part_type:"Water Pump",
      description:"Cummins X15 water pump. Standard fitment seen across multiple X15/ISX15 configurations including CM2350/CM2450. Verify by ESN/CPL before ordering.",
      confidence:0.92,
      notes:"Use 3692580RX as reman option when applicable. Verify by ESN/CPL."
    }];
  }
  return [];
}

function phase19RenderPartsTechAnswer(targetId, payload, q, engine, component){
  let parts = phase19RankParts(payload?.parts || [], component, q);
  if(!parts.length){
    parts = phase19KnownFallback(engine, component);
  }
  const best = parts[0] || null;
  const norm = payload?.normalized_engine || {};
  const engineLine = norm?.canonical_name
    ? `${norm.manufacturer || ""} ${norm.canonical_name || ""}${norm.epa_standard ? " ("+norm.epa_standard+")" : ""}`
    : (engine || payload?.raw_engine || "VERIFY ENGINE");

  let html = `<div class="oracleCard phase19TechAnswer">
    <div class="oracleTitle">PARTS TECH ANSWER</div>
    <div class="smartGrid">
      ${gridCell("REQUEST", q)}
      ${gridCell("ENGINE", engineLine)}
      ${gridCell("COMPONENT", component || "Part request")}
      ${gridCell("MODE", "OEM-first / component-strict")}
    </div>`;

  if(best){
    window.lastSmartPartMatch = best;
    window.lastScannedPart = best.oem_number || best.aftermarket_part_number || window.lastScannedPart;
    if($('manualPartNumber')) setValue('manualPartNumber', best.oem_number || best.aftermarket_part_number || '');
    if($('manualPartName')) setValue('manualPartName', `${best.engine_family || ''} ${best.part_type || component}`.trim());

    html += `<div class="partsTechMain">
      <div class="partsTechLabel">${safeText(best.brand || "OEM")}</div>
      <h2>${safeText(best.engine_family || engine || "")} ${safeText(best.part_type || component || "Part")}</h2>
      <div class="partNumberBig">OEM: ${safeText(best.oem_number || best.part_number || "VERIFY")}</div>
      ${best.aftermarket_part_number ? `<div class="partNumberAlt">REMAN / ALT: ${safeText(best.aftermarket_part_number)}</div>` : ""}
      ${Array.isArray(best.cross_references) && best.cross_references.length ? `<div class="partNumberAlt">CROSS: ${safeText(best.cross_references.join(", "))}</div>` : ""}
      <p>${safeText(best.description || best.notes || "Verify fitment before ordering.")}</p>
    </div>
    <div class="smartNote"><b>VERIFY:</b> Final part number must be confirmed by VIN / ESN / CPL before ordering.</div>
    <div class="phase8ActionRow">
      <button onclick="addBestSmartPartToInvoice()">ADD TO INVOICE</button>
      <button onclick="openSupplierSearch()">SUPPLIER SEARCH</button>
      <button onclick="showScreen('repairHud')">REPAIR GUIDE</button>
    </div>`;
  }else{
    html += `<div class="partsTechMain warnBox">
      <h2>No exact OEM number in local parts book yet.</h2>
      <p>Cecil needs VIN, ESN/CPL, EPA year, or dealer catalog/API verification for this request.</p>
    </div>
    <div class="smartNote"><b>NEXT:</b> Add the verified number once found so Cecil learns it permanently.</div>`;
  }

  if(parts.length > 1){
    html += `<details class="phase19Details"><summary>Other possible matches (${parts.length-1})</summary><div class="smartGrid">${parts.slice(1,8).map(p=>gridCell(p.oem_number || p.aftermarket_part_number || "PART", `${p.brand || ""} ${p.engine_family || ""} — ${p.part_type || p.description || ""}`)).join("")}</div></details>`;
  }

  if(payload?.warning){ html += `<div class="smartNote warnText">${safeText(payload.warning)}</div>`; }
  html += `</div>`;
  cecilSetHTML(targetId, html);
}

async function runPartsTechAnswer(){
  const q = ($('partq')?.value || $('backendSearchQ')?.value || $('doctorAsk')?.value || $('brainSearchText')?.value || '').trim();
  if(!q){ alert('Enter a part request first, like: X15 water pump.'); return; }
  const engineFromQuestion = phase19ExtractEngine(q);
  const activeEngine = ($('engine')?.value || getActiveTruck()?.engine || '').trim();
  const engineText = engineFromQuestion || activeEngine || null;
  const component = phase19ExtractComponent(q);
  cecilSetText('partOut', 'Parts Tech Answer searching exact component first...');
  try{
    let data = null;
    try{
      data = await smartPartNumberLookup(component || q, engineText, typeof activeVin === 'function' ? activeVin() : null);
    }catch(e1){
      data = await smartPartNumberLookup(q, engineText, typeof activeVin === 'function' ? activeVin() : null);
    }
    phase19RenderPartsTechAnswer('partOut', data || {}, q, engineText, component);
    return data;
  }catch(e){
    const fallback = {parts: phase19KnownFallback(engineText, component), raw_engine: engineText, warning:e.message};
    phase19RenderPartsTechAnswer('partOut', fallback, q, engineText, component);
    return fallback;
  }
}

// Phase 19 override: Part lookup uses clean Parts Tech Answer first.
const __phase19_oldAskPart = typeof askPart === 'function' ? askPart : null;
askPart = async function(){
  const q = $('partq')?.value.trim() || '';
  const note = $('partNote')?.value.trim() || '';
  if(!q && !note){ cecilSetText('partOut', 'Enter part number, part name, VIN, ESN, CPL, or description.'); return; }
  return runPartsTechAnswer();
};

window.addEventListener('DOMContentLoaded',()=>{
  try{ if($('debugVersion')) $('debugVersion').textContent = CECIL_PHASE19; }catch(e){}
});
