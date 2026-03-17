import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MOOD_GENRE_MAP: Record<string, number[]> = {
  happy: [35, 10751],
  sad: [18],
  "mind-bending": [878, 9648],
  thriller: [53, 80],
  funny: [35],
  romantic: [10749],
  chill: [10751, 12],
  action: [28],
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function qualityFilter(results: any[]): any[] {
  return results.filter(
    (r: any) => r.poster_path && r.vote_average > 6.0 && r.vote_count >= 20
  );
}

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

    const { mode, mood } = await req.json();
    const randomPage = Math.floor(Math.random() * 10) + 1;

    let url: string;

    if (mode === "surprise") {
      const page = Math.floor(Math.random() * 20) + 1;
      url = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`;
    } else if (mode === "tonight") {
      // Use trending/day for fresh daily picks
      url = `https://api.themoviedb.org/3/trending/movie/day?api_key=${TMDB_API_KEY}&page=1`;
    } else if (mode === "binge") {
      url = `https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_API_KEY}&page=${randomPage}`;
    } else if (mode === "mood" && mood && MOOD_GENRE_MAP[mood]) {
      const genreIds = MOOD_GENRE_MAP[mood].join(",");
      url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreIds}&sort_by=popularity.desc&vote_count.gte=100&page=${randomPage}`;
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid mode or mood" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const res = await fetch(url);
    const data = await res.json();

    let results = data.results || [];

    if (mode === "surprise") {
      const pool = qualityFilter(results);
      const fallback = results.filter((r: any) => r.poster_path);
      const source = pool.length > 0 ? pool : fallback;
      const pick = source[Math.floor(Math.random() * source.length)];
      results = pick ? [pick] : [];
    } else if (mode === "tonight") {
      // Pick a random high-quality trending movie
      const pool = qualityFilter(results);
      const fallback = results.filter((r: any) => r.poster_path);
      const source = shuffle(pool.length > 0 ? pool : fallback);
      results = source.length > 0 ? [source[0]] : results.slice(0, 1);
    } else if (mode === "binge") {
      // Filter for quality, shuffle, take 8
      const pool = results.filter((r: any) => r.poster_path && r.vote_average > 6.0);
      const source = pool.length >= 6 ? pool : results.filter((r: any) => r.poster_path);
      results = shuffle(source).slice(0, 8);
    } else {
      // Mood: filter for quality, shuffle, take 8
      const pool = qualityFilter(results);
      const source = pool.length >= 6 ? pool : results.filter((r: any) => r.poster_path);
      results = shuffle(source).slice(0, 8);
    }

    const items = results.map((r: any) => ({
      id: r.id,
      title: r.title || r.name,
      year: (r.release_date || r.first_air_date || "").split("-")[0] || "N/A",
      poster: r.poster_path ? `https://image.tmdb.org/t/p/w300${r.poster_path}` : null,
      rating: r.vote_average?.toFixed(1) || "N/A",
      mediaType: r.name ? "tv" : "movie",
      overview: (r.overview || "").slice(0, 120),
    }));

    return new Response(JSON.stringify({ items }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("discover-movies error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
