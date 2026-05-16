const $ = (id) => document.getElementById(id);
let historyStack = ["home"];
let lastClockStart = null;

function showScreen(id, btn){
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const screen = $(id);
  if(screen) screen.classList.add("active");
  document.querySelectorAll(".bottom-nav button").forEach(b => b.classList.remove("active"));
  if(btn) btn.classList.add("active");
  else {
    const map = {home:0, doctor:1, parts:2, repair:3, settings:4};
    const nav = document.querySelectorAll(".bottom-nav button")[map[id]];
    if(nav) nav.classList.add("active");
  }
  historyStack.push(id);
  $("sideMenu")?.classList.remove("open");
}
function goBack(){ historyStack.pop(); const prev = historyStack.pop() || "home"; showScreen(prev); }
function toggleMenu(){ $("sideMenu").classList.toggle("open"); }
function focusAsk(){ $("masterAsk").focus(); }
function setAsk(text){ $("masterAsk").value = text; $("masterAsk").focus(); }
function startVoice(){ alert("Voice input is ready for the next integration build."); }
function openCamera(){ $("scanInput")?.click(); }
$("scanInput")?.addEventListener("change", (e)=>{ const file=e.target.files?.[0]; if(!file)return; alert("Camera loaded: "+file.name+"\\nNext build will route this through OCR/Vision."); });

function saveTruck(){
  const vin=$("vinInput").value.trim()||"1XP4D49X8KD123456";
  const year=$("yearInput").value.trim()||"2020";
  const make=$("makeInput").value.trim()||"Freightliner";
  const model=$("modelInput").value.trim()||"Cascadia";
  const engine=$("engineInput").value.trim()||"Cummins X15";
  const esn=$("esnInput").value.trim()||"79876562";
  const cpl=$("cplInput").value.trim()||"4342";
  $("activeVin").textContent=vin; $("truckTitle").textContent=`${year} ${make} ${model}`;
  $("activeEngine").textContent=engine.toUpperCase(); $("activeEsn").textContent=esn; $("activeCpl").textContent=cpl;
  $("vinOut").textContent="Active truck saved to dashboard.";
  localStorage.setItem("rwTruck", JSON.stringify({vin,year,make,model,engine,esn,cpl}));
}
function loadTruck(){try{const t=JSON.parse(localStorage.getItem("rwTruck")||"null"); if(!t)return; $("activeVin").textContent=t.vin; $("truckTitle").textContent=`${t.year} ${t.make} ${t.model}`; $("activeEngine").textContent=t.engine.toUpperCase(); $("activeEsn").textContent=t.esn; $("activeCpl").textContent=t.cpl;}catch(e){}}
function runPartsLookup(){ const q=$("partInput").value.trim(); $("partsOut").textContent=q?`Parts lookup queued for: ${q}\\n\\nReady for Supabase OEM/interchange function connection.`:"Enter a part number, part name, VIN, ESN, or CPL first."; }
function runDoctor(){ const q=$("doctorInput").value.trim(); $("doctorOut").textContent=q?`Diesel Doctor diagnostic queued for: ${q}\\n\\nNext build connects likely causes, verified fixes, and repair memory.`:"Enter SPN/FMI, symptom, or repair question first."; }
function clockIn(){ lastClockStart=new Date(); $("clockResult").textContent="Clocked in at "+lastClockStart.toLocaleTimeString(); }
function clockOut(){ if(!lastClockStart){$("clockResult").textContent="Clock was not started.";return;} const hrs=((new Date()-lastClockStart)/3600000).toFixed(2); $("clockResult").textContent=`Clocked out. Billable hours: ${hrs}`; }
function dropGps(){ if(!navigator.geolocation){$("gpsOut").textContent="GPS not available.";return;} $("gpsOut").textContent="Getting GPS..."; navigator.geolocation.getCurrentPosition(pos=>$("gpsOut").textContent=`GPS pin: ${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`,err=>$("gpsOut").textContent="GPS permission denied or unavailable.");}
function scannerTest(){ $("scannerOut").textContent="Bluetooth scanner module is under construction. Planned: 9-pin J1939, OBD2, live SPN/FMI, VIN auto-detect, voltage, and CAN activity."; }
function setTheme(theme){document.body.dataset.theme=theme;localStorage.setItem("rwTheme",theme);}
function setLayout(layout){document.body.dataset.layout=layout;localStorage.setItem("rwLayout",layout);}
window.addEventListener("load",()=>{loadTruck();document.body.dataset.theme=localStorage.getItem("rwTheme")||"orange";document.body.dataset.layout=localStorage.getItem("rwLayout")||"dashboard";if("serviceWorker" in navigator){navigator.serviceWorker.register("service-worker.js").catch(()=>{});}});
