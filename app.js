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

  const map = {home:1,dieselAI:2,faultDoctor:2,parts:3,schematics:4,repairHud:4,settings:5,invoice:5,team:5,voice:5,vin:1,timeClock:5};
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
    const map = {home:1,dieselAI:2,faultDoctor:2,parts:3,schematics:4,repairHud:4,settings:5,invoice:5,team:5,voice:5,vin:1,timeClock:5};
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
  $("diagOut").textContent = "Fault Doctor running...";
  try{
    const data = await callOracle({part_query:q,question:q,note,mode:"fault_doctor"});
    $("diagOut").textContent = formatOracleData(data);
  }catch(e){ $("diagOut").textContent = "DIAGNOSTIC ERROR: " + e.message; }
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
