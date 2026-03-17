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

    const { personName, role, excludeTitle } = await req.json();
    if (!personName) {
      return new Response(JSON.stringify({ error: "Missing personName" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const TMDB_BASE = "https://api.themoviedb.org/3";
    const IMG_BASE = "https://image.tmdb.org/t/p/w300";

    // Search for the person
    const searchRes = await fetch(
      `${TMDB_BASE}/search/person?query=${encodeURIComponent(personName)}&api_key=${TMDB_API_KEY}`
    );
    const searchData = await searchRes.json();
    const person = searchData.results?.[0];

    if (!person) {
      return new Response(
        JSON.stringify({ movies: [], personName, role }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get person's movie credits
    const creditsRes = await fetch(
      `${TMDB_BASE}/person/${person.id}/combined_credits?api_key=${TMDB_API_KEY}`
    );
    const creditsData = await creditsRes.json();

    let credits: any[] = [];

    if (role === "director") {
      credits = (creditsData.crew || []).filter(
        (c: any) => c.job === "Director" && c.poster_path
      );
    } else {
      // actor/actress — use cast credits
      credits = (creditsData.cast || []).filter(
        (c: any) => c.poster_path
      );
    }

    // Sort by popularity, deduplicate, limit to 10
    const seen = new Set<number>();
    const excludeLower = (excludeTitle || "").toLowerCase();
    const movies = credits
      .sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0))
      .filter((c: any) => {
        if (seen.has(c.id)) return false;
        seen.add(c.id);
        const t = (c.title || c.name || "").toLowerCase();
        if (excludeLower && t === excludeLower) return false;
        return true;
      })
      .slice(0, 10)
      .map((c: any) => ({
        id: c.id,
        title: c.title || c.name || "Unknown",
        year: (c.release_date || c.first_air_date || "").substring(0, 4),
        poster: c.poster_path ? `${IMG_BASE}${c.poster_path}` : null,
        rating: c.vote_average ? c.vote_average.toFixed(1) : "N/A",
        mediaType: c.media_type || "movie",
      }));

    return new Response(
      JSON.stringify({ movies, personName: person.name, role }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
