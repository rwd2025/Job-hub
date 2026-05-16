const $ = (id) => document.getElementById(id);
let historyStack = ["home"];
let clock = {start:null, elapsed:0, paused:false, pauseStart:null, pausedMs:0, timer:null};
let timeRecords = [];

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
function startVoice(){ alert("Voice input shell ready. Voice-to-text connects in the next backend build."); }
function openCamera(){ $("scanInput")?.click(); }
$("scanInput")?.addEventListener("change", (e)=>{ const file=e.target.files?.[0]; if(!file)return; alert("Camera loaded: "+file.name+"\\nNext build routes this through OCR/Vision."); });

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
function clearTruck(){["vinInput","yearInput","makeInput","modelInput","engineInput","esnInput","cplInput"].forEach(id=>$(id).value=""); $("vinOut").textContent="Truck fields cleared."; }
function loadTruck(){try{const t=JSON.parse(localStorage.getItem("rwTruck")||"null"); if(!t)return; $("activeVin").textContent=t.vin; $("truckTitle").textContent=`${t.year} ${t.make} ${t.model}`; $("activeEngine").textContent=t.engine.toUpperCase(); $("activeEsn").textContent=t.esn; $("activeCpl").textContent=t.cpl;}catch(e){}}

function runPartsLookup(){ const q=$("partInput").value.trim(); $("partsOut").textContent=q?`OEM Parts lookup shell\\n\\nPart: ${q}\\nContext: ${$("partNotes").value || "No extra notes"}\\n\\nNext integration: Supabase Oracle parts search, interchange chain, repair kits, supplier shortcuts.`:"Enter a part number, part name, VIN, ESN, or CPL first."; }
function addPartToQuote(){ $("quoteNotes").value += "\\nPart added from Parts screen: " + ($("partInput").value || "manual part"); $("partsOut").textContent="Part note sent to Smart Quotes."; }
function savePart(){ const saved = JSON.parse(localStorage.getItem("rwParts")||"[]"); saved.push({part:$("partInput").value, notes:$("partNotes").value, date:new Date().toLocaleString()}); localStorage.setItem("rwParts", JSON.stringify(saved)); $("savedPartsOut").textContent = saved.map((p,i)=>`${i+1}. ${p.part || "Unnamed part"} - ${p.date}`).join("\\n"); }
function clearParts(){ $("partInput").value=""; $("partNotes").value=""; $("partsOut").textContent="Parts fields cleared."; }

function runDoctor(){ const q=$("doctorInput").value.trim(); $("doctorOut").textContent=q?`Diesel Doctor shell\\n\\nFault/Symptom: ${q}\\nNotes: ${$("doctorNotes").value || "None"}\\n\\nNext integration: likely causes, tests, common fixes, verified fix memory, quote output.`:"Enter SPN/FMI, symptom, or repair question first."; }
function saveFix(){ localStorage.setItem("rwLastFix", JSON.stringify({fault:$("doctorInput").value, notes:$("doctorNotes").value, date:new Date().toLocaleString()})); $("doctorOut").textContent="Verified fix shell saved locally."; }
function sendDoctorToQuote(){ $("quoteNotes").value += "\\nDiagnostic: " + ($("doctorInput").value || "diagnostic note"); $("doctorOut").textContent="Diagnostic note sent to quote."; }
function clearDoctor(){ $("doctorInput").value=""; $("doctorNotes").value=""; $("doctorOut").textContent="Doctor fields cleared."; }

function runRepairBrain(){ $("repairOut").textContent = `Repair Brain shell\\n\\nQuestion: ${$("repairInput").value || "No question entered"}\\n\\nNext integration: procedure steps, torque specs, warnings, parts needed, labor estimate.`; }
function showTorqueShell(){ $("repairOut").textContent="Torque/spec shell ready. Next build will pull torque tables and OEM procedures."; }
function showWarnings(){ $("repairOut").textContent="Common mistake warnings shell ready. Next build will flag misdiagnosis patterns."; }
function saveRepairMemory(){ localStorage.setItem("rwRepairNote", $("repairInput").value); $("repairOut").textContent="Repair memory note saved locally."; }

