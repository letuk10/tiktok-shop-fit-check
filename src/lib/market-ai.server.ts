import { generateResponse, type ResponsesResponse } from "@lovable.dev/ai-gateway";
import type { Relevance, SearchExpansion } from "./discovery";

function responseText(response: ResponsesResponse) {
  const chunks: string[] = [];
  for (const item of response.output ?? []) {
    if (item.type !== "message") continue;
    for (const content of item.content ?? []) if (content.type === "output_text") chunks.push(content.text);
  }
  return chunks.join("").trim();
}

async function jsonCall<T>(name: string, schema: Record<string, unknown>, prompt: string): Promise<T> {
  const response = await generateResponse({
    model: "openai/gpt-6-astra",
    input: prompt,
    reasoning: { effort: "low" },
    text: { format: { type: "json_schema", name, strict: true, schema } },
  });
  return JSON.parse(responseText(response)) as T;
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
