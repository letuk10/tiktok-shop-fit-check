import { i as __toESM } from "../_runtime.mjs";
import { _ as pct, i as ROLE_LABEL } from "./calc-BRdncDBi.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { d as VerdictBadge, i as GhostBtn, m as useServerFn, n as Eyebrow, p as cn, s as PrimaryBtn, u as TextInput } from "./ui-2b07_hmL.mjs";
import { p as listSubmissions } from "./fit.functions-BjbDqtzX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/team-eYU54pim.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PASS_KEY = "sophie-team-pass";
var ROLE = ROLE_LABEL;
function Team() {
	const list = useServerFn(listSubmissions);
	const [rows, setRows] = (0, import_react.useState)(null);
	const [code, setCode] = (0, import_react.useState)("");
	const [err, setErr] = (0, import_react.useState)(false);
	const [interestFilter, setInterestFilter] = (0, import_react.useState)("all");
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [roleFilter, setRoleFilter] = (0, import_react.useState)("all");
	async function load(pass) {
		const res = await list({ data: { passcode: pass } });
		if (!res.ok) {
			setErr(true);
			sessionStorage.removeItem(PASS_KEY);
			return;
		}
		sessionStorage.setItem(PASS_KEY, pass);
		setRows(res.rows);
	}
	(0, import_react.useEffect)(() => {
		const p = sessionStorage.getItem(PASS_KEY);
		if (p) load(p);
	}, []);
	if (!rows) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-md px-5 py-20",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eyebrow, { children: "Internal" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 text-3xl",
				children: "Team dashboard"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-6 space-y-3",
				onSubmit: (e) => {
					e.preventDefault();
					load(code);
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
						type: "password",
						placeholder: "Team passcode",
						value: code,
						onChange: (e) => setCode(e.target.value)
					}),
					err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-drive",
						children: "Wrong passcode"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrimaryBtn, {
						type: "submit",
						className: "w-full",
						children: "Unlock"
					})
				]
			})
		]
	});
	const shown = rows.filter((r) => (filter === "all" || r.verdict === filter) && (interestFilter === "all" || (r.interest ?? "pending") === interestFilter) && (roleFilter === "all" || r.role === roleFilter));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl space-y-6 px-5 pb-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eyebrow, { children: "Internal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 text-3xl",
					children: "Submissions"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						"all",
						"green",
						"yellow",
						"red"
					].map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
						onClick: () => setFilter(f),
						className: cn("rounded-full border border-border px-4 py-1.5 text-sm font-semibold capitalize", filter === f ? "border-navy bg-navy text-primary-foreground" : "text-navy"),
						children: f
					}, f))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mr-2 text-xs text-caption",
					children: "Interest"
				}), [
					"all",
					"yes",
					"no",
					"pending"
				].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
					onClick: () => setInterestFilter(value),
					"aria-pressed": interestFilter === value,
					className: cn("h-9 px-4 text-sm capitalize", interestFilter === value && "border-navy bg-navy text-primary-foreground"),
					children: value
				}, value))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mr-2 text-xs text-caption",
					children: "Role"
				}), ["all", ...Object.keys(ROLE)].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
					onClick: () => setRoleFilter(value),
					"aria-pressed": roleFilter === value,
					className: cn("h-9 px-4 text-sm", roleFilter === value && "border-navy bg-navy text-primary-foreground"),
					children: value === "all" ? "All" : ROLE[value]
				}, value))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "bento overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[760px] text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
						className: "border-b border-border text-left",
						children: [
							"Brand",
							"Submitted by",
							"Date",
							"Branch",
							"Interest",
							"Verdict",
							"Margin",
							"Amazon rev",
							""
						].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "eyebrow px-4 py-3 font-semibold",
							children: h
						}, h))
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [shown.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						colSpan: 9,
						className: "px-4 py-8 text-center text-caption",
						children: "No submissions yet."
					}) }), shown.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border last:border-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 font-semibold text-navy",
								children: r.brand_name || "Untitled"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-4 py-3",
								children: [r.submitter_name || "n/a", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-caption",
									children: ROLE[r.role ?? ""] ?? ""
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: new Date(r.created_at).toLocaleDateString("en-US")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 capitalize",
								children: r.branch ?? "n/a"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 capitalize",
								children: r.interest ?? "Pending"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VerdictBadge, { verdict: r.verdict })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: r.margin != null ? pct(r.margin) : "n/a"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: r.amazonRevenue ?? "n/a"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/report/$id",
									params: { id: r.id },
									className: "font-semibold text-signal",
									children: "Report"
								})
							})
						]
					}, r.id))] })]
				})
			})
		]
	});
}
//#endregion
export { Team as component };
