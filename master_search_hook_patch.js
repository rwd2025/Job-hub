/* =========================================================
   MASTER SEARCH HOOK PATCH
   Paste this INSIDE your existing runMasterSearch()
   or masterSearch() function.
   ========================================================= */

const searchTerm =
document.getElementById("masterSearch")?.value ||
document.getElementById("masterInput")?.value ||
document.getElementById("oracleSearch")?.value ||
"";

await rc21_runRepairKitPatch(searchTerm);

/* =========================================================
   END PATCH
   ========================================================= */