function buildQuote(){
  const hrs = parseFloat($("laborHours").value||0);
  const rate = parseFloat($("laborRate").value||0);
  const call = parseFloat($("serviceCall").value||0);
  const parts = parseFloat($("partsCost").value||0);
  const taxRate = parseFloat($("taxRate").value||0)/100;
  const subtotal = hrs*rate + call + parts;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  $("quoteOut").textContent = `ROLLING WRENCH AI QUOTE\\nCustomer: ${$("custName").value || "Customer"}\\nLabor: ${hrs.toFixed(2)} hrs x $${rate.toFixed(2)} = $${(hrs*rate).toFixed(2)}\\nService Call: $${call.toFixed(2)}\\nParts: $${parts.toFixed(2)}\\nTax: $${tax.toFixed(2)}\\nTOTAL: $${total.toFixed(2)}\\n\\nNotes:\\n${$("quoteNotes").value || ""}`;
}
function copyQuote(){ navigator.clipboard?.writeText($("quoteOut").textContent); $("quoteOut").textContent += "\\n\\nCopied to clipboard."; }
function saveQuote(){ localStorage.setItem("rwLastQuote", $("quoteOut").textContent); $("quoteOut").textContent += "\\n\\nQuote saved locally."; }
function clearQuote(){ ["custName","laborHours","partsCost","quoteNotes"].forEach(id=>$(id).value=""); $("quoteOut").textContent="Quote cleared."; }

function updateClock(){
  if(!clock.start) return;
  const now = new Date();
  let activeMs = now - clock.start - clock.pausedMs;
  if(clock.paused && clock.pauseStart) activeMs = clock.pauseStart - clock.start - clock.pausedMs;
  const hrs = Math.max(0, activeMs/3600000);
  $("clockTimer").textContent = hrs.toFixed(2)+" hrs";
  $("clockBillable").textContent = hrs.toFixed(2);
  const rate = parseFloat($("clockRate").value||0);
  $("clockTotal").textContent = "$" + (hrs*rate).toFixed(2);
}
function clockIn(){
  clock = {start:new Date(), elapsed:0, paused:false, pauseStart:null, pausedMs:0, timer:null};
  $("clockStatus").textContent="CLOCKED IN";
  $("clockStart").textContent=clock.start.toLocaleTimeString();
  $("clockStop").textContent="--";
  $("clockPaused").textContent="0 min";
  clearInterval(clock.timer);
  clock.timer=setInterval(updateClock,1000);
  updateClock();
}
function pauseClock(){
  if(!clock.start || clock.paused) return;
  clock.paused=true; clock.pauseStart=new Date();
  $("clockStatus").textContent="PAUSED";
}
function resumeClock(){
  if(!clock.start || !clock.paused) return;
  clock.pausedMs += new Date() - clock.pauseStart;
  clock.paused=false; clock.pauseStart=null;
  $("clockStatus").textContent="CLOCKED IN";
  $("clockPaused").textContent=Math.round(clock.pausedMs/60000)+" min";
}
function clockOut(){
  if(!clock.start){$("clockRecordsOut").textContent="Clock was not started.";return;}
  if(clock.paused) resumeClock();
  updateClock();
  clearInterval(clock.timer);
  const stop = new Date();
  $("clockStop").textContent=stop.toLocaleTimeString();
  $("clockStatus").textContent="CLOCKED OUT";
  const rec = {start:clock.start.toLocaleString(), stop:stop.toLocaleString(), hours:$("clockBillable").textContent, total:$("clockTotal").textContent};
  timeRecords.push(rec); localStorage.setItem("rwTimeRecords", JSON.stringify(timeRecords));
  $("clockRecordsOut").textContent=`Last record saved: ${rec.hours} hrs / ${rec.total}`;
}
function sendClockToQuote(){ $("laborHours").value = $("clockBillable").textContent; $("quoteOut").textContent="Clock hours sent to Smart Quote."; }
function saveTimeRecord(){ localStorage.setItem("rwTimeRecords", JSON.stringify(timeRecords)); $("clockRecordsOut").textContent="Time records saved locally."; }
function showTimeRecords(){ timeRecords = JSON.parse(localStorage.getItem("rwTimeRecords")||"[]"); $("clockRecordsOut").textContent = timeRecords.length ? timeRecords.map((r,i)=>`${i+1}. ${r.start} to ${r.stop} | ${r.hours} | ${r.total}`).join("\\n") : "No saved time records."; }
function resetClock(){ clearInterval(clock.timer); clock={start:null,elapsed:0,paused:false,pauseStart:null,pausedMs:0,timer:null}; ["clockStart","clockStop"].forEach(id=>$(id).textContent="--"); $("clockPaused").textContent="0 min"; $("clockBillable").textContent="0.00"; $("clockTimer").textContent="0.00 hrs"; $("clockTotal").textContent="$0.00"; $("clockStatus").textContent="CLOCKED OUT"; }

