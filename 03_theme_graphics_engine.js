/* =========================================================
ROLLING WRENCH AI - THEME / GRAPHICS ENGINE JS
Paste at bottom of app.js.
========================================================= */

function setRwBrandTheme(theme){
  const themes = [
    "rolling","cat","cummins","detroit",
    "paccar","nightops","brightshop","carbon"
  ];

  themes.forEach(t=>{
    document.body.classList.remove("rw-theme-" + t);
  });

  document.body.classList.add("rw-theme-" + theme);
  localStorage.setItem("rw_brand_theme", theme);
  rwUpdateThemePreview();
}

function setRwLightMode(mode){
  ["day","shop","night"].forEach(m=>{
    document.body.classList.remove("rw-light-" + m);
  });

  document.body.classList.add("rw-light-" + mode);
  localStorage.setItem("rw_light_mode", mode);
}

function setRwLogoStyle(style){
  ["shoppro","chrome","minimal","industrial"].forEach(s=>{
    document.body.classList.remove("rw-logo-" + s);
  });

  document.body.classList.add("rw-logo-" + style);
  localStorage.setItem("rw_logo_style", style);
  rwUpdateThemePreview();
}

function rwUpdateThemePreview(){
  const logo = document.getElementById("rwPreviewLogo");
  if(!logo) return;

  const theme = localStorage.getItem("rw_brand_theme") || "rolling";
  const labelMap = {
    rolling:"RW",
    cat:"CAT",
    cummins:"C",
    detroit:"D",
    paccar:"P",
    nightops:"N",
    brightshop:"RW",
    carbon:"RW"
  };

  logo.textContent = labelMap[theme] || "RW";
}

function rwInitThemeEngine(){
  const theme = localStorage.getItem("rw_brand_theme") || "rolling";
  const light = localStorage.getItem("rw_light_mode") || "shop";
  const logo = localStorage.getItem("rw_logo_style") || "shoppro";

  setRwBrandTheme(theme);
  setRwLightMode(light);
  setRwLogoStyle(logo);
}

document.addEventListener("DOMContentLoaded", rwInitThemeEngine);
