
// ================================
// ROLLING CECIL AI ENGINE PATCH
// Paste ABOVE runMasterSearch()
// ================================

function detectEngine(search){

const s = search.toUpperCase();

if(s.includes("X15")) return "X15";
if(s.includes("ISX15")) return "X15";

if(s.includes("DD15")) return "DD15";
if(s.includes("DD13")) return "DD13";

if(s.includes("MX13")) return "MX13";
if(s.includes("MX-13")) return "MX13";

if(s.includes("D13")) return "D13";

return "UNKNOWN";
}

function detectComponent(search){

const s = search.toLowerCase();

if(s.includes("water pump")) return "water pump";
if(s.includes("fuel filter")) return "fuel filter";
if(s.includes("oil filter")) return "oil filter";
if(s.includes("turbo")) return "turbo";
if(s.includes("injector")) return "injector";

return search;
}

// ==========================================
// INSIDE runMasterSearch()
// ==========================================

// Add this BEFORE SQL lookup:

const engine = detectEngine(searchTerm);
const component = detectComponent(searchTerm);

// Replace OLD repair_kits query with:

const { data: repairKit } = await supabase
.from("repair_kits")
.select("*")
.eq("engine_family", engine)
.ilike("component", `%${component}%`);

console.log("Detected Engine:", engine);
console.log("Detected Component:", component);
console.log("Repair Kit:", repairKit);
