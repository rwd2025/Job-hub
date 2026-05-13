const SUPABASE_URL = "https://uxpkqwcmvtqvubibbrek.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4cGtxd2NtdnRxdnViaWJicmVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMzk4NjQsImV4cCI6MjA5MjgxNTg2NH0.afiaSFqkRFEXW5nPQVRXKZcpKkS6iF3T_hTQC2P15HQ";
const API_URL = "https://uxpkqwcmvtqvubibbrek.supabase.co/functions/v1/oracle-parts-search";

const $ = id => document.getElementById(id);
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

function setValue(id,val){
  const el = $(id);
  if(el) el.value = val || "";
}

function showScreen(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  if($(id)) $(id).classList.add("active");

  document.querySelectorAll(".bottomNav button").forEach(b=>b.classList.remove("active"));

  const map = {
    home:1,
    dieselAI:2,
    faultDoctor:2,
    parts:3,
    schematics:4,
    repairHud:4,
    settings:5,
    invoice:5,
    team:5,
    voice:5,
    vin:1
  };

  const index = map[id] || 1;
  const btn = document.querySelector(`.bottomNav button:nth-child(${index})`);
  if(btn) btn.classList.add("active");

  const menu = $("sideMenu");
  if(menu) menu.classList.remove("open");

  window.scrollTo({top:0,behavior:"smooth"});
}

function toggleSideMenu(){
  $("sideMenu")?.classList.toggle("open");
}

function underConstruction(name){
  alert(name + " is under construction.\n\nThis button is ready. Backend feature coming soon.");
}

function getShop(){
  return {
    name:"Rolling Wrench Diesel LLC",
    phone:"260-502-6222",
    website:"www.rollingwrenchdiesel.com",
    laborRate:"135",
    serviceCall:"250",
    tax:"0",
    cardFee:"0",
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

  setValue("shopName",s.name);
  setValue("shopPhone",s.phone);
  setValue("shopWebsite",s.website);
  setValue("defaultLaborRate",s.laborRate);
  setValue("defaultServiceCall",s.serviceCall);
  setValue("defaultTax",s.tax);
  setValue("defaultCardFee",s.cardFee);
  setValue("shopTerms",s.terms);

  setValue("laborRate",s.laborRate);
  setValue("serviceCall",s.serviceCall);
  setValue("taxRate",s.tax);
  setValue("cardFee",s.cardFee);
}

function getActiveTruck(){
  return JSON.parse(localStorage.getItem("activeTruck") || "{}");
}

function updateActiveTruckBar(){
  const t = getActiveTruck();
  $("activeVin").textContent = t.vin || "NONE";
  $("activeYear").textContent = t.year || "----";
  $("activeMake").textContent = t.make || "----";
  $("activeModel").textContent = t.model || "----";
  $("activeEngine").textContent = t.engine || "----";
  $("activeEsn").textContent = t.esn || "----";
  $("activeCpl").textContent = t.cpl || "----";
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
  setValue("vinGlobal",t.vin);
  setValue("yearGlobal",t.year);
  setValue("makeGlobal",t.make);
  setValue("modelGlobal",t.model);
  setValue("engine",t.engine);
  setValue("esnGlobal",t.esn);
  setValue("cplGlobal",t.cpl);
  setValue("invoiceVin",t.vin);
  setValue("invoiceTruck",`${t.year || ""} ${t.make || ""} ${t.model || ""}`.trim());
}

function clearVehicleData(){
  localStorage.removeItem("activeTruck");
  ["vinGlobal","yearGlobal","makeGlobal","modelGlobal","engine","esnGlobal","cplGlobal","invoiceVin","invoiceTruck"].forEach(id=>setValue(id,""));
  updateActiveTruckBar();
  alert("Active truck cleared.");
}

function ctx(){
  return `
VIN: ${$("vinGlobal")?.value || $("invoiceVin")?.value || getActiveTruck().vin || "none"}
Year: ${$("yearGlobal")?.value || getActiveTruck().year || "unknown"}
Make: ${$("makeGlobal")?.value || getActiveTruck().make || "unknown"}
Model: ${$("modelGlobal")?.value || getActiveTruck().model || "unknown"}
Engine: ${$("engine")?.value || getActiveTruck().engine || "unknown"}
ESN: ${$("esnGlobal")?.value || getActiveTruck().esn || "unknown"}
CPL: ${$("cplGlobal")?.value || getActiveTruck().cpl || "unknown"}
`.trim();
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

  const res = await fetch(API_URL,{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "apikey":SUPABASE_KEY,
      "Authorization":"Bearer " + SUPABASE_KEY
    },
    body:JSON.stringify(body)
  });

  const data = await res.json();

  if(!res.ok){
    throw new Error(data.error || JSON.stringify(data));
  }

  return data;
}

