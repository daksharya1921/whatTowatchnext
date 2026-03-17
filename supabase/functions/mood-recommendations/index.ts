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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");

    if (!LOVABLE_API_KEY || !TMDB_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing required configuration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { mood } = await req.json();
    if (!mood) {
      return new Response(
        JSON.stringify({ error: "Missing mood parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const moodDescriptions: Record<string, string> = {
      "Feel-good": "uplifting, heartwarming, optimistic movies that leave you smiling. Think comedies, feel-good dramas, and wholesome stories.",
      "Thrilling": "intense, suspenseful, edge-of-your-seat movies with tension, action, or danger. Think thrillers, action films, and crime dramas.",
      "Mind-bending": "intellectually stimulating movies with twists, complex narratives, or philosophical themes. Think sci-fi, psychological thrillers, and cerebral dramas.",
      "Romantic": "love stories, romantic comedies, and films centered on relationships and emotional connections.",
      "Dark & Gritty": "raw, intense, and unflinching films exploring darker themes. Think noir, crime, and gritty dramas.",
      "Epic Adventure": "grand-scale stories with quests, exploration, and spectacle. Think fantasy, historical epics, and adventure films.",
    };

    const description = moodDescriptions[mood] || `movies that match the "${mood}" mood`;

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
              "You are a movie recommendation engine. Given a mood, suggest 8 movies or TV shows that perfectly match that mood. Pick a mix of popular and hidden gems. Prefer titles available on TMDB. Include a brief reason why each fits the mood.",
          },
          {
            role: "user",
            content: `Mood: "${mood}"\nDescription: ${description}\n\nRecommend 8 titles that perfectly capture this mood. Mix well-known favorites with lesser-known gems.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "mood_recommendations",
              description: "Return 8 movie/TV recommendations for a given mood.",
              parameters: {
                type: "object",
                properties: {
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Exact title as on TMDB" },
                        year: { type: "string", description: "Release year" },
                        reason: { type: "string", description: "One sentence on why it fits the mood" },
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
        tool_choice: { type: "function", function: { name: "mood_recommendations" } },
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
      console.error("AI gateway error:", status, await aiRes.text());
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
        recommendations = JSON.parse(toolCall.function.arguments).recommendations || [];
      } catch {
        console.error("Failed to parse AI arguments");
      }
    }

    if (!recommendations.length) {
      return new Response(
        JSON.stringify({ movies: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Enrich with TMDB data
    const TMDB_BASE = "https://api.themoviedb.org/3";
    const IMG_BASE = "https://image.tmdb.org/t/p/w300";

    const moviePromises = recommendations.map(async (rec) => {
      try {
        const searchRes = await fetch(
          `${TMDB_BASE}/search/multi?query=${encodeURIComponent(rec.title)}&api_key=${TMDB_API_KEY}`
        );
        const searchData = await searchRes.json();
        const result = (searchData.results || []).find(
          (r: any) => r.media_type === "movie" || r.media_type === "tv"
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

    return new Response(
      JSON.stringify({ movies: results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    console.error("mood-recommendations error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
