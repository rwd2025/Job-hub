const $ = (id) => document.getElementById(id);
const screens = [...document.querySelectorAll('.screen')];
const navButtons = [...document.querySelectorAll('[data-screen]')];
let historyStack = ['home'];
function showScreen(id){
  screens.forEach(s=>s.classList.toggle('active', s.id===id));
  document.querySelectorAll('.bottomNav button').forEach(b=>b.classList.toggle('active', b.dataset.screen===id));
  if(historyStack[historyStack.length-1]!==id) historyStack.push(id);
}
navButtons.forEach(btn=>btn.addEventListener('click',()=>showScreen(btn.dataset.screen)));
$('backBtn').addEventListener('click',()=>{historyStack.pop();showScreen(historyStack.pop()||'home')});
$('menuBtn').addEventListener('click',()=>showScreen('settings'));
$('cameraBtn').addEventListener('click',()=>$('scannerInput').click());
$('scannerInput').addEventListener('change',(e)=>handleScan(e,'vision'));
$('openScanner')?.addEventListener('click',()=>$('visionFile').click());
$('scanVin')?.addEventListener('click',()=>$('visionFile').click());
$('visionFile')?.addEventListener('change',(e)=>handleScan(e,'vision'));
function handleScan(e,target){
  const file=e.target.files?.[0]; if(!file) return;
  const url=URL.createObjectURL(file);
  if($('visionPreview')) $('visionPreview').src=url;
  if($('visionResult')) $('visionResult').textContent='Scanner captured image: '+file.name+' — ready for OCR / AI part or VIN reading.';
  $('scannerStatus')?.querySelector('em') && ($('scannerStatus').querySelector('em').textContent='IMAGE READY');
  showScreen('vision');
}
document.querySelectorAll('.chips button').forEach(b=>b.addEventListener('click',()=>{
  const msg=b.dataset.fill||'Master search';
  const result=document.querySelector('.masterPanel h2');
  result.textContent='MASTER SEARCH • '+msg.toUpperCase();
}));
$('saveTruck')?.addEventListener('click',()=>{
  const vin=$('vinInput').value.trim()||'NONE'; const eng=$('engineInput').value.trim()||'UNKNOWN';
  $('activeVin').textContent=vin; $('activeEngine').textContent=eng; $('stripVin').textContent='VIN: '+vin; $('stripEngine').textContent=eng;
  $('vinResult').textContent='Active truck saved.';
  showScreen('home');
});
$('gpsBtn')?.addEventListener('click',()=>{
  const out=$('gpsResult');
  if(!navigator.geolocation){out.textContent='GPS not available on this device.';return;}
  out.textContent='Getting GPS...';
  navigator.geolocation.getCurrentPosition(p=>{out.textContent=`GPS Pin: ${p.coords.latitude.toFixed(6)}, ${p.coords.longitude.toFixed(6)}`},()=>{out.textContent='GPS permission denied or unavailable.'});
});
if('serviceWorker' in navigator){ window.addEventListener('load',()=>navigator.serviceWorker.register('service-worker.js').catch(()=>{})); }
