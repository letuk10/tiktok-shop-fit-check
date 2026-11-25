import { getVercelOidcToken } from "@vercel/oidc";
import type { Relevance, SearchExpansion } from "./discovery";

// Vercel AI Gateway (OpenAI-compatible). On Vercel the project's OIDC token authenticates
// the call, so no key is stored; AI_GATEWAY_API_KEY is honoured for local runs.
const GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/chat/completions";
const MODEL = process.env["AI_MODEL"] || "anthropic/claude-haiku-5.5";

async function gatewayToken() {
  if (process.env["AI_GATEWAY_API_KEY"]) return process.env["AI_GATEWAY_API_KEY"];
  return getVercelOidcToken();
}

function parseJson<T>(text: string): T {
  try { return JSON.parse(text) as T; } catch { /* fall through */ }
  const start = text.indexOf("{"), end = text.lastIndexOf("}");
  if (start >= 0 && end > start) return JSON.parse(text.slice(start, end + 1)) as T;
  throw new Error("AI response was not JSON");
}

async function jsonCall<T>(name: string, schema: Record<string, unknown>, prompt: string): Promise<T> {
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${await gatewayToken()}` },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0,
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_schema", json_schema: { name, strict: true, schema } },
    }),
    signal: AbortSignal.timeout(45000),
  });
  if (!res.ok) throw new Error(`AI gateway ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json: any = await res.json();
  const text: string = json?.choices?.[0]?.message?.content ?? "";
  return parseJson<T>(text);
}

const expansionSchema = {
  type: "object", additionalProperties: false,
  properties: {
    core: { type: "string" }, variants: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 6 },
    product_type: { type: "string" }, not_competitors: { type: "array", items: { type: "string" } },
  }, required: ["core", "variants", "product_type", "not_competitors"],
};

export async function expandSearch(title: string, keywords: string[]) {
  return jsonCall<SearchExpansion>("search_expansion", expansionSchema, `Return JSON only. Given this product title and keywords, identify directly competing TikTok Shop products. Return: core, the shortest 1 to 2 word term naming the product type or hero ingredient; variants, 4 to 6 short 2 to 3 word shopper and seller search terms with no brand names; product_type, one phrase describing what the product IS and its use; not_competitors, product types sharing words that are not substitutes. Product title: ${title || "unknown"}. Keywords: ${keywords.join(", ")}.`);
}

const classificationSchema = {
  type: "object", additionalProperties: false,
  properties: { products: { type: "array", items: { type: "object", additionalProperties: false, properties: {
    product_id: { type: "string" }, relevance: { type: "string", enum: ["direct", "adjacent", "no"] }, reason: { type: "string" },
  }, required: ["product_id", "relevance", "reason"] } } }, required: ["products"],
};

export async function classifyProducts(products: Record<string, unknown>[], productType: string, notCompetitors: string[]) {
  const result = await jsonCall<{ products: { product_id: string; relevance: Relevance; reason: string }[] }>("relevance_classification", classificationSchema, `Return JSON only. Classify each TikTok Shop product as direct if a shopper would compare it with the partner product, adjacent if it serves the same ingredient or need in a different form or use (including bundles containing a direct product), or no. Give one short reason. Partner product type: ${productType}. Not competitors: ${notCompetitors.join(", ") || "none supplied"}. Products: ${JSON.stringify(products)}`);
  return result.products;
}