function cleanVision(){ $("visionOut").textContent = "Cleaned scan text shell:\\n" + ($("visionRaw").value || "No raw text entered."); }
function sendVisionToParts(){ $("partInput").value = $("visionRaw").value; $("visionOut").textContent="Vision text sent to Parts."; }
function sendVisionToVin(){ $("vinInput").value = $("visionRaw").value; $("visionOut").textContent="Vision text sent to VIN."; }
function clearVision(){ $("visionRaw").value=""; $("visionOut").textContent="Vision cleared."; }

function searchManuals(){ $("manualsOut").textContent = "Manual search shell for: " + ($("manualInput").value || "no query"); }
function saveManualNote(){ localStorage.setItem("rwManualNote", $("manualInput").value); $("manualsOut").textContent="Manual note saved."; }
function clearManuals(){ $("manualInput").value=""; $("manualsOut").textContent="Manual search cleared."; }

function dropGps(){ if(!navigator.geolocation){$("gpsOut").textContent="GPS not available.";return;} $("gpsOut").textContent="Getting GPS..."; navigator.geolocation.getCurrentPosition(pos=>$("gpsOut").textContent=`GPS pin: ${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`,err=>$("gpsOut").textContent="GPS permission denied or unavailable.");}
function buildDotChecklist(){ $("gpsOut").textContent="DOT checklist shell: lights, brakes, tires, leaks, fluids, battery, air system, road test."; }
function copyCustomerUpdate(){ const msg = `Rolling Wrench update: ${$("fieldLocation").value || "job site"} - ${$("fieldNotes").value || "work in progress"}`; navigator.clipboard?.writeText(msg); $("gpsOut").textContent="Customer update copied:\\n"+msg; }
function clearField(){ $("fieldLocation").value=""; $("fieldNotes").value=""; $("gpsOut").textContent="Field tools cleared."; }

function saveMemory(){ const arr=JSON.parse(localStorage.getItem("rwMemory")||"[]"); arr.push({fault:$("memoryFault").value, fix:$("memoryFix").value, date:new Date().toLocaleString()}); localStorage.setItem("rwMemory", JSON.stringify(arr)); $("memoryOut").textContent="Repair memory saved."; }
function loadMemory(){ const arr=JSON.parse(localStorage.getItem("rwMemory")||"[]"); $("memoryOut").textContent=arr.length?arr.map((m,i)=>`${i+1}. ${m.fault}\\nFix: ${m.fix}\\n${m.date}`).join("\\n\\n"):"No repair memory saved."; }
function clearMemoryFields(){ $("memoryFault").value=""; $("memoryFix").value=""; $("memoryOut").textContent="Memory fields cleared."; }

function scannerTest(){ $("scannerOut").textContent="Bluetooth scanner module is under construction. Planned: 9-pin J1939, OBD2, live SPN/FMI, VIN auto-detect, voltage, and CAN activity."; }
function setTheme(theme){document.body.dataset.theme=theme;localStorage.setItem("rwTheme",theme);}
function setLayout(layout){document.body.dataset.layout=layout;localStorage.setItem("rwLayout",layout);}
window.addEventListener("load",()=>{loadTruck();timeRecords=JSON.parse(localStorage.getItem("rwTimeRecords")||"[]");document.body.dataset.theme=localStorage.getItem("rwTheme")||"orange";document.body.dataset.layout=localStorage.getItem("rwLayout")||"dashboard";if("serviceWorker" in navigator){navigator.serviceWorker.register("service-worker.js").catch(()=>{});}});
