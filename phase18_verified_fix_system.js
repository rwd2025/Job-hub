/* =========================================================
PHASE 18 - VERIFIED FIX SYSTEM
Requires Supabase table: verified_fixes
Paste near your other functions, before the closing </script>.
========================================================= */

function rwVal(id){
  return document.getElementById(id)?.value?.trim() || "";
}

async function saveVerifiedFix(){
  const search = rwVal("vfSearch") || rwVal("partNumber") || rwVal("diagSearch") || rwVal("partSearch");
  const code = rwVal("vfCode") || rwVal("faultCode");
  const fix = rwVal("vfFix");
  const parts = rwVal("vfParts");
  const laborRaw = rwVal("vfLabor");
  const notes = rwVal("vfNotes");

  if(!search && !code){
    alert("Enter a symptom, search term, or fault code.");
    return;
  }

  if(!fix){
    alert("Enter the confirmed fix.");
    return;
  }

  const out = document.getElementById("vfOut");
  if(out) out.textContent = "Saving verified fix...";

  const payload = {
    search_term: search,
    year: rwVal("yearGlobal"),
    make: rwVal("makeGlobal"),
    model: rwVal("modelGlobal"),
    engine: rwVal("engineGlobal"),
    vin: rwVal("vinGlobal"),
    fault_code: code,
    symptom: search,
    confirmed_fix: fix,
    parts_used: parts,
    labor_hours: laborRaw ? Number(laborRaw) : null,
    tech_notes: notes,
    comeback: false,
    confidence: 100
  };

  try{
    const { data, error } = await supabase
      .from("verified_fixes")
      .insert([payload])
      .select()
      .single();

    if(error) throw error;

    if(out){
      out.textContent =
`✅ VERIFIED FIX SAVED

Search:
${data.search_term || "—"}

Vehicle:
${[data.year, data.make, data.model, data.engine].filter(Boolean).join(" ") || "—"}

Fault Code:
${data.fault_code || "—"}

Confirmed Fix:
${data.confirmed_fix || "—"}

Parts Used:
${data.parts_used || "—"}

Labor:
${data.labor_hours || "—"} hr

Tech Notes:
${data.tech_notes || "—"}`;
    }
  }catch(e){
    if(out) out.textContent = "Save failed: " + (e.message || e);
  }
}

async function findVerifiedFixes(){
  const search = rwVal("vfSearch") || rwVal("partNumber") || rwVal("diagSearch") || rwVal("partSearch");
  const code = rwVal("vfCode") || rwVal("faultCode");

  if(!search && !code){
    alert("Enter a search term or fault code.");
    return;
  }

  const out = document.getElementById("vfOut");
  if(out) out.textContent = "Searching shop memory...";

  try{
    let q = supabase
      .from("verified_fixes")
      .select("*")
      .order("created_at", { ascending:false })
      .limit(10);

    if(code){
      q = q.ilike("fault_code", `%${code}%`);
    }else{
      const safe = search.replaceAll(",", " ").replaceAll("%", "");
      q = q.or(
        `search_term.ilike.%${safe}%,symptom.ilike.%${safe}%,confirmed_fix.ilike.%${safe}%,parts_used.ilike.%${safe}%,tech_notes.ilike.%${safe}%`
      );
    }

    const { data, error } = await q;
    if(error) throw error;

    if(!data || !data.length){
      if(out){
        out.textContent =
`NO VERIFIED FIX FOUND

Next:
After this job is repaired, save the confirmed fix so the app learns it.`;
      }
      return;
    }

    if(out){
      out.textContent = data.map((r, i) =>
`#${i + 1} ✅ VERIFIED FIX

Search:
${r.search_term || "—"}

Vehicle:
${[r.year, r.make, r.model, r.engine].filter(Boolean).join(" ") || "—"}

Code:
${r.fault_code || "—"}

Confirmed Fix:
${r.confirmed_fix || "—"}

Parts Used:
${r.parts_used || "—"}

Labor:
${r.labor_hours || "—"} hr

Tech Notes:
${r.tech_notes || "—"}

Confidence:
${r.confidence || 100}%`
      ).join("\n\n----------------------\n\n");
    }
  }catch(e){
    if(out) out.textContent = "Search failed: " + (e.message || e);
  }
}

/* Optional helper:
Call this at the end of your regular parts/diagnostic lookup
to auto-check shop memory using the same search.
Example: autoCheckVerifiedFixMemory("X15 water pump");
*/
async function autoCheckVerifiedFixMemory(term){
  const out = document.getElementById("vfOut");
  if(!term || !supabase || !out) return;

  try{
    const safe = term.replaceAll(",", " ").replaceAll("%", "");
    const { data, error } = await supabase
      .from("verified_fixes")
      .select("*")
      .or(`search_term.ilike.%${safe}%,symptom.ilike.%${safe}%,confirmed_fix.ilike.%${safe}%,parts_used.ilike.%${safe}%,tech_notes.ilike.%${safe}%`)
      .order("created_at", { ascending:false })
      .limit(3);

    if(error || !data || !data.length) return;

    out.textContent =
`✅ SHOP MEMORY MATCH FOUND

${data.map((r, i) =>
`#${i + 1}
${r.confirmed_fix || "—"}
Parts: ${r.parts_used || "—"}
Labor: ${r.labor_hours || "—"} hr
Notes: ${r.tech_notes || "—"}`
).join("\n\n")}`;
  }catch(e){
    console.warn("Verified fix memory check failed", e);
  }
}
