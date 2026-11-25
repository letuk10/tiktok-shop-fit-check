import { i as __toESM } from "../_runtime.mjs";
import { g as parseAsins } from "./calc-BRdncDBi.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as Note, i as GhostBtn, m as useServerFn, r as Field, s as PrimaryBtn, u as TextInput } from "./ui-2b07_hmL.mjs";
import { n as marketEntrySchema } from "./qualification-DCEdAUKe.mjs";
import { m as lookupAsin, r as createSubmission, v as suggestSearchTerms } from "./fit.functions-BjbDqtzX.mjs";
import { T as ArrowRight, f as Plus, g as LoaderCircle, t as X } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BkqAH5-M.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MarketEntry() {
	const [brand, setBrand] = (0, import_react.useState)("");
	const [product, setProduct] = (0, import_react.useState)("");
	const [keywords, setKeywords] = (0, import_react.useState)([""]);
	const [price, setPrice] = (0, import_react.useState)("");
	const [manual, setManual] = (0, import_react.useState)(false);
	const [lookup, setLookup] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [lookupBusy, setLookupBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const create = useServerFn(createSubmission);
	const lookupFn = useServerFn(lookupAsin);
	const suggest = useServerFn(suggestSearchTerms);
	const nav = useNavigate();
	const asin = parseAsins(product)[0] ?? "";
	const valid = marketEntrySchema.safeParse({
		brand,
		product,
		asin,
		keywords,
		price: price ? Number(price) : void 0,
		lookup: lookup ?? void 0
	}).success;
	async function findAmazon() {
		if (!asin || lookupBusy) return;
		setLookupBusy(true);
		setError("");
		setLookup(null);
		try {
			const result = await lookupFn({ data: { asin } });
			if (!result.ok || !result.product) {
				setError(result.message ?? "Enter the product details manually.");
				setManual(true);
				return;
			}
			const item = result.product;
			setLookup(item);
			setBrand((b) => b || item.brand);
			setPrice(item.price ? String(item.price.toFixed(2)) : "");
			const initial = item.keywords?.length ? item.keywords : [item.title.toLowerCase().split(/\s+/).slice(0, 5).join(" ")];
			const expanded = await suggest({ data: {
				title: item.title,
				keywords: initial
			} });
			setKeywords(expanded.terms);
			setManual(false);
		} catch {
			setError("We could not retrieve this Amazon listing. Enter the details manually.");
			setManual(true);
		} finally {
			setLookupBusy(false);
		}
	}
	async function submit(e) {
		e.preventDefault();
		if (!valid || busy) return;
		setBusy(true);
		setError("");
		try {
			const { id } = await create({ data: {
				brand,
				product,
				asin,
				keywords,
				price: Number(price),
				lookup: lookup ?? void 0
			} });
			await nav({
				to: "/fit/$id",
				params: { id }
			});
		} catch {
			setError("We could not start your analysis. Please try again.");
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-2xl px-5 pb-16 pt-8 sm:pt-12",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-3xl sm:text-4xl",
			children: "See your TikTok Shop market"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: submit,
			className: "mt-8 space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Brand name",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
						"aria-label": "Brand name",
						value: brand,
						onChange: (e) => setBrand(e.target.value),
						required: true,
						maxLength: 200
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Paste your Amazon link or ASIN",
					help: "We will look for the title, price, package size and weight.",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2 sm:flex-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							"aria-label": "Amazon link or ASIN",
							value: product,
							onChange: (e) => {
								setProduct(e.target.value);
								setLookup(null);
							},
							required: true
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
							type: "button",
							onClick: findAmazon,
							disabled: !asin || lookupBusy,
							className: "shrink-0",
							children: [lookupBusy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : null, " Get Amazon details"]
						})]
					})
				}),
				lookup && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bento flex gap-4 p-4",
					children: [lookup.image && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: lookup.image,
						alt: "",
						className: "h-24 w-24 rounded object-contain"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-semibold text-navy",
								children: lookup.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-sm",
								children: [
									"$",
									lookup.price.toFixed(2),
									" · from Amazon"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-caption",
								children: [
									"Package: ",
									lookup.lengthIn.toFixed(1),
									" x ",
									lookup.widthIn.toFixed(1),
									" x ",
									lookup.heightIn.toFixed(1),
									" in, ",
									lookup.weightLb.toFixed(2),
									" lb"
								]
							})
						]
					})]
				}),
				lookup && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
					label: "TikTok search terms",
					help: "Edit the terms shoppers would use to find directly competing products.",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: keywords.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-sm",
							children: [k, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": `Remove ${k}`,
								onClick: () => setKeywords(keywords.filter((x) => x !== k)),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3" })
							})]
						}, k))
					}), keywords.length < 8 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TermAdder, { onAdd: (term) => setKeywords([.../* @__PURE__ */ new Set([...keywords, term])]) })]
				}),
				!lookup && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "text-sm font-semibold text-signal underline",
					onClick: () => setManual(!manual),
					children: "No Amazon listing? Enter it manually"
				}),
				manual && !lookup && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-6 border-t border-border pt-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Product name",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								"aria-label": "Product name",
								value: product,
								onChange: (e) => setProduct(e.target.value),
								required: true
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "TikTok search keywords",
							help: "Use short shopper terms, such as beef tallow or sewing kit.",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [keywords.map((k, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									"aria-label": `Keyword ${i + 1}`,
									required: true,
									value: k,
									onChange: (e) => setKeywords(keywords.map((v, j) => i === j ? e.target.value : v)),
									maxLength: 200
								}, i)), keywords.length < 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
									type: "button",
									onClick: () => setKeywords([...keywords, ""]),
									className: "h-9 px-3 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add keyword"]
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Your price ($)",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								"aria-label": "Your price",
								required: true,
								type: "number",
								min: "0.01",
								step: "any",
								inputMode: "decimal",
								value: price,
								onChange: (e) => setPrice(e.target.value)
							})
						})
					]
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, { children: error }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PrimaryBtn, {
					type: "submit",
					disabled: !valid || busy,
					className: "h-14 w-full text-base",
					children: [
						busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin" }) : null,
						" Analyze my market ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-5 w-5" })
					]
				})
			]
		})]
	});
}
function TermAdder({ onAdd }) {
	const [term, setTerm] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
			"aria-label": "Add search term",
			value: term,
			onChange: (e) => setTerm(e.target.value),
			placeholder: "Add a term"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
			type: "button",
			disabled: !term.trim(),
			onClick: () => {
				onAdd(term.trim().toLowerCase());
				setTerm("");
			},
			children: "Add"
		})]
	});
}
var SplitComponent = MarketEntry;
//#endregion
export { SplitComponent as component };
