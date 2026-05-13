// ===== ADD NEAR YOUR API_URL =====

const EMBEDDING_ROUTER_URL =
"https://uxpkqwcmvtqvubibbrek.supabase.co/functions/v1/embedding-router";


// ===== ADD THIS FUNCTION NEAR callOracle() =====

async function callEmbeddingRouter(question){

  const res = await fetch(EMBEDDING_ROUTER_URL,{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "apikey":SUPABASE_KEY,
      "Authorization":"Bearer " + SUPABASE_KEY
    },
    body:JSON.stringify({
      question,
      vehicleContext:ctx()
    })
  });

  const data = await res.json();

  if(!res.ok){
    throw new Error(data.error || JSON.stringify(data));
  }

  return data;
}


// ===== REPLACE OLD homeAI() CALL SECTION WITH THIS =====

const data = await callEmbeddingRouter(
  q || "Analyze uploaded image"
);

$("homeAiOut").textContent =
  data.message +
  "\n\nQuery: " + data.query +
  "\n\nNext: " + data.next_step;