function formatOracleData(data){
  const d = data?.data || data || {};

  if(typeof data === "string") return data;
  if(data.answer) return data.answer;
  if(data.message) return data.message;

  return `
PART: ${d.oem_part || d.part || "UNKNOWN"}
YEAR: ${d.year || "UNKNOWN"}
MAKE: ${d.make || "UNKNOWN"}
MODEL: ${d.model || "UNKNOWN"}
ENGINE: ${d.engine || "UNKNOWN"}
VIN: ${d.vin || "NO VIN"}
ESN: ${d.esn || "NO ESN"}
CPL: ${d.cpl || "NO CPL"}
FITMENT: ${d.verified_fitment ? "VIN / ESN / CPL CONTEXT PROVIDED" : "NEEDS VIN / ESN / CPL"}

SOURCE: ${data.source || "oracle"}

NOTES:
${(d.notes || []).join("\n") || "No notes returned."}
`.trim();
}

function renderOracleCard(targetId,title,data){
  const d = data?.data || {};

  $(targetId).innerHTML = `
<div class="oracleCard">
  <div class="oracleTitle">${title}</div>
  <div class="vinGrid">
    <div><b>PART</b><span>${d.oem_part || "UNKNOWN"}</span></div>
    <div><b>YEAR</b><span>${d.year || "UNKNOWN"}</span></div>
    <div><b>MAKE</b><span>${d.make || "UNKNOWN"}</span></div>
    <div><b>MODEL</b><span>${d.model || "UNKNOWN"}</span></div>
    <div><b>ENGINE</b><span>${d.engine || "UNKNOWN"}</span></div>
    <div><b>FITMENT</b><span>${d.verified_fitment ? "YES" : "NO"}</span></div>
    <div><b>VIN</b><span>${d.vin || "No VIN"}</span></div>
    <div><b>SOURCE</b><span>${data.source || "oracle"}</span></div>
  </div>
  <div class="oracleNote">${(d.notes || []).join("<br>") || "No notes returned."}</div>
</div>`;
}

async function decodeVin(){
  const vin = $("vinGlobal")?.value.trim().toUpperCase() || "";
  if(!vin) return alert("Enter VIN first.");

  $("vinOut").textContent = "Decoding VIN...";

  try{
    const data = await callOracle({
      vin,
      part_query:"VIN decode",
      mode:"vin_decode"
    });

    const d = data?.data || {};
    setValue("yearGlobal",d.year || "");
    setValue("makeGlobal",d.make || "");
    setValue("modelGlobal",d.model || "");
    setValue("engine",d.engine || "");
    if(d.esn) setValue("esnGlobal",d.esn);
    if(d.cpl) setValue("cplGlobal",d.cpl);

    saveActiveTruck();

    $("vinOut").innerHTML = `
<div class="oracleCard">
  <div class="oracleTitle">VIN DECODE SUCCESS</div>
  <div class="vinGrid">
    <div><b>VIN</b><span>${vin}</span></div>
    <div><b>YEAR</b><span>${d.year || "UNKNOWN"}</span></div>
    <div><b>MAKE</b><span>${d.make || "UNKNOWN"}</span></div>
    <div><b>MODEL</b><span>${d.model || "UNKNOWN"}</span></div>
    <div><b>ENGINE</b><span>${d.engine || "UNKNOWN"}</span></div>
    <div><b>VERIFY</b><span>${d.verified_fitment ? "VIN/ESN/CPL" : "VIN only"}</span></div>
  </div>
  <div class="oracleNote">Saved as active truck.</div>
</div>`;
  }catch(e){
    $("vinOut").textContent = "VIN ERROR: " + e.message;
  }
}

