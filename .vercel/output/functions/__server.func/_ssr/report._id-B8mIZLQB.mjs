import { J as notFound, _ as createFileRoute, g as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as getSubmission } from "./fit.functions-BjbDqtzX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/report._id-B8mIZLQB.js
var $$splitComponentImporter = () => import("./report._id-D3xPQ9G9.mjs");
var Route = createFileRoute("/report/$id")({
	loader: async ({ params }) => {
		const row = await getSubmission({ data: { id: params.id } });
		if (!row) throw notFound();
		return row;
	},
	head: ({ loaderData }) => {
		const brand = loaderData?.brand_name;
		const title = brand ? `${brand} TikTok Shop Fit Report | Sophie Society` : "TikTok Shop Fit Report | Sophie Society";
		return { meta: [
			{ title },
			{
				name: "description",
				content: "TikTok Shop market opportunity, competitor playbook and a 12-month plan with profitability."
			},
			{
				property: "og:title",
				content: title
			},
			{
				property: "og:description",
				content: "TikTok Shop market opportunity, competitor playbook and a 12-month plan with profitability."
			},
			{
				property: "og:type",
				content: "article"
			},
			{
				name: "twitter:card",
				content: "summary"
			},
			{
				name: "robots",
				content: "noindex"
			}
		] };
	},
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
