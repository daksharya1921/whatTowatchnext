import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CACHE_TTL_HOURS = 72; // 3 days

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !TMDB_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing required configuration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { title, plot, genre, year, mediaType, imdbId } = await req.json();
    if (!title || !plot) {
      return new Response(
        JSON.stringify({ error: "Missing title or plot" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const cacheKey = imdbId || title.toLowerCase().trim();

    // Check cache
    const { data: cached } = await supabase
      .from("plot_recommendations_cache")
      .select("recommendations, created_at")
      .eq("imdb_id", cacheKey)
      .maybeSingle();

    if (cached) {
      const age = Date.now() - new Date(cached.created_at).getTime();
      if (age < CACHE_TTL_HOURS * 60 * 60 * 1000) {
        return new Response(
          JSON.stringify({ movies: cached.recommendations, cached: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Call AI for fresh recommendations
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You are a movie recommendation engine. Given a movie's plot, title, genre, and year, suggest 6 other movies or TV shows with similar themes, narrative structure, or plot elements. Focus on thematic and story similarity, not just genre. Do NOT include the original title. Prefer well-known titles that would be on TMDB.",
          },
          {
            role: "user",
            content: `Title: "${title}" (${year || "N/A"})\nGenre: ${genre || "N/A"}\nPlot: ${plot}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "recommend_similar",
              description: "Return 6 movies/TV shows with similar plots.",
              parameters: {
                type: "object",
                properties: {
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Exact title as it appears on TMDB" },
                        year: { type: "string", description: "Release year" },
                        reason: { type: "string", description: "One sentence explaining plot similarity" },
                      },
                      required: ["title", "year", "reason"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["recommendations"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "recommend_similar" } },
      }),
    });

    if (!aiRes.ok) {
      const status = aiRes.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await aiRes.text();
      console.error("AI gateway error:", status, errText);
      return new Response(
        JSON.stringify({ error: "AI recommendation failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiRes.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let recommendations: { title: string; year: string; reason: string }[] = [];

    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        recommendations = parsed.recommendations || [];
      } catch {
        console.error("Failed to parse AI tool call arguments");
      }
    }

    if (!recommendations.length) {
      return new Response(
        JSON.stringify({ movies: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch TMDB data for each recommendation in parallel
    const TMDB_BASE = "https://api.themoviedb.org/3";
    const IMG_BASE = "https://image.tmdb.org/t/p/w300";
    const excludeLower = title.toLowerCase();

    const moviePromises = recommendations.map(async (rec) => {
      try {
        const searchRes = await fetch(
          `${TMDB_BASE}/search/multi?query=${encodeURIComponent(rec.title)}&api_key=${TMDB_API_KEY}`
        );
        const searchData = await searchRes.json();
        const result = (searchData.results || []).find(
          (r: any) =>
            (r.media_type === "movie" || r.media_type === "tv") &&
            (r.title || r.name || "").toLowerCase() !== excludeLower
        );
        if (!result) return null;

        return {
          id: result.id,
          title: result.title || result.name || rec.title,
          year: (result.release_date || result.first_air_date || "").substring(0, 4) || rec.year,
          poster: result.poster_path ? `${IMG_BASE}${result.poster_path}` : null,
          rating: result.vote_average ? result.vote_average.toFixed(1) : "N/A",
          mediaType: result.media_type || "movie",
          reason: rec.reason,
        };
      } catch {
        return null;
      }
    });

    const results = (await Promise.all(moviePromises)).filter(Boolean);

    // Save to cache (upsert)
    await supabase
      .from("plot_recommendations_cache")
      .upsert(
        { imdb_id: cacheKey, title, recommendations: results, created_at: new Date().toISOString() },
        { onConflict: "imdb_id" }
      );

    return new Response(
      JSON.stringify({ movies: results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    console.error("plot-recommendations error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
