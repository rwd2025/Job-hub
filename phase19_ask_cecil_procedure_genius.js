/* =========================================================
PHASE 19 - ASK CECIL PROCEDURE GENIUS
Paste near your other functions before closing </script>.

Needs your existing:
- supabase variable
- callAI(prompt, context, notes) OR your OpenAI/Edge AI function
- optional vehicleContext()
========================================================= */

function cecilVal(id){
  return document.getElementById(id)?.value?.trim() || "";
}

function cecilVehicleContext(){
  if(typeof vehicleContext === "function"){
    try{ return vehicleContext(); }catch(e){}
  }

  return [
    cecilVal("yearGlobal"),
    cecilVal("makeGlobal"),
    cecilVal("modelGlobal"),
    cecilVal("engineGlobal"),
    cecilVal("vinGlobal") ? "VIN: " + cecilVal("vinGlobal") : ""
  ].filter(Boolean).join(" ");
}

function classifyCecilIntent(q){
  const s = (q || "").toLowerCase();

  if(/remove|disassemble|take off|tear down|pull off|replace|install|assembly|assemble|rebuild/.test(s)) return "procedure";
  if(/code|spn|fmi|dtc|fault|symptom|diagnose|why|cause|regen|derate|no start|misfire/.test(s)) return "diagnostic";
  if(/part|parts|seal|gasket|kit|filter|cross|number|oem|aftermarket/.test(s)) return "parts";
  if(/labor|hours|quote|price|cost|invoice|estimate/.test(s)) return "quote";
  if(/torque|spec|specs|clearance|pattern|sequence|fluid capacity|capacity/.test(s)) return "specs";

  return "general";
}

