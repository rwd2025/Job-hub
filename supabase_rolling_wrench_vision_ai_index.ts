// =========================================================
// ROLLING WRENCH AI VISION - SUPABASE EDGE FUNCTION
// Function name:
// rolling-wrench-vision-ai
//
// Path:
// supabase/functions/rolling-wrench-vision-ai/index.ts
//
// Required secret:
// OPENAI_API_KEY
// =========================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));

    const question = String(body.question || "").trim();
    const context = String(body.context || "").trim();
    const imageBase64 = String(body.imageBase64 || "").trim();

    if (!imageBase64) {
      return json({ error: "Missing imageBase64" }, 400);
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return json({ error: "OPENAI_API_KEY missing in Supabase secrets" }, 500);
    }

    const prompt = `
You are Rolling Wrench AI Vision: a diesel mechanic, parts identifier, diagnostic tech, and shop foreman.

The tech uploaded/took a picture and asked:
${question || "Identify the image and explain useful repair information."}

Vehicle context:
${context || "No vehicle context entered."}

Analyze the image like a real mobile diesel mechanic.

Return the best useful answer using this exact format:

✅ WHAT I SEE
Identify visible parts, component area, leaks, damage, labels, hoses, wiring, fasteners, brake/air/hydraulic/diesel clues.
If uncertain, say what it might be and what to verify.

✅ LIKELY COMPONENT / SYSTEM
Name likely system: cooling, EGR, turbo, brakes, ABS, suspension, steering, fuel, aftertreatment, electrical, etc.

✅ ANSWER TO YOUR QUESTION
Directly answer what the tech asked.

✅ WHAT TO CHECK NEXT
Step-by-step inspection/testing checklist.

✅ IF REMOVING / DISASSEMBLING
Give safe removal steps if relevant.

✅ PARTS / SEALS / GASKETS LIKELY NEEDED
List likely parts. Do not claim exact OEM numbers unless visible or verified by VIN/ESN/catalog.

✅ TOOLS NEEDED
Common tools and specialty tools.

✅ SAFETY WARNINGS
Hot coolant, pressure, air system, battery, lifting/blocking, fuel pressure, DEF, brakes, sharp edges.

✅ COMMON MISTAKES
What techs commonly miss.

✅ QUOTE HELP
Suggest labor, parts, supplies, diagnostic time, fluids, shop supplies.

✅ NEXT ACTIONS
Offer useful next steps:
- Build parts kit
- Add to quote
- Show procedure
- Verify by VIN/ESN
- Check nearby suppliers
- Check FleetPride / NAPA / O'Reilly / dealer
- Ask for another picture angle

✅ VERIFY BEFORE ORDERING
Tell what needs VIN, ESN, CPL, axle tag, brake tag, transmission tag, or part casting/label.

Rules:
- Be useful, practical, and honest.
- Do not pretend you can read labels if blurry.
- If image is not enough, give the exact next picture angles needed.
- Never invent exact torque specs or exact part numbers from image alone.
`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: "You are Rolling Wrench AI Vision, a careful diesel repair vision assistant. Identify visible components and give practical repair guidance with verification warnings."
          },
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageBase64 } }
            ]
          }
        ]
      })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error?.message || "OpenAI vision request failed");
    }

    const answer = data.choices?.[0]?.message?.content || "No vision answer returned.";

    return json({ answer });

  } catch (e) {
    return json({ error: String(e?.message || e) }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
