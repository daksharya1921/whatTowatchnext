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

    const { query, region } = await req.json();
    const watchRegion = (region || "US").toUpperCase();
    if (!query) {
      return new Response(JSON.stringify({ error: "Missing query" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const TMDB_BASE = "https://api.themoviedb.org/3";

    // Check if query is an IMDB ID (from trending cards)
    const isImdbId = /^tt\d+$/i.test(query);

    let movieId: number | null = null;
    let mediaType: "movie" | "tv" = "movie";
    let suggestions: { title: string; year: string; tmdbId: number; mediaType: string }[] = [];

    if (isImdbId) {
      const findRes = await fetch(
        `${TMDB_BASE}/find/${query}?external_source=imdb_id&api_key=${TMDB_API_KEY}`
      );
      const findData = await findRes.json();
      const foundMovie = findData.movie_results?.[0];
      const foundTv = findData.tv_results?.[0];
      if (foundMovie) {
        movieId = foundMovie.id;
        mediaType = "movie";
      } else if (foundTv) {
        movieId = foundTv.id;
        mediaType = "tv";
      } else {
        return new Response(JSON.stringify({ error: "Title not found" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      // Use multi search to find both movies and TV shows
      const searchRes = await fetch(
        `${TMDB_BASE}/search/multi?query=${encodeURIComponent(query)}&api_key=${TMDB_API_KEY}`
      );
      const searchData = await searchRes.json();

      // Filter to only movie and tv results
      const results = (searchData.results || []).filter(
        (r: any) => r.media_type === "movie" || r.media_type === "tv"
      );

      if (!results.length) {
        // AI-powered spelling correction fallback
        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        let correctedQuery = "";

        if (LOVABLE_API_KEY) {
          try {
            const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${LOVABLE_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-2.5-flash-lite",
                messages: [
                  {
                    role: "system",
                    content: "You are a movie/TV show title spell-checker. The user will give you a misspelled title. Return ONLY the corrected title, nothing else.",
                  },
                  { role: "user", content: query },
                ],
              }),
            });
            if (aiRes.ok) {
              const aiData = await aiRes.json();
              correctedQuery = aiData.choices?.[0]?.message?.content?.trim() || "";
            }
          } catch (aiErr) {
            console.error("Spelling correction failed:", aiErr);
          }
        }

        if (correctedQuery && correctedQuery.toLowerCase() !== query.toLowerCase()) {
          const retryRes = await fetch(
            `${TMDB_BASE}/search/multi?query=${encodeURIComponent(correctedQuery)}&api_key=${TMDB_API_KEY}`
          );
          const retryData = await retryRes.json();
          const retryResults = (retryData.results || []).filter(
            (r: any) => r.media_type === "movie" || r.media_type === "tv"
          );

          if (retryResults.length) {
            movieId = retryResults[0].id;
            mediaType = retryResults[0].media_type;
            suggestions = retryResults.slice(0, 3).map((r: any) => ({
              title: r.title || r.name,
              year: (r.release_date || r.first_air_date)?.split("-")[0] || "N/A",
              tmdbId: r.id,
              mediaType: r.media_type,
            }));
          }
        }

        if (!movieId) {
          return new Response(JSON.stringify({ error: "Title not found" }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } else {
        const topResult = results[0];
        movieId = topResult.id;
        mediaType = topResult.media_type;

        const queryLower = query.toLowerCase().trim();
        const topTitle = (topResult.title || topResult.name || "").toLowerCase();
        const exactMatch = topTitle === queryLower;
        if (!exactMatch && results.length > 1) {
          suggestions = results.slice(0, 3).map((r: any) => ({
            title: r.title || r.name,
            year: (r.release_date || r.first_air_date)?.split("-")[0] || "N/A",
            tmdbId: r.id,
            mediaType: r.media_type,
          }));
        }
      }
    }

    // Fetch full details + credits based on media type
    const endpoint = mediaType === "tv" ? "tv" : "movie";
    const [detailsRes, creditsRes] = await Promise.all([
      fetch(`${TMDB_BASE}/${endpoint}/${movieId}?api_key=${TMDB_API_KEY}`),
      fetch(`${TMDB_BASE}/${endpoint}/${movieId}/credits?api_key=${TMDB_API_KEY}`),
    ]);

    const details = await detailsRes.json();
    const credits = await creditsRes.json();

    const title = details.title || details.name || "Unknown";
    const year = (details.release_date || details.first_air_date)?.split("-")[0] || "N/A";
    const genres = details.genres?.map((g: any) => g.name).join(", ") || "N/A";
    const voteAvg = details.vote_average ? details.vote_average.toFixed(1) : "N/A";
    const voteCount = details.vote_count ? details.vote_count.toLocaleString() : "0";
    const posterPath = details.poster_path
      ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
      : null;
    const countries = details.production_countries?.map((c: any) => c.name).join(", ") || 
                      details.origin_country?.join(", ") || "N/A";
    const languages = details.spoken_languages?.map((l: any) => l.english_name).join(", ") || 
                      details.languages?.join(", ") || "N/A";

    // Anime detection: Animation genre + Japanese origin
    const genreNames = (details.genres || []).map((g: any) => g.name.toLowerCase());
    const originCountries = (details.origin_country || details.production_countries?.map((c: any) => c.iso_3166_1) || []);
    const isAnime = genreNames.includes("animation") && originCountries.some((c: string) => c === "JP" || c === "Japan");

    let director: string;
    let actors: string;
    let mainActor: string | undefined;
    let mainActress: string | undefined;
    let runtime: string;
    let boxOffice: string;
    let seasons: string | undefined;
    let episodes: string | undefined;

    const castList = credits.cast || [];
    const topCast = castList.slice(0, 5);
    actors = topCast.map((a: any) => a.name).join(", ") || "Unknown";

    const maleCast = castList.find((a: any) => a.gender === 2)?.name;
    const femaleCast = castList.find((a: any) => a.gender === 1)?.name;
    mainActor = maleCast || topCast[0]?.name;
    mainActress = femaleCast || topCast.find((a: any) => a.name !== mainActor)?.name;

    if (mediaType === "tv") {
      const creators = details.created_by?.map((c: any) => c.name).join(", ") || "Unknown";
      director = creators;
      const epRuntime = details.episode_run_time?.[0];
      runtime = epRuntime ? `${epRuntime} min/ep` : "N/A";
      boxOffice = "N/A";
      seasons = details.number_of_seasons ? `${details.number_of_seasons}` : undefined;
      episodes = details.number_of_episodes ? `${details.number_of_episodes}` : undefined;
    } else {
      // Movie-specific fields
      director = credits.crew?.find((c: any) => c.job === "Director")?.name || "Unknown";
      const runtimeMin = details.runtime;
      runtime = runtimeMin ? `${runtimeMin} min` : "N/A";
      const revenue = details.revenue
        ? `$${(details.revenue / 1_000_000).toFixed(1)}M`
        : "N/A";
      boxOffice = revenue;
    }

    // Fetch streaming/watch providers
    let watchProviders: { id: number; name: string; logo: string | null }[] = [];
    try {
      const wpRes = await fetch(
        `${TMDB_BASE}/${endpoint}/${movieId}/watch/providers?api_key=${TMDB_API_KEY}`
      );
      const wpData = await wpRes.json();
      const regionProviders = wpData.results?.[watchRegion];
      if (regionProviders) {
        const allProviders = [
          ...(regionProviders.flatrate || []),
          ...(regionProviders.rent || []),
          ...(regionProviders.buy || []),
        ];
        const seen = new Set<number>();
        watchProviders = allProviders
          .filter((p: any) => {
            if (seen.has(p.provider_id)) return false;
            seen.add(p.provider_id);
            return true;
          })
          .slice(0, 8)
          .map((p: any) => ({
            id: p.provider_id,
            name: p.provider_name,
            logo: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : null,
          }));
      }
    } catch (wpErr) {
      console.error("Watch providers fetch failed:", wpErr);
    }

    const movie = {
      title,
      year,
      rated: details.adult ? "R" : "PG-13",
      runtime,
      genre: genres,
      director,
      actors,
      actorName: mainActor,
      actressName: mainActress,
      plot: details.overview || "No synopsis available.",
      poster: posterPath,
      imdbRating: voteAvg,
      imdbVotes: voteCount,
      imdbID: details.imdb_id || (mediaType === "tv" ? details.external_ids?.imdb_id : null) || `tmdb-${movieId}`,
      country: countries,
      awards: "N/A",
      language: languages,
      boxOffice,
      trailerUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(
        title + " " + year + " trailer"
      )}`,
      mediaType,
      isAnime,
      seasons,
      episodes,
      watchProviders,
    };

    // Use Hugging Face router with Mistral for sentiment analysis
    const HF_TOKEN = Deno.env.get("HF_TOKEN");
    let sentiment = { classification: "Mixed", summary: "" };

    if (HF_TOKEN) {
      try {
        const typeLabel = isAnime ? "anime" : mediaType === "tv" ? "TV series" : "movie";
        const aiRes = await fetch(
          "https://router.huggingface.co/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${HF_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "mistralai/Mistral-7B-Instruct-v0.2:featherless-ai",
              messages: [
                {
                  role: "system",
                  content:
                    "You are a film/TV critic AI. Analyze audience sentiment. Return a JSON object with exactly two fields: classification (one of: Positive, Mixed, Negative) and summary (a 2-3 sentence analysis of audience reception). Only return the JSON, no other text.",
                },
                {
                  role: "user",
                  content: `Analyze audience sentiment for the ${typeLabel} "${movie.title}" (${movie.year}). Rating: ${movie.imdbRating}/10 from ${movie.imdbVotes} votes. Genre: ${movie.genre}. ${mediaType === "tv" ? `Created by: ${movie.director}. Seasons: ${movie.seasons || "N/A"}.` : `Director: ${movie.director}.`} Plot: ${movie.plot}`,
                },
              ],
            }),
          }
        );

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const content = aiData.choices?.[0]?.message?.content || "";
          const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          const parsed = JSON.parse(jsonStr);
          sentiment = {
            classification: parsed.classification || "Mixed",
            summary: parsed.summary || "",
          };
        }
      } catch (aiErr) {
        console.error("AI analysis failed, using fallback:", aiErr);
      }
    }

    // Fallback if AI didn't produce a summary
    if (!sentiment.summary) {
      const rating = parseFloat(movie.imdbRating) || 5;
      const typeLabel = isAnime ? "anime" : mediaType === "tv" ? "series" : "film";
      if (rating >= 7.5) {
        sentiment = {
          classification: "Positive",
          summary: `With a strong ${movie.imdbRating}/10 rating from ${movie.imdbVotes} votes, audiences have responded very favorably to this ${typeLabel}.`,
        };
      } else if (rating >= 5.5) {
        sentiment = {
          classification: "Mixed",
          summary: `Rated ${movie.imdbRating}/10 by ${movie.imdbVotes} voters, audience reception of this ${typeLabel} has been divided.`,
        };
      } else {
        sentiment = {
          classification: "Negative",
          summary: `With a ${movie.imdbRating}/10 rating from ${movie.imdbVotes} votes, this ${typeLabel} has faced significant audience resistance.`,
        };
      }
    }

    return new Response(JSON.stringify({ movie, sentiment, suggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-movie error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
