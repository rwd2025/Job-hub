/* =====================================================
   ROLLING CECIL AI - PHASE 20 FRONTEND PATCH
   Smart Repair Kit Logic
   Paste near the bottom of app.js, before final boot/init block.
   ===================================================== */

function rc20_clean(v){
  return (v || "").toString().trim();
}

function rc20_first(arr){
  return Array.isArray(arr) && arr.length ? arr[0] : null;
}

function rc20_list(title, items){
  if(!items || !items.length) return "";
  return `
    <div class="rc20-mini">
      <b>${title}</b>
      <ul>${items.map(x=>`<li>${x}</li>`).join("")}</ul>
    </div>
  `;
}

function rc20_renderRepairKit(result){
  const kitWrap = result?.repair_kit_answer || result;
  const kits = kitWrap?.repair_kits || [];
  const kit = rc20_first(kits);

  if(!kit){
    return `
      <div class="card warn">
        <h3>SMART REPAIR KIT</h3>
        <p>No repair kit saved yet for this component.</p>
        <p>Next: save confirmed gaskets, seals, hardware, labor, and torque notes after the job.</p>
      </div>
    `;
  }

  return `
    <div class="card rc20-kit-card">
      <h3>SMART REPAIR KIT</h3>
      <h2>${kit.kit_name || "Repair Kit"}</h2>

      <div class="rc20-oem">Primary OEM: ${kit.primary_oem || "VERIFY"}</div>
      ${kit.primary_alt ? `<div class="rc20-alt">Alt / Reman: ${kit.primary_alt}</div>` : ""}

      ${rc20_list("Gaskets", kit.gaskets)}
      ${rc20_list("Seals", kit.seals)}
      ${rc20_list("O-rings", kit.o_rings)}
      ${rc20_list("Hardware", kit.hardware)}
      ${rc20_list("Fluids", kit.fluids)}
      ${rc20_list("Related Parts", kit.related_parts)}
      ${rc20_list("While You're There", kit.while_there_checks)}
      ${rc20_list("Common Failures", kit.common_failures)}

      <div class="rc20-labor">
        Labor: ${kit.labor_hours || "VERIFY"} hrs
      </div>

      <div class="rc20-note">
        <b>Torque:</b> ${kit.torque_notes || "Verify by service manual."}
      </div>

      <div class="rc20-note">
        <b>Repair Note:</b> ${kit.repair_notes || "Verify procedure by manual."}
      </div>

      <div class="rc20-verify">
        Verify by VIN / ESN / CPL before ordering.
      </div>
    </div>
  `;
}

async function smartRepairKitLookup(component, engine, oem){
  const { data, error } = await supabase.rpc("smart_repair_kit_lookup", {
    part_query: component,
    raw_engine_text: engine || null,
    oem_text: oem || null
  });

  if(error) throw error;
  return data;
}

async function partsTechRepairAnswer(component, engine){
  const { data, error } = await supabase.rpc("parts_tech_repair_answer", {
    part_query: component,
    raw_engine_text: engine || null
  });

  if(error) throw error;
  return data;
}

/* Optional button hook:
   onclick="runSmartRepairKitFromParts()"
*/
async function runSmartRepairKitFromParts(){
  try{
    const engine =
      rc20_clean($("partsTechEngine")?.value) ||
      rc20_clean($("engineGlobal")?.value) ||
      rc20_clean($("engine")?.value) ||
      "X15";

    const component =
      rc20_clean($("partsTechComponent")?.value) ||
      rc20_clean($("partNumber")?.value) ||
      rc20_clean($("partSearch")?.value) ||
      "water pump";

    const out = $("partsTechOut") || $("partOut") || $("masterOut");

    if(out) out.innerHTML = "<div class='card'>Building smart repair kit...</div>";

    const result = await partsTechRepairAnswer(component, engine);

    if(out){
      out.innerHTML += rc20_renderRepairKit(result);
    }

    return result;

  }catch(err){
    console.error(err);
    const out = $("partsTechOut") || $("partOut") || $("masterOut");
    if(out) out.innerHTML += `<div class="warn">Smart repair kit failed: ${err.message}</div>`;
  }
}