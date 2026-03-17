import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");
    if (!TMDB_API_KEY) {
      return new Response(
        JSON.stringify({ error: "TMDB_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { imdb_id, media_type } = await req.json();
    if (!imdb_id) {
      return new Response(JSON.stringify({ error: "Missing imdb_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let tmdbId: number | null = null;
    let resolvedType: "movie" | "tv" = media_type || "movie";

    if (typeof imdb_id === "string" && imdb_id.startsWith("tt")) {
      const findRes = await fetch(
        `https://api.themoviedb.org/3/find/${imdb_id}?external_source=imdb_id&api_key=${TMDB_API_KEY}`
      );
      const findData = await findRes.json();
      if (findData.movie_results?.[0]) {
        tmdbId = findData.movie_results[0].id;
        resolvedType = "movie";
      } else if (findData.tv_results?.[0]) {
        tmdbId = findData.tv_results[0].id;
        resolvedType = "tv";
      }
    } else if (typeof imdb_id === "string" && imdb_id.startsWith("tmdb-")) {
      tmdbId = parseInt(imdb_id.replace("tmdb-", ""), 10);
    }

    if (!tmdbId) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const endpoint = resolvedType === "tv" ? "tv" : "movie";
    const res = await fetch(
      `https://api.themoviedb.org/3/${endpoint}/${tmdbId}/similar?api_key=${TMDB_API_KEY}&page=1`
    );
    const data = await res.json();

    // Tag results with media_type
    if (data.results) {
      data.results = data.results.map((r: any) => ({
        ...r,
        media_type: r.media_type || resolvedType,
      }));
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("similar-movies error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
