
/* =========================================================
ROLLING WRENCH AI - MASTER CHAT BAR JS
========================================================= */

function rwAutoGrowMasterInput(el){
  if(!el) return;
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 120) + "px";
}

function masterImageSelected(){
  const input = document.getElementById("masterImageInput");
  const preview = document.getElementById("masterImagePreview");
  const file = input?.files?.[0];

  if(!file || !preview) return;

  preview.src = URL.createObjectURL(file);
  preview.style.display = "block";
}

async function routeMasterSearchWithImage(){
  const imgInput = document.getElementById("masterImageInput");
  const hasImage = !!imgInput?.files?.[0];

  if(!hasImage) return false;

  const q =
    document.getElementById("masterInput")?.value ||
    document.getElementById("masterSearch")?.value ||
    "What is shown in this picture?";

  const visionInput = document.getElementById("rwVisionImage");
  const visionQuestion = document.getElementById("rwVisionQuestion");

  if(visionInput && visionQuestion && typeof askRollingWrenchVisionAI === "function"){
    const dt = new DataTransfer();
    dt.items.add(imgInput.files[0]);
    visionInput.files = dt.files;
    visionQuestion.value = q;

    await askRollingWrenchVisionAI();

    const visionOut = document.getElementById("rwVisionOut")?.textContent || "";
    const masterOut =
      document.getElementById("masterOut") ||
      document.getElementById("oracleOut") ||
      document.getElementById("homeAiOut");

    if(masterOut && visionOut) masterOut.textContent = visionOut;

    return true;
  }

  alert("Rolling Wrench AI Vision is not connected yet.");
  return true;
}

/*
IMPORTANT:
At the TOP of your existing runMasterSearch() function add:

if(await routeMasterSearchWithImage()) return;

Example:

async function runMasterSearch(){
  if(await routeMasterSearchWithImage()) return;

  // old master AI / parts / procedure routing here
}
*/

function startRwVoiceInput(){
  const input = document.getElementById("masterInput");

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if(!SpeechRecognition){
    alert("Voice input is not supported in this browser yet.");
    return;
  }

  const rec = new SpeechRecognition();
  rec.lang = "en-US";
  rec.interimResults = false;
  rec.maxAlternatives = 1;

  rec.onresult = function(event){
    const text = event.results?.[0]?.[0]?.transcript || "";
    if(input){
      input.value = text;
      rwAutoGrowMasterInput(input);
    }
  };

  rec.onerror = function(){
    alert("Voice input failed. Try typing instead.");
  };

  rec.start();
}
