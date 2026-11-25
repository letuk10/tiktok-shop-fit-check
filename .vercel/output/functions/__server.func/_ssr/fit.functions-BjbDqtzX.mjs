import { a as numberType, c as stringType, i as enumType, n as arrayType, o as objectType, r as booleanType, s as recordType, t as anyType } from "../_libs/zod.mjs";
import { n as marketEntrySchema } from "./qualification-DCEdAUKe.mjs";
import { t as getServerFnById } from "../__23tanstack-start-server-fn-resolver-ggfmoDSp.mjs";
import { a as TSS_SERVER_FUNCTION, l as createServerFn } from "./createServerFn-DDDJMFWM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/fit.functions-BjbDqtzX.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var createSubmission = createServerFn({ method: "POST" }).inputValidator((d) => marketEntrySchema.parse(d)).handler(createSsrRpc("1adf66312ce9c809661275bb5d83a2911a5149b1bac5a1bb71d552d875719724"));
var getSubmission = createServerFn({ method: "GET" }).inputValidator((d) => objectType({ id: stringType().uuid() }).parse(d)).handler(createSsrRpc("a88b5d81bb871d1dd89bc1510fc872b9c5e5d566853d75bc1356c3c51793365f"));
var saveSchema = objectType({
	id: stringType().uuid(),
	patch: objectType({
		role: stringType().nullable().optional(),
		submitter_name: stringType().max(200).nullable().optional(),
		submitter_email: stringType().max(200).nullable().optional(),
		client_name: stringType().max(200).nullable().optional(),
		client_email: stringType().max(200).nullable().optional(),
		brand_name: stringType().max(200).nullable().optional(),
		branch: enumType(["launch", "optimize"]).nullable().optional(),
		step_reached: numberType().int().min(0).max(10).optional(),
		answers: recordType(anyType()).optional(),
		products: arrayType(anyType()).max(3).optional(),
		assumptions: recordType(anyType()).optional()
	})
});
var saveSubmission = createServerFn({ method: "POST" }).inputValidator((d) => saveSchema.parse(d)).handler(createSsrRpc("b2e3bc252f3160f46d9970122e7e015e6967b7f9e7cd12c923282361c378da78"));
createServerFn({ method: "POST" }).inputValidator((d) => objectType({ passcode: stringType().max(200) }).parse(d)).handler(createSsrRpc("9d5da3fc8f3c46c723516485143d1b5f6a953611faf68f05639f6add17315f22"));
var getTeamVerdict = createServerFn({ method: "POST" }).inputValidator((d) => objectType({
	id: stringType().uuid(),
	passcode: stringType().max(200)
}).parse(d)).handler(createSsrRpc("a70a2b836161e5de7f3550d2af70fa27c398faf92d4c0596b5c39e2ef5bf58e3"));
var listSubmissions = createServerFn({ method: "POST" }).inputValidator((d) => objectType({ passcode: stringType().max(200) }).parse(d)).handler(createSsrRpc("03abfe2d5d455695d33c37fbaed64d1c9e2ecfd877c0a0ebdbb5ac35e37cd0c5"));
var kalodata = createServerFn({ method: "POST" }).inputValidator((d) => objectType({
	action: enumType([
		"shop_search",
		"shop_detail",
		"product_search"
	]),
	params: objectType({
		keyword: stringType().max(200).optional(),
		shop_id: stringType().max(100).optional()
	})
}).parse(d)).handler(createSsrRpc("acfc2cd5c77d07a665be812a6f3b209a154414616ce53481e6bc7c64bc8ff352"));
var runMarketScan = createServerFn({ method: "POST" }).inputValidator((d) => objectType({ id: stringType().uuid() }).parse(d)).handler(createSsrRpc("2a8b831515b68ca15cf637486418fb45780e1ec893df5d89ff6eaaef5d9d32cd"));
var editMarketTerms = createServerFn({ method: "POST" }).inputValidator((d) => objectType({
	id: stringType().uuid(),
	terms: arrayType(stringType().trim().min(1).max(100)).min(1).max(8)
}).parse(d)).handler(createSsrRpc("fcd8f12044e2be5b2823226aeeb65ec37646e0cf0df363e0870230f5cd360b58"));
var findMarketCompetitors = createServerFn({ method: "POST" }).inputValidator((d) => objectType({
	id: stringType().uuid(),
	query: stringType().trim().min(1).max(200)
}).parse(d)).handler(createSsrRpc("cd67778c097dd8448b2e18983f35ee51b80a7f9a942e7dd7b3278c1495dcae9a"));
var addMarketCompetitor = createServerFn({ method: "POST" }).inputValidator((d) => objectType({
	id: stringType().uuid(),
	productId: stringType().regex(/^\d{8,25}$/)
}).parse(d)).handler(createSsrRpc("b7e55d1c2de64c2b979f3fcae6ac62a1098bbc112c7f80eef9ff3bad29707b5a"));
var enrichCategory = createServerFn({ method: "POST" }).inputValidator((d) => objectType({ id: stringType().uuid() }).parse(d)).handler(createSsrRpc("befc3d4c386bf0e4b7be30f61e242b1265b109d749744b2b79a736fdd2e7eda7"));
var enrichMarketProduct = createServerFn({ method: "POST" }).inputValidator((d) => objectType({
	id: stringType().uuid(),
	productId: stringType().min(1).max(100),
	own: booleanType().optional()
}).parse(d)).handler(createSsrRpc("b59d4122e1f2df679d652180e7726fba65e997a6f8a94b16de4f57c02190723b"));
var findOwnProducts = createServerFn({ method: "POST" }).inputValidator((d) => objectType({
	id: stringType().uuid(),
	shopId: stringType().max(100).optional()
}).parse(d)).handler(createSsrRpc("d17f990034b5af60dd156fd1c0aa09effe5ec8812d2d2b2d6c377988130d6bc4"));
var overrideSchema = objectType({
	postRate: numberType().min(.01).max(1).optional(),
	commission: numberType().min(0).max(100).optional(),
	samples: numberType().int().min(150).max(1e5).optional(),
	roas: numberType().min(0).max(100).optional(),
	guardrailMonth6: numberType().min(0).max(1e7).optional(),
	guardrailMonth12: numberType().min(0).max(1e7).optional()
});
var adjustTeamAssumptions = createServerFn({ method: "POST" }).inputValidator((d) => objectType({
	id: stringType().uuid(),
	passcode: stringType().max(200),
	overrides: overrideSchema
}).parse(d)).handler(createSsrRpc("2fd6922b5155fa935ba00b6f468ab67caf5c64f9c3a738e9b878b5f4cc6c4048"));
var refreshTeamData = createServerFn({ method: "POST" }).inputValidator((d) => objectType({
	id: stringType().uuid(),
	passcode: stringType().max(200)
}).parse(d)).handler(createSsrRpc("f8acb4475eb85e638608c622255ee0472d1fba7b5380afb40eb77d70a4e8710f"));
var editMarketKeywords = createServerFn({ method: "POST" }).inputValidator((d) => objectType({
	id: stringType().uuid(),
	keywords: arrayType(stringType().trim().min(1).max(200)).min(1).max(8)
}).parse(d)).handler(createSsrRpc("ef0aecf63dff727bb39afc7a90f35e55f334e80fa6ee918bbe25690f2d66f871"));
var suggestSearchTerms = createServerFn({ method: "POST" }).inputValidator((d) => objectType({
	title: stringType().max(1e3),
	keywords: arrayType(stringType().max(200)).max(8)
}).parse(d)).handler(createSsrRpc("b072d317b10f32f581418b9cb579fe770d3ecb5ac802c250132756ad96fb40c9"));
var lookupAsin = createServerFn({ method: "POST" }).inputValidator((d) => objectType({ asin: stringType().regex(/^[A-Za-z0-9]{10}$/) }).parse(d)).handler(createSsrRpc("e362339c7c16fc9a913d9dcbeb3135a5ff8c6a1d22902c0379b43f30e79abc0c"));
//#endregion
export { saveSubmission as _, editMarketTerms as a, findMarketCompetitors as c, getTeamVerdict as d, kalodata as f, runMarketScan as g, refreshTeamData as h, editMarketKeywords as i, findOwnProducts as l, lookupAsin as m, adjustTeamAssumptions as n, enrichCategory as o, listSubmissions as p, createSubmission as r, enrichMarketProduct as s, addMarketCompetitor as t, getSubmission as u, suggestSearchTerms as v };
