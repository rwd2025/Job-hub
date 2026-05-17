const $=id=>document.getElementById(id);

const modules={
menu:["Menu",`<div class="grid grid-cols-2 gap-2">${["vin","parts","doctor","repair","quote","clock","vision","manuals","gps","memory","scanner","settings"].map(x=>`<button class="actionBtn" onclick="openPanel('${x}')">${x.toUpperCase()}</button>`).join("")}</div>`],
settings:["Settings",`<div class="space-y-3"><button class="actionBtn w-full" onclick="alert('Backend URL setting shell ready')">Backend URL</button><button class="actionBtn w-full" onclick="alert('Theme system shell ready')">Theme / Layout</button><button class="actionBtn w-full" onclick="alert('Debug panel shell ready')">Debug</button></div>`],
master:["Master Search",`<textarea id="masterQuery" class="field min-h-[110px]" placeholder="VIN, part number, fault code, symptom, repair, quote note..."></textarea><div class="grid grid-cols-2 gap-2 mt-3"><button class="actionBtn" onclick="runMaster()">Run Search</button><button class="actionBtn" onclick="openCamera()">Camera</button></div><div id="masterOut" class="outputBox mt-3">Results will show here.</div>`],
vin:["VIN Lookup",`<div class="grid grid-cols-2 gap-2"><label class="text-xs text-[#8a99ad]">VIN<input id="vinInput" class="field" value="1XP4D49X8KD123456"></label><label class="text-xs text-[#8a99ad]">Engine<input id="engineInput" class="field" value="Cummins X15"></label><label class="text-xs text-[#8a99ad]">ESN<input id="esnInput" class="field" value="79876562"></label><label class="text-xs text-[#8a99ad]">CPL<input id="cplInput" class="field" value="4342"></label></div><button class="actionBtn w-full mt-3" onclick="saveTruck()">Save Active Truck</button><div id="vinOut" class="outputBox mt-3">VIN decoder shell ready.</div>`],
parts:["OEM Parts",`<textarea id="partInput" class="field min-h-[100px]" placeholder="Enter part number or part name..."></textarea><div class="grid grid-cols-2 gap-2 mt-3"><button class="actionBtn" onclick="lookupParts()">Lookup</button><button class="actionBtn" onclick="openCamera()">Scan Label</button></div><div id="partsOut" class="outputBox mt-3">OEM parts lookup shell ready.</div>`],
doctor:["Diesel Doctor",`<textarea id="doctorInput" class="field min-h-[100px]" placeholder="SPN/FMI, symptom, derate, no-start, regen issue..."></textarea><button class="actionBtn w-full mt-3" onclick="runDoctor()">Run Diagnostic</button><div id="doctorOut" class="outputBox mt-3">Diagnostic shell ready.</div>`],
repair:["Repair Brain",`<textarea id="repairInput" class="field min-h-[100px]" placeholder="Ask repair steps, removal, testing, warnings..."></textarea><button class="actionBtn w-full mt-3" onclick="runRepair()">Build Repair Plan</button><div id="repairOut" class="outputBox mt-3">Repair Brain shell ready.</div>`],
quote:["Smart Quotes",`<div class="grid grid-cols-2 gap-2"><label class="text-xs text-[#8a99ad]">Labor Hours<input id="laborHours" class="field" type="number" step="0.1"></label><label class="text-xs text-[#8a99ad]">Rate<input id="laborRate" class="field" type="number" value="135"></label><label class="text-xs text-[#8a99ad]">Call Out<input id="callOut" class="field" type="number" value="250"></label><label class="text-xs text-[#8a99ad]">Parts<input id="partsCost" class="field" type="number"></label></div><button class="actionBtn w-full mt-3" onclick="buildQuote()">Build Quote</button><div id="quoteOut" class="outputBox mt-3">Quote output ready.</div>`],
clock:["Job Clock",`<div class="outputBox text-center"><div id="clockStatus" class="text-[#ff7a00] font-black text-lg">CLOCKED OUT</div><div id="clockTimer" class="text-3xl font-black">0.00 hrs</div></div><div class="grid grid-cols-3 gap-2 mt-3"><button class="actionBtn" onclick="clockIn()">In</button><button class="actionBtn" onclick="clockOut()">Out</button><button class="actionBtn" onclick="resetClock()">Reset</button></div>`],
vision:["Vision / OCR",`<button class="actionBtn w-full" onclick="openCamera()">Open Camera / Photo</button><div id="visionOut" class="outputBox mt-3">Camera shell ready.</div>`],
manuals:["Service Manuals",`<textarea class="field min-h-[100px]" placeholder="Search manuals/procedure notes..."></textarea><div class="outputBox mt-3">Manual search shell ready.</div>`],
gps:["DOT / GPS",`<button class="actionBtn w-full" onclick="dropGps()">Drop GPS Pin</button><div id="gpsOut" class="outputBox mt-3">GPS shell ready.</div>`],
memory:["Repair Memory",`<textarea id="memoryInput" class="field min-h-[100px]" placeholder="Save repair note..."></textarea><button class="actionBtn w-full mt-3" onclick="saveMemory()">Save Memory</button><div id="memoryOut" class="outputBox mt-3">Memory shell ready.</div>`],
scanner:["Bluetooth Scanner",`<div class="outputBox">Bluetooth 9-pin / OBD2 scanner module is under construction. Future support: J1939 SPN/FMI streaming, VIN auto-detect, voltage, CAN activity.</div>`],
more:["More",`<div class="grid grid-cols-2 gap-2"><button class="actionBtn" onclick="openPanel('scanner')">Scanner</button><button class="actionBtn" onclick="openPanel('settings')">Settings</button><button class="actionBtn" onclick="openPanel('memory')">Memory</button><button class="actionBtn" onclick="openPanel('gps')">GPS</button></div>`]
};

