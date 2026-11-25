//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-ggfmoDSp.js
var manifest = {
	"03abfe2d5d455695d33c37fbaed64d1c9e2ecfd877c0a0ebdbb5ac35e37cd0c5": {
		functionName: "listSubmissions_createServerFn_handler",
		importer: () => import("./_ssr/fit.functions-B80Zwf-A.mjs")
	},
	"1adf66312ce9c809661275bb5d83a2911a5149b1bac5a1bb71d552d875719724": {
		functionName: "createSubmission_createServerFn_handler",
		importer: () => import("./_ssr/fit.functions-B80Zwf-A.mjs")
	},
	"2a8b831515b68ca15cf637486418fb45780e1ec893df5d89ff6eaaef5d9d32cd": {
		functionName: "runMarketScan_createServerFn_handler",
		importer: () => import("./_ssr/fit.functions-B80Zwf-A.mjs")
	},
	"2fd6922b5155fa935ba00b6f468ab67caf5c64f9c3a738e9b878b5f4cc6c4048": {
		functionName: "adjustTeamAssumptions_createServerFn_handler",
		importer: () => import("./_ssr/fit.functions-B80Zwf-A.mjs")
	},
	"9d5da3fc8f3c46c723516485143d1b5f6a953611faf68f05639f6add17315f22": {
		functionName: "checkPasscode_createServerFn_handler",
		importer: () => import("./_ssr/fit.functions-B80Zwf-A.mjs")
	},
	"a70a2b836161e5de7f3550d2af70fa27c398faf92d4c0596b5c39e2ef5bf58e3": {
		functionName: "getTeamVerdict_createServerFn_handler",
		importer: () => import("./_ssr/fit.functions-B80Zwf-A.mjs")
	},
	"a88b5d81bb871d1dd89bc1510fc872b9c5e5d566853d75bc1356c3c51793365f": {
		functionName: "getSubmission_createServerFn_handler",
		importer: () => import("./_ssr/fit.functions-B80Zwf-A.mjs")
	},
	"acfc2cd5c77d07a665be812a6f3b209a154414616ce53481e6bc7c64bc8ff352": {
		functionName: "kalodata_createServerFn_handler",
		importer: () => import("./_ssr/fit.functions-B80Zwf-A.mjs")
	},
	"b072d317b10f32f581418b9cb579fe770d3ecb5ac802c250132756ad96fb40c9": {
		functionName: "suggestSearchTerms_createServerFn_handler",
		importer: () => import("./_ssr/fit.functions-B80Zwf-A.mjs")
	},
	"b2e3bc252f3160f46d9970122e7e015e6967b7f9e7cd12c923282361c378da78": {
		functionName: "saveSubmission_createServerFn_handler",
		importer: () => import("./_ssr/fit.functions-B80Zwf-A.mjs")
	},
	"b59d4122e1f2df679d652180e7726fba65e997a6f8a94b16de4f57c02190723b": {
		functionName: "enrichMarketProduct_createServerFn_handler",
		importer: () => import("./_ssr/fit.functions-B80Zwf-A.mjs")
	},
	"b7e55d1c2de64c2b979f3fcae6ac62a1098bbc112c7f80eef9ff3bad29707b5a": {
		functionName: "addMarketCompetitor_createServerFn_handler",
		importer: () => import("./_ssr/fit.functions-B80Zwf-A.mjs")
	},
	"befc3d4c386bf0e4b7be30f61e242b1265b109d749744b2b79a736fdd2e7eda7": {
		functionName: "enrichCategory_createServerFn_handler",
		importer: () => import("./_ssr/fit.functions-B80Zwf-A.mjs")
	},
	"cd67778c097dd8448b2e18983f35ee51b80a7f9a942e7dd7b3278c1495dcae9a": {
		functionName: "findMarketCompetitors_createServerFn_handler",
		importer: () => import("./_ssr/fit.functions-B80Zwf-A.mjs")
	},
	"d17f990034b5af60dd156fd1c0aa09effe5ec8812d2d2b2d6c377988130d6bc4": {
		functionName: "findOwnProducts_createServerFn_handler",
		importer: () => import("./_ssr/fit.functions-B80Zwf-A.mjs")
	},
	"e362339c7c16fc9a913d9dcbeb3135a5ff8c6a1d22902c0379b43f30e79abc0c": {
		functionName: "lookupAsin_createServerFn_handler",
		importer: () => import("./_ssr/fit.functions-B80Zwf-A.mjs")
	},
	"ef0aecf63dff727bb39afc7a90f35e55f334e80fa6ee918bbe25690f2d66f871": {
		functionName: "editMarketKeywords_createServerFn_handler",
		importer: () => import("./_ssr/fit.functions-B80Zwf-A.mjs")
	},
	"f8acb4475eb85e638608c622255ee0472d1fba7b5380afb40eb77d70a4e8710f": {
		functionName: "refreshTeamData_createServerFn_handler",
		importer: () => import("./_ssr/fit.functions-B80Zwf-A.mjs")
	},
	"fcd8f12044e2be5b2823226aeeb65ec37646e0cf0df363e0870230f5cd360b58": {
		functionName: "editMarketTerms_createServerFn_handler",
		importer: () => import("./_ssr/fit.functions-B80Zwf-A.mjs")
	}
};
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ??= await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };
