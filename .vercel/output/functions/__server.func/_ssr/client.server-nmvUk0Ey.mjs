import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/client.server-nmvUk0Ey.js
function isNewSupabaseApiKey(value) {
	return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}
function createSupabaseFetch(supabaseKey) {
	return (input, init) => {
		const headers = new Headers(typeof Request !== "undefined" && input instanceof Request ? input.headers : void 0);
		if (init?.headers) new Headers(init.headers).forEach((value, key) => headers.set(key, value));
		if (isNewSupabaseApiKey(supabaseKey) && headers.get("Authorization") === `Bearer ${supabaseKey}`) headers.delete("Authorization");
		headers.set("apikey", supabaseKey);
		return fetch(input, {
			...init,
			headers
		});
	};
}
function createSupabaseAdminClient() {
	const SUPABASE_URL = process.env["SUPABASE_URL"];
	const SERVICE_KEY = process.env["SUPABASE_SERVICE_ROLE_KEY"];
	const PUBLISHABLE_KEY = process.env["SUPABASE_PUBLISHABLE_KEY"];
	const APP_DB_SECRET = process.env["APP_DB_SECRET"];
	const key = SERVICE_KEY || PUBLISHABLE_KEY;
	if (!SUPABASE_URL || !key || !SERVICE_KEY && !APP_DB_SECRET) {
		const message = `Missing Supabase environment variable(s): ${[
			...!SUPABASE_URL ? ["SUPABASE_URL"] : [],
			...!key ? ["SUPABASE_PUBLISHABLE_KEY"] : [],
			...!SERVICE_KEY && !APP_DB_SECRET ? ["APP_DB_SECRET"] : []
		].join(", ")}.`;
		console.error(`[Supabase] ${message}`);
		throw new Error(message);
	}
	return createClient(SUPABASE_URL, key, {
		global: {
			fetch: createSupabaseFetch(key),
			headers: !SERVICE_KEY && APP_DB_SECRET ? { "x-app-secret": APP_DB_SECRET } : {}
		},
		auth: {
			storage: void 0,
			persistSession: false,
			autoRefreshToken: false
		}
	});
}
var _supabaseAdmin;
var supabaseAdmin = new Proxy({}, { get(_, prop, receiver) {
	if (!_supabaseAdmin) _supabaseAdmin = createSupabaseAdminClient();
	return Reflect.get(_supabaseAdmin, prop, receiver);
} });
//#endregion
export { supabaseAdmin };
