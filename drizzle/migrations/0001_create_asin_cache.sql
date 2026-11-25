CREATE TABLE public.asin_cache (
  asin TEXT PRIMARY KEY,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  payload JSONB NOT NULL
);
GRANT ALL ON public.asin_cache TO service_role;
ALTER TABLE public.asin_cache ENABLE ROW LEVEL SECURITY;