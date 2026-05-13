// Rolling Cecil AI Phase 13 Embedding Router Starter
// Deploy later with Supabase Edge Functions. Keep API keys in Supabase secrets.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // TODO: pull queued rows from manual_ingestion_queue, chunk raw_text, call embedding provider,
    // then insert chunks into knowledge_base_embeddings with embedding vector.
    const { data, error } = await supabase
      .from("manual_ingestion_queue")
      .select("*")
      .eq("status", "queued")
      .limit(5);

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, queued: data?.length || 0, note: "Starter only. Add embedding provider call next." }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
