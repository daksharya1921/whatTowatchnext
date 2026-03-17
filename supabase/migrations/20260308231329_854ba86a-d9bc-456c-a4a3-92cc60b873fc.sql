
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON public.watchlist (user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_imdb_id ON public.watchlist (imdb_id);
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON public.search_history (user_id);
CREATE INDEX IF NOT EXISTS idx_streaming_clicks_imdb_id ON public.streaming_clicks (imdb_id);
CREATE INDEX IF NOT EXISTS idx_streaming_clicks_provider ON public.streaming_clicks (provider_name);
