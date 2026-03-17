import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check cache first (valid for 24 hours)
    const { data: cached } = await supabase
      .from("trending_cache")
      .select("data, fetched_at")
      .order("fetched_at", { ascending: false })
      .limit(1)
      .single();

    if (cached) {
      const age = Date.now() - new Date(cached.fetched_at).getTime();
      const ONE_DAY = 24 * 60 * 60 * 1000;
      if (age < ONE_DAY) {
        console.log("Serving trending from cache");
        return new Response(JSON.stringify(cached.data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Fetch fresh data from TMDB — trending/all includes movies AND TV
    const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");
    if (!TMDB_API_KEY) {
      return new Response(
        JSON.stringify({ error: "TMDB_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const res = await fetch(
      `https://api.themoviedb.org/3/trending/all/week?api_key=${TMDB_API_KEY}`
    );
    const data = await res.json();

    // Filter to only movie and tv results
    if (data.results) {
      data.results = data.results.filter(
        (r: any) => r.media_type === "movie" || r.media_type === "tv"
      );
    }

    console.log("Fetched fresh trending data from TMDB (movies + TV)");

    // Clear old cache and insert new
    await supabase.from("trending_cache").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("trending_cache").insert({ data });

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("trending-movies error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
