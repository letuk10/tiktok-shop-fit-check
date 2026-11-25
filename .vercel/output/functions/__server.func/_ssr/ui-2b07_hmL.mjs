import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { W as isRedirect, x as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ui-2b07_hmL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useServerFn(serverFn) {
	const router = useRouter();
	return import_react.useCallback(async (...args) => {
		try {
			const res = await serverFn(...args);
			if (isRedirect(res)) throw res;
			return res;
		} catch (err) {
			if (isRedirect(err)) {
				err.options._fromLocation = router.stores.location.get();
				return router.navigate(router.resolveRedirect(err).options);
			}
			throw err;
		}
	}, [router, serverFn]);
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function Eyebrow({ children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("eyebrow", className),
		children
	});
}
function Field({ label, help, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "group",
		"aria-label": label,
		className: "block space-y-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block text-sm font-semibold text-navy",
				children: label
			}),
			children,
			help && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block text-xs text-caption",
				children: help
			})
		]
	});
}
var inputCls = "h-12 w-full rounded-xl border border-border bg-background px-4 text-base text-navy outline-none transition focus:border-signal focus:ring-2 focus:ring-signal/20";
function TextInput(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		...props,
		className: cn(inputCls, props.className)
	});
}
function NumInput({ value, onChange, prefix, suffix, step = "any", def }) {
	const [text, setText] = (0, import_react.useState)(value === void 0 || !Number.isFinite(value) ? "" : String(value));
	(0, import_react.useEffect)(() => {
		if (text === "" || Number(text) !== value) setText(value === void 0 || !Number.isFinite(value) ? "" : String(value));
	}, [value]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [
			prefix && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-caption",
				children: prefix
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "number",
				required: true,
				min: "0",
				inputMode: "decimal",
				step,
				value: text,
				onFocus: (e) => e.currentTarget.select(),
				onChange: (e) => {
					setText(e.target.value);
					if (e.target.value === "") onChange(NaN);
					if (e.target.value !== "" && !isNaN(Number(e.target.value))) onChange(Number(e.target.value));
				},
				onBlur: () => {
					if (text === "" && def !== void 0) {
						setText(String(def));
						onChange(def);
					}
				},
				className: cn(inputCls, prefix && "pl-8", (suffix || def !== void 0) && "pr-24")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-caption",
				children: [suffix, def !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "ml-1",
					children: ["default ", def]
				})]
			})
		]
	});
}
function SelectInput({ value, onChange, options }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
		value: value ?? "",
		onChange: (e) => onChange(e.target.value),
		className: inputCls,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
			value: "",
			disabled: true,
			children: "Select"
		}), options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
			value: o.value,
			children: o.label
		}, o.value))]
	});
}
function Choice({ value, onChange, options, cols = 3, size = "md" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("grid gap-3", cols === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"),
		children: options.map((o) => {
			const active = value === o.value;
			const Icon = o.icon;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => onChange(o.value),
				className: cn("bento text-left transition hover:border-signal", size === "lg" ? "p-6" : "px-4 py-3", active && "border-signal bg-signal/5 ring-2 ring-signal/20"),
				children: [
					Icon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
						className: cn("mb-3 h-6 w-6", active ? "text-signal" : "text-caption"),
						strokeWidth: 1.5
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("font-semibold text-navy", size === "lg" && "text-lg"),
						children: o.label
					}),
					o.desc && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1 text-sm text-caption",
						children: o.desc
					})
				]
			}, o.value);
		})
	});
}
function YesNo({ value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
		cols: 2,
		value: value === void 0 ? void 0 : value ? "yes" : "no",
		onChange: (v) => onChange(v === "yes"),
		options: [{
			value: "yes",
			label: "Yes"
		}, {
			value: "no",
			label: "No"
		}]
	});
}
var toneCls = {
	good: "border-growth/60 bg-growth/10",
	neutral: "border-gold/60 bg-gold/10",
	warn: "border-drive/60 bg-drive/10",
	plain: "",
	dark: "border-navy bg-navy text-primary-foreground"
};
function Stat({ label, value, sub, tone = "plain" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("bento p-5", toneCls[tone]),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("eyebrow", tone === "dark" && "text-primary-foreground/70"),
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("mt-2 text-2xl font-bold tracking-tight sm:text-3xl", tone === "dark" ? "text-primary-foreground" : "text-navy"),
				children: value
			}),
			sub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("mt-1 text-xs", tone === "dark" ? "text-primary-foreground/70" : "text-caption"),
				children: sub
			})
		]
	});
}
function Note({ children, tone = "plain" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("bento bg-cream p-4 text-sm", tone !== "plain" && toneCls[tone]),
		children
	});
}
function VerdictBadge({ verdict, large }) {
	if (!verdict) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-xs text-caption",
		children: "Pending"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full font-bold uppercase tracking-wider", large ? "px-4 py-1.5 text-sm" : "px-2.5 py-0.5 text-[11px]", {
			green: "bg-growth text-navy",
			yellow: "bg-gold text-navy",
			red: "bg-drive text-primary-foreground"
		}[verdict]),
		children: verdict
	});
}
function PrimaryBtn(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		...props,
		className: cn("inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-navy px-6 font-semibold text-primary-foreground transition hover:bg-navy/90 disabled:opacity-50", props.className)
	});
}
function GhostBtn(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		...props,
		className: cn("inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 font-semibold text-navy transition hover:border-signal disabled:opacity-50", props.className)
	});
}
//#endregion
export { Note as a, SelectInput as c, VerdictBadge as d, YesNo as f, GhostBtn as i, Stat as l, useServerFn as m, Eyebrow as n, NumInput as o, cn as p, Field as r, PrimaryBtn as s, Choice as t, TextInput as u };
