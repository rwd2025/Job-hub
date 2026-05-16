/* =========================================================
ROLLING WRENCH AI VISION FRONTEND
Paste before closing </script>.

Calls Supabase Edge Function:
rolling-wrench-vision-ai
========================================================= */

function rwVisionVal(id){
  return document.getElementById(id)?.value?.trim() || "";
}

function rollingWrenchVehicleContext(){
  if(typeof vehicleContext === "function"){
    try{ return vehicleContext(); }catch(e){}
  }

  return [
    rwVisionVal("yearGlobal"),
    rwVisionVal("makeGlobal"),
    rwVisionVal("modelGlobal"),
    rwVisionVal("engineGlobal"),
    rwVisionVal("vinGlobal") ? "VIN: " + rwVisionVal("vinGlobal") : ""
  ].filter(Boolean).join(" ");
}

function previewRollingWrenchVisionImage(){
  const input = document.getElementById("rwVisionImage");
  const img = document.getElementById("rwVisionPreview");
  const file = input?.files?.[0];

  if(!file || !img) return;

  img.src = URL.createObjectURL(file);
  img.style.display = "block";
}

function rwFileToBase64(file){
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();
    reader.onload = ()=> resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function askRollingWrenchVisionAI(){
  const input = document.getElementById("rwVisionImage");
  const file = input?.files?.[0];
  const question =
    rwVisionVal("rwVisionQuestion") ||
    rwVisionVal("cecilVisionQuestion") ||
    rwVisionVal("cecilQuestion") ||
    rwVisionVal("webAiQuestion") ||
    "Identify what is shown and explain what to inspect, test, remove, replace, or verify.";

  const out = document.getElementById("rwVisionOut");

  if(!file){
    alert("Take a picture or choose a saved picture first.");
    return;
  }

  if(out) out.textContent = "Rolling Wrench AI is looking at the picture and building a mechanic answer...";

  try{
    const imageBase64 = await rwFileToBase64(file);

    const apiUrl =
      (typeof API_URL !== "undefined" && API_URL.includes("/functions/v1/"))
        ? API_URL.replace(/\/functions\/v1\/.*/, "/functions/v1/rolling-wrench-vision-ai")
        : "https://uxpkqwcmvtqvubibbrek.supabase.co/functions/v1/rolling-wrench-vision-ai";

    const apiKey =
      typeof SUPABASE_KEY !== "undefined"
        ? SUPABASE_KEY
        : "";

    const payload = {
      question,
      context: rollingWrenchVehicleContext(),
      imageBase64,
      fileName: file.name || "photo.jpg",
      imageType: file.type || "image/jpeg"
    };

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": apiKey,
        "Authorization": "Bearer " + apiKey
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(()=>({}));

    if(!res.ok){
      throw new Error(data.error || data.message || "Vision AI request failed");
    }

    if(out) out.textContent = data.answer || "No answer returned.";

  }catch(e){
    if(out){
      out.textContent =
`ROLLING WRENCH AI VISION FAILED:
${e.message || e}

Check:
1. Supabase function rolling-wrench-vision-ai is deployed.
2. OPENAI_API_KEY is set in Supabase secrets.
3. Your image is not too large. Try a closer/cropped picture.`;
    }
  }
}

function clearRollingWrenchVisionAI(){
  const input = document.getElementById("rwVisionImage");
  const img = document.getElementById("rwVisionPreview");
  const q = document.getElementById("rwVisionQuestion");
  const out = document.getElementById("rwVisionOut");

  if(input) input.value = "";
  if(img){
    img.src = "";
    img.style.display = "none";
  }
  if(q) q.value = "";
  if(out) out.textContent = "Take or upload a picture and ask Rolling Wrench AI what you need to know.";
}