let clockStart=null,clockTimer=null;

function renderIcons(){ if(window.lucide) lucide.createIcons(); }

function openPanel(name){
  const m=modules[name]||modules.more;
  $("homeScreen").classList.add("hidden");
  $("panelScreen").classList.remove("hidden");
  $("panelTitle").textContent=m[0];
  $("panelBody").innerHTML=m[1];
  renderIcons();
}

function goHome(){
  $("panelScreen").classList.add("hidden");
  $("homeScreen").classList.remove("hidden");
  renderIcons();
}

function openCamera(){ $("cameraInput").click(); }
$("cameraInput").addEventListener("change",e=>{const f=e.target.files[0]; if(f) alert("Photo loaded: "+f.name);});
function startVoiceShell(){ alert("Voice input shell ready. Backend voice API connects next."); }

function runMaster(){
  const q=$("masterQuery").value.trim();
  $("masterOut").textContent=q?`Searching Rolling Wrench AI modules for:\n${q}\n\nRoutes: VIN, Parts, Diesel Doctor, Repair Brain, Quote Notes.`:"Enter a question first.";
}

function saveTruck(){
  const vin=$("vinInput").value||"NONE", eng=$("engineInput").value||"UNKNOWN";
  $("activeTruckEngine").textContent=eng.toUpperCase();
  $("truckVinSmall").textContent=vin;
  $("specEngine").textContent=eng.toUpperCase();
  $("specEsn").textContent=$("esnInput").value||"----";
  $("specCpl").textContent=$("cplInput").value||"----";
  $("vinOut").textContent="Active truck saved to dashboard.";
}

function lookupParts(){const q=$("partInput").value.trim();$("partsOut").textContent=q?`Parts lookup shell:\n${q}\n\nNext phase connects Supabase/Oracle parts + interchange + kits.`:"Enter a part number or part name."}
function runDoctor(){const q=$("doctorInput").value.trim();$("doctorOut").textContent=q?`Diesel Doctor diagnostic shell:\n${q}\n\nNext phase connects FastAPI/Ollama/Neo4j diagnostic backend.`:"Enter a fault or symptom."}
function runRepair(){const q=$("repairInput").value.trim();$("repairOut").textContent=q?`Repair plan shell:\n${q}\n\nIncludes steps, tools, warnings, specs when backend is connected.`:"Enter a repair question."}

function buildQuote(){
  const h=parseFloat($("laborHours").value||0),r=parseFloat($("laborRate").value||0),c=parseFloat($("callOut").value||0),p=parseFloat($("partsCost").value||0);
  const total=h*r+c+p;
  $("quoteOut").textContent=`ROLLING WRENCH QUOTE\nLabor: ${h.toFixed(2)} x $${r.toFixed(2)} = $${(h*r).toFixed(2)}\nCall Out: $${c.toFixed(2)}\nParts: $${p.toFixed(2)}\nTOTAL: $${total.toFixed(2)}`;
}

function clockIn(){clockStart=Date.now();$("clockStatus").textContent="CLOCKED IN";clearInterval(clockTimer);clockTimer=setInterval(updateClock,1000);updateClock();}
function updateClock(){if(!clockStart)return;const hrs=(Date.now()-clockStart)/3600000;$("clockTimer").textContent=hrs.toFixed(2)+" hrs";}
function clockOut(){if(!clockStart)return;updateClock();$("clockStatus").textContent="CLOCKED OUT";clearInterval(clockTimer);}
function resetClock(){clockStart=null;clearInterval(clockTimer);$("clockStatus").textContent="CLOCKED OUT";$("clockTimer").textContent="0.00 hrs";}

function dropGps(){
  if(!navigator.geolocation){$("gpsOut").textContent="GPS not supported.";return;}
  $("gpsOut").textContent="Getting GPS...";
  navigator.geolocation.getCurrentPosition(
    p=>$("gpsOut").textContent=`GPS Pin:\n${p.coords.latitude.toFixed(6)}, ${p.coords.longitude.toFixed(6)}`,
    ()=>$("gpsOut").textContent="GPS denied or unavailable."
  );
}

function saveMemory(){localStorage.setItem("rwRepairMemory",$("memoryInput").value);$("memoryOut").textContent="Repair memory saved locally.";}

window.addEventListener("DOMContentLoaded",()=>{
  renderIcons();
  if("serviceWorker" in navigator) navigator.serviceWorker.register("service-worker.js").catch(()=>{});
});