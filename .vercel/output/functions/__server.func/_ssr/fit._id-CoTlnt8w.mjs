import { J as notFound, _ as createFileRoute, g as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as getSubmission } from "./fit.functions-BjbDqtzX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/fit._id-CoTlnt8w.js
var $$splitComponentImporter = () => import("./fit._id-foLyeaaD.mjs");
var Route = createFileRoute("/fit/$id")({
	loader: async ({ params }) => {
		const row = await getSubmission({ data: { id: params.id } });
		if (!row) throw notFound();
		return row;
	},
	head: () => ({ meta: [
		{ title: "Fit Check in progress | Sophie Society" },
		{
			name: "description",
			content: "Your TikTok Shop Fit Check by Sophie Society."
		},
		{
			property: "og:title",
			content: "TikTok Shop Fit Check"
		},
		{
			property: "og:description",
			content: "Your TikTok Shop Fit Check by Sophie Society."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
