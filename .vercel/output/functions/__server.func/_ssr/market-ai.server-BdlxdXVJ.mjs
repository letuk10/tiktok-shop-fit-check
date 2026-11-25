import { t as require_dist } from "../_libs/jose+vercel__oidc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/market-ai.server-BdlxdXVJ.js
var import_dist = require_dist();
var GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/chat/completions";
var MODEL = process.env["AI_MODEL"] || "anthropic/claude-haiku-5.5";
async function gatewayToken() {
	if (process.env["AI_GATEWAY_API_KEY"]) return process.env["AI_GATEWAY_API_KEY"];
	return (0, import_dist.getVercelOidcToken)();
}
function parseJson(text) {
	try {
		return JSON.parse(text);
	} catch {}
	const start = text.indexOf("{"), end = text.lastIndexOf("}");
	if (start >= 0 && end > start) return JSON.parse(text.slice(start, end + 1));
	throw new Error("AI response was not JSON");
}
async function jsonCall(name, schema, prompt) {
	const res = await fetch(GATEWAY_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${await gatewayToken()}`
		},
		body: JSON.stringify({
			model: MODEL,
			temperature: 0,
			max_tokens: 8e3,
			messages: [{
				role: "user",
				content: prompt
			}],
			response_format: {
				type: "json_schema",
				json_schema: {
					name,
					strict: true,
					schema
				}
			}
		}),
		signal: AbortSignal.timeout(45e3)
	});
	if (!res.ok) throw new Error(`AI gateway ${res.status}: ${(await res.text()).slice(0, 200)}`);
	return parseJson((await res.json())?.choices?.[0]?.message?.content ?? "");
}
var expansionSchema = {
	type: "object",
	additionalProperties: false,
	properties: {
		core: { type: "string" },
		variants: {
			type: "array",
			items: { type: "string" },
			minItems: 4,
			maxItems: 6
		},
		product_type: { type: "string" },
		not_competitors: {
			type: "array",
			items: { type: "string" }
		}
	},
	required: [
		"core",
		"variants",
		"product_type",
		"not_competitors"
	]
};
async function expandSearch(title, keywords) {
	return jsonCall("search_expansion", expansionSchema, `Return JSON only. Given this product title and keywords, identify directly competing TikTok Shop products. Return: core, the shortest 1 to 2 word term naming the product type or hero ingredient; variants, 4 to 6 short 2 to 3 word shopper and seller search terms with no brand names; product_type, one phrase describing what the product IS and its use; not_competitors, product types sharing words that are not substitutes. Product title: ${title || "unknown"}. Keywords: ${keywords.join(", ")}.`);
}
var classificationSchema = {
	type: "object",
	additionalProperties: false,
	properties: { products: {
		type: "array",
		items: {
			type: "object",
			additionalProperties: false,
			properties: {
				product_id: { type: "string" },
				relevance: {
					type: "string",
					enum: [
						"direct",
						"adjacent",
						"no"
					]
				},
				reason: { type: "string" }
			},
			required: [
				"product_id",
				"relevance",
				"reason"
			]
		}
	} },
	required: ["products"]
};
async function classifyProducts(products, productType, notCompetitors) {
	return (await jsonCall("relevance_classification", classificationSchema, `Return JSON only. Classify each TikTok Shop product as direct if a shopper would compare it with the partner product, adjacent if it serves the same ingredient or need in a different form or use (including bundles containing a direct product), or no. Give one short reason. Partner product type: ${productType}. Not competitors: ${notCompetitors.join(", ") || "none supplied"}. Products: ${JSON.stringify(products)}`)).products;
}
//#endregion
export { classifyProducts, expandSearch };