async function askPart(){
  const q = $("partq")?.value.trim() || "";
  const note = $("partNote")?.value.trim() || "";
  if(!q && !note){
    $("partOut").textContent = "Enter part number, part name, VIN, ESN, CPL, or description.";
    return;
  }

  $("partOut").textContent = "Looking up part...";

  try{
    const data = await callOracle({
      part_query:q || note,
      note,
      mode:"parts_lookup"
    });

    const universal = await universalSearch(
  data?.data?.oem_part ||
  data?.data?.part ||
  q
);

renderOracleCard(
  "partOut",
  "ORACLE VERIFIED PART LOOKUP",
  data
);

if(universal){

  $("partOut").innerHTML += `
  <div class="oracleCard" style="margin-top:16px;">
    <div class="oracleTitle">
      UNIVERSAL DATABASE RESULTS
    </div>

    <div class="oracleNote"
    style="white-space:pre-wrap;font-family:monospace;">
${JSON.stringify(universal,null,2)}
    </div>
  </div>
  `;
}
    const repair = await getRepairKit(
  data?.data?.oem_part ||
  data?.data?.part ||
  q
);

if(repair && repair !== "No repair kit found."){

  $("partOut").innerHTML += `
    <div class="oracleCard" style="margin-top:16px;">
      <div class="oracleTitle">SMART REPAIR KIT</div>

      <div class="oracleNote"
           style="white-space:pre-wrap;font-family:monospace;">

${repair}

      </div>
    </div>
  `;
}
  }catch(e){
    $("partOut").textContent = "ORACLE SEARCH ERROR: " + e.message;
  }
}

async function getRepairKit(component){
  const { data, error } = await supabaseClient
    .from("repair_kits")
    .select("*")
    .ilike("component_name", `%${component}%`)
    .limit(1)
    .single();

  if(error || !data){
    return "No repair kit found.";
  }

  return `
🔧 COMPONENT:
${data.component_name}

🚛 ENGINE:
${data.engine_family}

📦 OEM PART:
${data.oem_part_number}

🧰 GASKETS:
${data.gasket_set}

🛑 SEALS:
${data.seals}

⭕ O-RINGS:
${data.o_rings}

⚙️ HARDWARE:
${data.hardware}

⏱ LABOR HOURS:
${data.labor_hours}

📏 TORQUE NOTES:
${data.torque_specs}

📝 REPAIR NOTES:
${data.repair_notes}
`;
}



async function universalSearch(search){

  const { data, error } = await supabaseClient
    .rpc("universal_diesel_search", {
      search_text: search
    });

  if(error){
    throw error;
  }

  return data;

}
window.testUniversalSearch = async function(){

  const q =
    $("partq")?.value.trim() ||
    "water";

  try{

    const data = await universalSearch(q);

    console.log(data);

    $("partOut").innerHTML = `
      <div class="oracleCard">

        <div class="oracleTitle">
          UNIVERSAL SEARCH
        </div>

        <div class="oracleNote"
             style="white-space:pre-wrap;font-family:monospace;">

${JSON.stringify(data,null,2)}

        </div>

      </div>
    `;

  }catch(e){

    $("partOut").textContent =
      "Universal Search Error: " + e.message;

  }

};
  async function runDoctorSearch(){
  const q = $("doctorAsk")?.value.trim() || "";
  if(!q){
    $("doctorOut").textContent = "Ask Diesel Doctor a question first.";
    return;
  }

  $("doctorOut").textContent = "Diesel Doctor thinking...";

  try{
    const data = await callOracle({
      part_query:q,
      question:q,
      mode:"global_doctor_search"
    });
    $("doctorOut").textContent = formatOracleData(data);
  }catch(e){
    $("doctorOut").textContent = "Diesel Doctor error: " + e.message;
  }
}

async function homeAI(){
  const q = $("homeAiAsk")?.value.trim() || "";
  const file = $("homeAiImage")?.files?.[0];

  if(!q && !file){
    $("homeAiOut").textContent = "Ask Diesel AI a question or add a picture.";
    return;
  }

  $("homeAiOut").textContent = file ? "Reading picture..." : "Thinking...";

  let note = "";

  if(file){
    const base64 = await imageToBase64(file);
    note = { image:base64.split(",")[1], question:q || "Analyze uploaded image" };
  }

  try{
    const data = await callOracle({
      part_query:q || "Analyze uploaded image",
      question:q || "Analyze uploaded image",
      mode:"diesel_ai",
      note
    });

    $("homeAiOut").textContent = formatOracleData(data);
  }catch(e){
    $("homeAiOut").textContent = "Diesel AI error: " + e.message;
  }
}

