import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY");

    if (!OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY secret.");
    if (!SUPABASE_URL) throw new Error("Missing SUPABASE_URL secret.");
    if (!SERVICE_ROLE_KEY) throw new Error("Missing SERVICE_ROLE_KEY secret.");

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const body = await req.json().catch(() => ({}));
    const mode = body.mode || "search";

    const question =
      body.question ||
      body.query ||
      body.search_text ||
      "";

    const text =
      body.text ||
      body.content ||
      "";

    if (mode === "ping") {
      return new Response(
        JSON.stringify({
          status: "ok",
          route: "embedding-router",
          message: "Rolling Cecil AI embedding router is online."
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    if (mode === "search") {
      if (!question || question.trim().length < 2) {
        return new Response(
          JSON.stringify({
            status: "error",
            error: "Missing search question."
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      const embeddingResponse = await fetch(
        "https://api.openai.com/v1/embeddings",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "text-embedding-3-small",
            input: question
          })
        }
      );

      const embeddingData = await embeddingResponse.json();

      if (!embeddingResponse.ok) {
        throw new Error(
          embeddingData.error?.message ||
          "OpenAI embedding search request failed"
        );
      }

      const queryEmbedding = embeddingData.data?.[0]?.embedding;

      if (!Array.isArray(queryEmbedding)) {
        throw new Error("OpenAI did not return a valid query embedding.");
      }

      // Supabase RPC / pgvector needs a vector string, not a raw JS array.
      const queryVector = `[${queryEmbedding.join(",")}]`;

      const { data, error } = await supabase.rpc(
        "match_knowledge_base_v2",
        {
          query_embedding: queryVector,
          match_count: body.match_count || 5
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      console.log("MATCH RESULTS:", data);

      return new Response(
        JSON.stringify({
          status: "ok",
          mode: "search",
          question,
          matches: data || []
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    if (mode === "ingest") {
      if (!text || text.trim().length < 5) {
        return new Response(
          JSON.stringify({
            status: "error",
            error: "Missing text/content for ingestion."
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      const embeddingResponse = await fetch(
        "https://api.openai.com/v1/embeddings",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "text-embedding-3-small",
            input: text
          })
        }
      );

      const embeddingData = await embeddingResponse.json();

      if (!embeddingResponse.ok) {
        throw new Error(
          embeddingData.error?.message ||
          "OpenAI embedding ingest request failed"
        );
      }

      const embedding = embeddingData.data?.[0]?.embedding;

      if (!Array.isArray(embedding)) {
        throw new Error("OpenAI did not return a valid ingest embedding.");
      }

      const { error } = await supabase
        .from("knowledge_base_embeddings")
        .insert({
          source_type: body.source_type || "Field Note",
          source_name: body.source_name || "Rolling Cecil AI Note",
          content: text,
          embedding,
          metadata: body.metadata || {}
        });

      if (error) {
        throw new Error(error.message);
      }

      return new Response(
        JSON.stringify({
          status: "ok",
          mode: "ingest",
          message: "Knowledge saved and embedded."
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({
        status: "error",
        error: "Unknown mode. Use ping, ingest, or search."
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({
        status: "error",
        error: String(err?.message || err)
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
