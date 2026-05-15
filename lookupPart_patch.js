// ===============================
// AUTO AI FALLBACK LOOKUP PATCH
// ===============================

async function lookupPart() {

  const q =
    $("partNumber")?.value?.trim() ||
    $("partSearch")?.value?.trim() ||
    $("masterSearch")?.value?.trim();

  if (!q) {
    alert("Enter part, engine, VIN, or repair question");
    return;
  }

  const out = $("partOut") || $("brainOut") || $("masterOut");

  if (out) {
    out.innerHTML = "Searching local database first...";
  }

  try {

    // ===============================
    // LOCAL DATABASE SEARCH
    // ===============================

    const { data: local, error: localErr } =
      await supabase.rpc(
        "expanded_backend_search",
        { q }
      );

    if (localErr) throw localErr;

    // ===============================
    // LOCAL RESULTS FOUND
    // ===============================

    if (local && local.length > 0) {

      if (typeof renderPartResults === "function") {
        renderPartResults(local);
      } else {

        out.innerHTML = `
          <div class="resultBox">
            <h2>LOCAL DATABASE RESULTS</h2>
            <pre>${JSON.stringify(local, null, 2)}</pre>
          </div>
        `;
      }

      return;
    }

    // ===============================
    // AI / WEB FALLBACK
    // ===============================

    if (out) {
      out.innerHTML =
        "No local match. Searching AI/web fallback...";
    }

    const { data: ai, error: aiErr } =
      await supabase.functions.invoke(
        "bright-task",
        {
          body: {
            mode: "part_lookup",
            query: q,
            instruction:
              "Find OEM part number options, aftermarket crosses, fitment warnings, required gaskets/seals, labor notes, and torque/spec warnings. Do not guess. If exact part depends on VIN/ESN/CPL, say so clearly."
          }
        }
      );

    if (aiErr) throw aiErr;

    const answer =
      ai?.answer ||
      ai?.result ||
      ai?.text ||
      JSON.stringify(ai, null, 2);

    // ===============================
    // RENDER RESULTS
    // ===============================

    if (out) {
      out.innerHTML = `
        <div class="resultBox">
          <h2>AI / WEB FALLBACK RESULT</h2>
          <pre>${answer}</pre>
        </div>
      `;
    }

    // ===============================
    // AUTO SAVE TO SHOP MEMORY
    // ===============================

    await supabase.from("repair_memory").insert({
      search_term: q,
      result_text: answer,
      source: "auto_ai_fallback",
      verified: false
    });

  } catch (err) {

    if (out) {
      out.innerHTML =
        "Lookup failed: " + err.message;
    }

    console.error(err);
  }
}

// ===============================
// BUTTON PATCH
// ===============================

// CHANGE YOUR BUTTON TO:
//
// <button onclick="lookupPart()">
//   LOOKUP PART
// </button>
