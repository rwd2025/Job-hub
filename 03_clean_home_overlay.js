/* ROLLING WRENCH AI - CLEAN HOME + FULL SCREEN AI OVERLAY JS */
let rwAiOverlayImageData = "";
let rwAiOverlayImageName = "";

function openRollingWrenchAIOverlay(openImagePicker){
  const overlay = document.getElementById("rwAiOverlay");
  if(!overlay) return;
  overlay.classList.add("open");
  loadRwAiOverlayState();
  if(openImagePicker) setTimeout(()=>document.getElementById("rwAiImageInput")?.click(),150);
}
function closeRollingWrenchAIOverlay(){
  document.getElementById("rwAiOverlay")?.classList.remove("open");
  saveRwAiOverlayState();
}
function clearRollingWrenchAIOverlay(){
  ["rw_ai_overlay_question","rw_ai_overlay_answer","rw_ai_overlay_image","rw_ai_overlay_image_name"].forEach(k=>localStorage.removeItem(k));
  rwAiOverlayImageData=""; rwAiOverlayImageName="";
  const q=document.getElementById("rwAiQuestionInput"), ans=document.getElementById("rwAiOverlayAnswer"), img=document.getElementById("rwAiPhotoPreview"), wrap=document.getElementById("rwAiPhotoPreviewWrap"), file=document.getElementById("rwAiImageInput");
  if(q) q.value="";
  if(ans) ans.textContent="Ask a question, add a picture if needed, and Rolling Wrench AI will answer here.";
  if(img) img.src="";
  if(wrap) wrap.style.display="none";
  if(file) file.value="";
}
function saveRwAiOverlayState(){
  localStorage.setItem("rw_ai_overlay_question", document.getElementById("rwAiQuestionInput")?.value || "");
  localStorage.setItem("rw_ai_overlay_answer", document.getElementById("rwAiOverlayAnswer")?.textContent || "");
  if(rwAiOverlayImageData){
    localStorage.setItem("rw_ai_overlay_image", rwAiOverlayImageData);
    localStorage.setItem("rw_ai_overlay_image_name", rwAiOverlayImageName || "photo");
  }
}
function loadRwAiOverlayState(){
  const q=localStorage.getItem("rw_ai_overlay_question")||"", ans=localStorage.getItem("rw_ai_overlay_answer")||"", imgData=localStorage.getItem("rw_ai_overlay_image")||"", imgName=localStorage.getItem("rw_ai_overlay_image_name")||"";
  const qEl=document.getElementById("rwAiQuestionInput"), ansEl=document.getElementById("rwAiOverlayAnswer"), img=document.getElementById("rwAiPhotoPreview"), wrap=document.getElementById("rwAiPhotoPreviewWrap");
  if(qEl){qEl.value=q; rwAiAutoGrow(qEl);}
  if(ansEl && ans) ansEl.textContent=ans;
  if(imgData && img && wrap){rwAiOverlayImageData=imgData; rwAiOverlayImageName=imgName; img.src=imgData; wrap.style.display="block";}
}
function rwAiAutoGrow(el){ if(!el)return; el.style.height="auto"; el.style.height=Math.min(el.scrollHeight,120)+"px"; }
function rwAiOverlayImageSelected(){
  const file=document.getElementById("rwAiImageInput")?.files?.[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=function(){
    rwAiOverlayImageData=String(reader.result||""); rwAiOverlayImageName=file.name||"photo";
    const img=document.getElementById("rwAiPhotoPreview"), wrap=document.getElementById("rwAiPhotoPreviewWrap");
    if(img&&wrap){img.src=rwAiOverlayImageData; wrap.style.display="block";}
    saveRwAiOverlayState();
  };
  reader.readAsDataURL(file);
}
async function askRollingWrenchAIOverlay(){
  const question=document.getElementById("rwAiQuestionInput")?.value?.trim() || "What is shown in this picture?";
  const ans=document.getElementById("rwAiOverlayAnswer");
  if(ans) ans.textContent="Rolling Wrench AI is thinking...";
  saveRwAiOverlayState();
  try{
    if(rwAiOverlayImageData){
      const visionInput=document.getElementById("rwVisionImage"), visionQuestion=document.getElementById("rwVisionQuestion");
      if(visionInput && visionQuestion && typeof askRollingWrenchVisionAI==="function"){
        const blob=await (await fetch(rwAiOverlayImageData)).blob();
        const file=new File([blob], rwAiOverlayImageName||"photo.jpg", {type: blob.type||"image/jpeg"});
        const dt=new DataTransfer(); dt.items.add(file);
        visionInput.files=dt.files; visionQuestion.value=question;
        await askRollingWrenchVisionAI();
        const visionOut=document.getElementById("rwVisionOut")?.textContent || "";
        if(ans) ans.textContent=visionOut || "No image answer returned.";
        saveRwAiOverlayState(); return;
      }
    }
    const masterInput=document.getElementById("masterInput")||document.getElementById("masterSearch")||document.getElementById("oracleSearch");
    if(masterInput) masterInput.value=question;
    if(typeof phase8MasterSearch==="function") await phase8MasterSearch();
    else if(typeof runMasterSearch==="function") await runMasterSearch();
    const result=document.getElementById("homeAiOut")?.textContent || document.getElementById("oracleOut")?.textContent || document.getElementById("partOut")?.textContent || "Search complete.";
    if(ans) ans.textContent=result;
    saveRwAiOverlayState();
  }catch(e){
    if(ans) ans.textContent="Rolling Wrench AI failed: "+(e.message||e);
    saveRwAiOverlayState();
  }
}
function toggleRwMasterDrop(){document.getElementById("rwMasterDropContent")?.classList.toggle("open");}
async function runRwMasterDropSearch(){
  const input=document.getElementById("rwMasterDropInput"), out=document.getElementById("rwMasterDropResult"), q=input?.value?.trim()||"";
  if(!q){alert("Enter something to search."); return;}
  if(out) out.textContent="Searching...";
  const masterInput=document.getElementById("masterInput")||document.getElementById("masterSearch")||document.getElementById("oracleSearch");
  if(masterInput) masterInput.value=q;
  try{
    if(typeof phase8MasterSearch==="function") await phase8MasterSearch();
    else if(typeof runMasterSearch==="function") await runMasterSearch();
    const result=document.getElementById("homeAiOut")?.textContent || document.getElementById("oracleOut")?.textContent || document.getElementById("partOut")?.textContent || "Search complete.";
    if(out) out.textContent=result;
  }catch(e){if(out) out.textContent="Master search failed: "+(e.message||e);}
}
function startRwOverlayVoice(){
  const input=document.getElementById("rwAiQuestionInput");
  const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SpeechRecognition){alert("Voice input is not supported in this browser yet."); return;}
  const rec=new SpeechRecognition(); rec.lang="en-US"; rec.interimResults=false; rec.maxAlternatives=1;
  rec.onresult=function(event){const text=event.results?.[0]?.[0]?.transcript||""; if(input){input.value=text; rwAiAutoGrow(input); saveRwAiOverlayState();}};
  rec.onerror=function(){alert("Voice input failed. Try typing instead.");};
  rec.start();
}
document.addEventListener("DOMContentLoaded", loadRwAiOverlayState);
