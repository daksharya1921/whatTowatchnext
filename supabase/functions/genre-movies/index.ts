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

    const { genreIds, mediaType, excludeId, excludeTitle } = await req.json();
    if (!genreIds || !genreIds.length) {
      return new Response(JSON.stringify({ movies: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const TMDB_BASE = "https://api.themoviedb.org/3";
    const IMG_BASE = "https://image.tmdb.org/t/p/w300";
    const type = mediaType === "tv" ? "tv" : "movie";

    const res = await fetch(
      `${TMDB_BASE}/discover/${type}?with_genres=${genreIds.join(",")}&sort_by=vote_average.desc&vote_count.gte=500&page=1&api_key=${TMDB_API_KEY}`
    );
    const data = await res.json();

    const excludeLower = (excludeTitle || "").toLowerCase();
    const movies = (data.results || [])
      .filter((m: any) => {
        if (m.id === excludeId) return false;
        if (!m.poster_path) return false;
        if (excludeLower && (m.title || m.name || "").toLowerCase() === excludeLower) return false;
        return true;
      })
      .slice(0, 10)
      .map((m: any) => ({
        id: m.id,
        title: m.title || m.name || "Unknown",
        year: (m.release_date || m.first_air_date || "").substring(0, 4),
        poster: `${IMG_BASE}${m.poster_path}`,
        rating: m.vote_average ? m.vote_average.toFixed(1) : "N/A",
        mediaType: type,
      }));

    return new Response(
      JSON.stringify({ movies }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