async function askCecilProcedureGenius(){
  const question =
    cecilVal("cecilQuestion") ||
    cecilVal("masterSearch") ||
    cecilVal("masterInput") ||
    cecilVal("oracleSearch") ||
    cecilVal("partNumber") ||
    cecilVal("diagSearch");

  const out = document.getElementById("cecilOut");

  if(!question){
    alert("Ask Cecil a repair, parts, specs, labor, or diagnostic question.");
    return;
  }

  if(out) out.textContent = "Cecil is thinking... checking shop memory, repair procedures, parts, specs, and AI...";

  const context = cecilVehicleContext();
  const intent = classifyCecilIntent(question);

  let memoryText = "";
  let procedureText = "";
  let kitText = "";
  let failureText = "";

  try{
    const safe = question.replaceAll(",", " ").replaceAll("%", "").slice(0, 120);

    if(typeof supabase !== "undefined"){
      const memory = await supabase
        .from("verified_fixes")
        .select("*")
        .or(`search_term.ilike.%${safe}%,symptom.ilike.%${safe}%,confirmed_fix.ilike.%${safe}%,parts_used.ilike.%${safe}%,tech_notes.ilike.%${safe}%`)
        .order("created_at", { ascending:false })
        .limit(3);

      if(memory.data && memory.data.length){
        memoryText = memory.data.map((r,i)=>`
SHOP MEMORY #${i+1}
Fix: ${r.confirmed_fix || "—"}
Parts: ${r.parts_used || "—"}
Labor: ${r.labor_hours || "—"} hr
Notes: ${r.tech_notes || "—"}`).join("\n");
      }

      const procedures = await supabase
        .from("repair_procedures")
        .select("*")
        .or(`title.ilike.%${safe}%,component.ilike.%${safe}%,procedure_text.ilike.%${safe}%,notes.ilike.%${safe}%`)
        .limit(3);

      if(procedures.data && procedures.data.length){
        procedureText = procedures.data.map((r,i)=>`
PROCEDURE DB #${i+1}
Title: ${r.title || r.component || "—"}
Procedure: ${r.procedure_text || r.steps || "—"}
Notes: ${r.notes || "—"}`).join("\n");
      }

      const kits = await supabase
        .from("repair_kits")
        .select("*")
        .or(`kit_name.ilike.%${safe}%,component.ilike.%${safe}%,notes.ilike.%${safe}%`)
        .limit(3);

      if(kits.data && kits.data.length){
        kitText = kits.data.map((r,i)=>`
REPAIR KIT #${i+1}
Kit: ${r.kit_name || r.component || "—"}
Parts: ${r.parts || r.parts_list || "—"}
Notes: ${r.notes || "—"}`).join("\n");
      }

      const failures = await supabase
        .from("known_failures")
        .select("*")
        .or(`component.ilike.%${safe}%,symptom.ilike.%${safe}%,failure.ilike.%${safe}%,notes.ilike.%${safe}%`)
        .limit(3);

      if(failures.data && failures.data.length){
        failureText = failures.data.map((r,i)=>`
KNOWN FAILURE #${i+1}
Component: ${r.component || "—"}
Failure: ${r.failure || r.symptom || "—"}
Notes: ${r.notes || "—"}`).join("\n");
      }
    }
  }catch(e){
    console.warn("Cecil DB search skipped/failed:", e);
  }

  const prompt = `
You are Rolling Cecil AI, a master diesel mechanic, parts specialist, diagnostic tech, and shop foreman.

The user asked:
"${question}"

Intent classification:
${intent}

Vehicle context:
${context || "No vehicle context entered."}

Shop memory found:
${memoryText || "No verified shop memory found."}

Repair procedure database found:
${procedureText || "No local repair procedure found."}

Repair kit database found:
${kitText || "No local repair kit found."}

Known failures database found:
${failureText || "No known failure match found."}

Answer the question no matter what it asks, as long as it is about repair, parts, diagnostics, labor, specs, tools, or shop workflow.

Use this exact format:

✅ SHORT ANSWER
Give the direct answer first.

✅ WHAT THIS IS / WHAT IT DOES
Explain component or system simply.

✅ VEHICLE / ENGINE CONTEXT
Use year/make/model/engine/VIN if present. Say what still needs verified.

✅ SAFETY FIRST
List hazards, battery disconnect, fluids, pressure, hot parts, lifting, blocking, PPE.

✅ TOOLS NEEDED
Common tools and specialty tools.

✅ PARTS / SEALS / GASKETS LIKELY NEEDED
List likely parts, but do not claim exact OEM part numbers unless verified by VIN/ESN/catalog/shop data.

✅ DISASSEMBLY / REMOVAL STEPS
Give clear step-by-step instructions.

✅ CLEANING / INSPECTION
What to inspect while it is apart.

✅ ASSEMBLY / INSTALL STEPS
Give clear step-by-step install instructions.

✅ TORQUE / SPECS
Give safe spec guidance.
If exact torque/spec is not verified, say:
VERIFY OEM SERVICE MANUAL BY VIN/ESN BEFORE FINAL TORQUE.
Never invent exact torque specs.

✅ COMMON MISTAKES
List mistakes techs make.

✅ DIAGNOSTIC CHECKS
Tests to confirm root cause before replacing parts.

✅ LABOR RANGE
Give realistic labor range and what changes it.

✅ ADD TO QUOTE
Labor, parts, supplies, coolant/oil/fluid, shop supplies, diagnostic time.

✅ VERIFIED FIX MEMORY
Summarize any shop memory provided. If none, tell the tech to save the confirmed fix after repair.

Rules:
- Be useful even when data is incomplete.
- Do not say you cannot help just because exact specs are missing.
- Use VERIFY warnings for exact part numbers, torque specs, fluid capacities, and service bulletin-sensitive items.
- Sound like a real diesel shop foreman.
`;

  try{
    let answer = "";

    if(typeof callAI === "function"){
      answer = await callAI(prompt, context, question);
    }else if(typeof askAI === "function"){
      answer = await askAI(prompt);
    }else if(typeof callOracleAI === "function"){
      answer = await callOracleAI(prompt);
    }else{
      answer =
`AI function not found.

Your app needs one existing AI call function named one of these:
- callAI(prompt, context, notes)
- askAI(prompt)
- callOracleAI(prompt)

The Cecil prompt is ready, but it needs to connect to your AI backend.`;
    }

    if(out) out.textContent = answer;
  }catch(e){
    if(out) out.textContent = "Cecil AI failed: " + (e.message || e);
  }
}

function clearCecilGenius(){
  const q = document.getElementById("cecilQuestion");
  const out = document.getElementById("cecilOut");
  if(q) q.value = "";
  if(out) out.textContent = "Ask Cecil anything: remove, install, diagnose, parts, specs, labor, quote.";
}
