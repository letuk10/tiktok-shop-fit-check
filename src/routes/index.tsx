import { createFileRoute } from "@tanstack/react-router";
import { MarketEntry } from "@/components/fit/market-entry";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TikTok Shop Fit Check by Sophie Society" },
      { name: "description", content: "Check if your brand fits TikTok Shop, see live market data and get a 6-month launch plan in under 5 minutes." },
      { property: "og:title", content: "TikTok Shop Fit Check by Sophie Society" },
      { property: "og:description", content: "Unit economics, fulfillment, live market data and a 6-month plan in under 5 minutes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MarketEntry,
});

