import { a as numberType, c as stringType, i as enumType, l as unionType, n as arrayType, o as objectType, r as booleanType, s as recordType, t as anyType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/qualification-DCEdAUKe.js
var text = stringType().trim().min(1).max(200);
var email = stringType().trim().email().max(200);
var positive = numberType().finite().positive();
var nonnegative = numberType().finite().min(0);
var lookup = objectType({
	title: stringType(),
	brand: stringType(),
	image: stringType(),
	price: positive,
	lengthIn: nonnegative,
	widthIn: nonnegative,
	heightIn: nonnegative,
	weightLb: nonnegative,
	cogs: nonnegative.optional(),
	monthlyRevenue: nonnegative.optional(),
	keywords: arrayType(stringType()).optional(),
	categoryPath: arrayType(stringType()).optional(),
	fbaPickAndPackFee: nonnegative.optional(),
	monthlySold: nonnegative.optional(),
	provider: enumType(["hub", "keepa"])
});
var marketEntrySchema = objectType({
	brand: text,
	product: stringType().trim().min(1).max(2e3),
	asin: stringType().max(10),
	keywords: arrayType(text).min(1).max(8),
	price: positive,
	lookup: lookup.optional()
});
var product = objectType({
	name: text,
	price: positive,
	cogs: nonnegative,
	weight: positive,
	length: positive,
	width: positive,
	height: positive
});
function qualificationReady(step, value) {
	const state = objectType({
		role: stringType().nullable().optional(),
		submitter_name: stringType().nullable().optional(),
		submitter_email: stringType().nullable().optional(),
		client_name: stringType().nullable().optional(),
		client_email: stringType().nullable().optional(),
		branch: stringType().nullable().optional(),
		answers: recordType(anyType()),
		products: arrayType(anyType()),
		assumptions: recordType(anyType())
	}).safeParse(value);
	if (!state.success) return false;
	const s = state.data, a = s.answers;
	if (step === 1) return enumType([
		"client",
		"pod_leader",
		"sales_exec"
	]).safeParse(s.role).success && text.safeParse(s.submitter_name).success && email.safeParse(s.submitter_email).success && (s.role === "client" || text.safeParse(s.client_name).success && email.safeParse(s.client_email).success);
	if (step === 2) {
		if (s.branch === "launch") return objectType({
			usSeller: enumType([
				"yes",
				"no",
				"progress"
			]),
			dtc: unionType([text, arrayType(text).min(1)]),
			commitSamples: booleanType(),
			commitAds: booleanType()
		}).safeParse(a).success;
		if (s.branch === "optimize") return objectType({
			shopName: text,
			shopId: text,
			runsIt: enumType([
				"inhouse",
				"agency",
				"nobody"
			]),
			samplesNow: nonnegative,
			gmvMax: booleanType(),
			probation: enumType([
				"yes",
				"no",
				"unsure"
			]),
			fulfillment: enumType([
				"fbt",
				"own",
				"mcf"
			]),
			challenge: text
		}).safeParse(a).success && (!a["gmvMax"] || positive.safeParse(a["gmvMaxDaily"]).success);
		return false;
	}
	if (step === 3) return arrayType(product).min(1).max(3).safeParse(s.products).success && text.safeParse(a["amazonRevenue"]).success && text.safeParse(a["dtcRevenue"]).success && numberType().int().positive().safeParse(a["catalogSize"]).success;
	if (step === 4) return nonnegative.safeParse(s.assumptions["ownCost"]).success;
	return true;
}
var validVideoId = (id) => /^\d{10,30}$/.test(id);
var hasZeroCommission = (values) => values.some((v) => v === 0);
//#endregion
export { validVideoId as i, marketEntrySchema as n, qualificationReady as r, hasZeroCommission as t };