async function runDiag(){
  const q = $("diagq")?.value.trim() || "";
  const note = $("diagNote")?.value.trim() || "";

  if(!q){
    $("diagOut").textContent = "Enter fault code or symptom first.";
    return;
  }

  $("diagOut").textContent = "Fault Doctor running...";

  try{
    const data = await callOracle({
      part_query:q,
      question:q,
      note,
      mode:"fault_doctor"
    });

    $("diagOut").textContent = formatOracleData(data);
  }catch(e){
    $("diagOut").textContent = "DIAGNOSTIC ERROR: " + e.message;
  }
}

function imageToBase64(file){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function wireImagePreview(){
  const input = $("homeAiImage");
  const preview = $("homeAiPreview");

  if(!input || !preview) return;

  input.addEventListener("change",()=>{
    const file = input.files?.[0];
    if(!file) return;
    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
  });
}

function money(n){
  return "$" + Number(n || 0).toFixed(2);
}

function buildInvoice(){
  const shop = getShop();

  const h = Number($("laborHours")?.value || 0);
  const r = Number($("laborRate")?.value || 0);
  const service = Number($("serviceCall")?.value || 0);
  const parts = Number($("partsCost")?.value || 0);
  const taxPct = Number($("taxRate")?.value || 0);
  const cardPct = Number($("cardFee")?.value || 0);

  const labor = h * r;
  const subtotal = labor + service + parts;
  const tax = subtotal * (taxPct / 100);
  const card = (subtotal + tax) * (cardPct / 100);
  const total = subtotal + tax + card;

  const txt = `
${shop.name}
${shop.phone}
${shop.website}

CUSTOMER:
${$("custName")?.value || ""}
${$("custPhone")?.value || ""}

VEHICLE:
${$("invoiceTruck")?.value || ""}
VIN: ${$("invoiceVin")?.value || ""}

WORK:
${$("laborDesc")?.value || ""}

Labor: ${money(labor)}
Service Call: ${money(service)}
Parts: ${money(parts)}
Tax: ${money(tax)}
Card Fee: ${money(card)}

TOTAL DUE:
${money(total)}

TERMS:
${shop.terms}
`.trim();

  $("quoteOut").textContent = txt;
}

function copyText(id){
  const text = $(id)?.textContent || "";
  navigator.clipboard?.writeText(text);
  alert("Copied.");
}

function findNearestDealer(){
  if(!navigator.geolocation){
    alert("GPS not supported.");
    return;
  }

  navigator.geolocation.getCurrentPosition(pos=>{
    const q = "FleetPride OR Cummins Dealer OR Kenworth OR Peterbilt OR Freightliner Parts";
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(q)}/@${pos.coords.latitude},${pos.coords.longitude},12z`,"_blank");
  },()=>{
    alert("Location permission denied.");
  });
}

function startVoiceInput(){
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SpeechRecognition){
    alert("Voice input not supported on this browser yet.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.onresult = e=>{
    const text = e.results[0][0].transcript;
    if($("homeAiAsk")) $("homeAiAsk").value = text;
    if($("doctorAsk")) $("doctorAsk").value = text;
  };
  recognition.start();
}

const VoiceNavigator = {
  active:false,
  toggle(){
    this.active = !this.active;
    const btn = $("voice-toggle");
    if(btn) btn.textContent = `VOICE: ${this.active ? "ON" : "OFF"}`;
    if(this.active) this.speak("Diesel Doctor Voice Navigator active. Backend feature coming soon.");
  },
  speak(text){
    if(!("speechSynthesis" in window)) return;
    const msg = new SpeechSynthesisUtterance(text);
    msg.rate = .9;
    window.speechSynthesis.speak(msg);
  }
};

window.addEventListener("error",e=>{
  localStorage.setItem("diesel_doctor_last_error",`${e.message} line ${e.lineno}`);
});

window.addEventListener("DOMContentLoaded",()=>{
  loadSettings();
  loadActiveTruckIntoFields();
  updateActiveTruckBar();
  wireImagePreview();
});
