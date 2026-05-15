
/* ============================================================
   ROLLING CECIL AI - PHASE 21
   REPAIR KIT QUERY FIX
   Purpose:
   - X 15 / X15 / ISX15 all detect as X15
   - water pump detects as water pump
   - repair_kits search checks BOTH component and part_type
   - works with older repair_kits table layouts
   Paste near bottom of app.js, before final init/boot code.
   ============================================================ */

function rc21_detectEngine(search){
  const s = (search || "").toUpperCase().replace(/\s+/g,"").replace(/-/g,"");

  if(s.includes("ISX15")) return "X15";
  if(s.includes("X15")) return "X15";

  if(s.includes("DD15")) return "DD15";
  if(s.includes("DD13")) return "DD13";

  if(s.includes("MX13")) return "MX13";
  if(s.includes("PACCARMX13")) return "MX13";

  if(s.includes("D13")) return "D13";

  return "UNKNOWN";
}

function rc21_detectComponent(search){
  const s = (search || "").toLowerCase();

  if(s.includes("water pump") || s.includes("coolant pump")) return "water pump";
  if(s.includes("fuel filter")) return "fuel filter";
  if(s.includes("oil filter") || s.includes("lube filter")) return "oil filter";
  if(s.includes("turbo actuator") || s.includes("vgt actuator")) return "turbo actuator";
  if(s.includes("turbo")) return "turbo";
  if(s.includes("injector")) return "injector";
  if(s.includes("nox")) return "nox sensor";
  if(s.includes("delta pressure")) return "delta pressure sensor";
  if(s.includes("egr")) return "egr";

  return s.trim();
}

async function rc21_lookupRepairKits(searchText){
  const engine = rc21_detectEngine(searchText);
  const component = rc21_detectComponent(searchText);

  console.log("RC21 engine:", engine);
  console.log("RC21 component:", component);

  // Preferred: use component column if it exists
  let kits = [];
  let error1 = null;
  let error2 = null;

  try{
    const res1 = await supabase
      .from("repair_kits")
      .select("*")
      .eq("engine_family", engine)
      .ilike("component", `%${component}%`);

    kits = res1.data || [];
    error1 = res1.error;

    if(error1) console.warn("RC21 component query warning:", error1.message);
  }catch(e){
    error1 = e;
    console.warn("RC21 component query failed:", e.message);
  }

  // Fallback: older table may use part_type instead of component
  if(!kits.length){
    try{
      const res2 = await supabase
        .from("repair_kits")
        .select("*")
        .eq("engine_family", engine)
        .ilike("part_type", `%${component}%`);

      kits = res2.data || [];
      error2 = res2.error;

      if(error2) console.warn("RC21 part_type query warning:", error2.message);
    }catch(e){
      error2 = e;
      console.warn("RC21 part_type query failed:", e.message);
    }
  }

  // Final fallback: use smart_repair_kits table from Phase 20 if available
  if(!kits.length){
    try{
      const res3 = await supabase
        .from("smart_repair_kits")
        .select("*")
        .eq("engine_family", engine)
        .ilike("component", `%${component}%`);

      kits = res3.data || [];

      if(res3.error) console.warn("RC21 smart_repair_kits warning:", res3.error.message);
    }catch(e){
      console.warn("RC21 smart_repair_kits failed:", e.message);
    }
  }

  return {
    engine,
    component,
    kits,
    count: kits.length,
    error1,
    error2
  };
}

function rc21_renderRepairKitBox(result){
  if(!result || !result.kits || !result.kits.length){
    return `
      <div class="card warn">
        <h3>SMART REPAIR KIT</h3>
        <p>NO KIT</p>
        <p>Engine: ${result?.engine || "UNKNOWN"} / Component: ${result?.component || "UNKNOWN"}</p>
      </div>
    `;
  }

  const k = result.kits[0];

  const oem = k.oem_part || k.primary_oem || k.oem_part_number || "VERIFY";
  const alt = k.alt_part || k.primary_alt || k.aftermarket_part_number || "";
  const labor = k.labor_hours || "VERIFY";
  const notes = k.notes || k.repair_notes || "Verify by VIN / ESN / CPL.";

  return `
    <div class="card rc21-kit">
      <h3>SMART REPAIR KIT</h3>
      <h2>${result.engine} ${result.component}</h2>
      <div class="rc21-oem">OEM: ${oem}</div>
      ${alt ? `<div class="rc21-alt">REMAN / ALT: ${alt}</div>` : ""}
      <div class="rc21-line">Labor: ${labor} hrs</div>
      <p>${notes}</p>
      <div class="rc21-verify">Verify by VIN / ESN / CPL before ordering.</div>
    </div>
  `;
}

/*
  Hook function you can call from any master search.
  If your existing master output uses another div, change "masterOut" below.
*/
async function rc21_runRepairKitPatch(searchText){
  const result = await rc21_lookupRepairKits(searchText);

  console.log("RC21 repair kit result:", result);

  const out =
    document.getElementById("masterOut") ||
    document.getElementById("partOut") ||
    document.getElementById("partsTechOut");

  if(out){
    out.innerHTML += rc21_renderRepairKitBox(result);
  }

  return result;
}

/*
  HOW TO WIRE:
  Inside your master search function, after searchTerm is created, add:

  await rc21_runRepairKitPatch(searchTerm);

*/
