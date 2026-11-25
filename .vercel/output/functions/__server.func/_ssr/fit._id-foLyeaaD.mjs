import { i as __toESM } from "../_runtime.mjs";
import { C as usd, S as toNum, c as competitorInsights, l as computeAll, r as REVENUE_BUCKETS, t as DEFAULT_ASSUMPTIONS, u as emptyProduct, v as productKey, x as selectedCompetitors } from "./calc-BRdncDBi.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as Note, c as SelectInput, f as YesNo, i as GhostBtn, m as useServerFn, n as Eyebrow, o as NumInput, p as cn, r as Field, s as PrimaryBtn, t as Choice, u as TextInput } from "./ui-2b07_hmL.mjs";
import { r as qualificationReady } from "./qualification-DCEdAUKe.mjs";
import { _ as saveSubmission, f as kalodata, g as runMarketScan, i as editMarketKeywords } from "./fit.functions-BjbDqtzX.mjs";
import { t as Route } from "./fit._id-CoTlnt8w.mjs";
import { E as ArrowLeft, S as Check, T as ArrowRight, c as Search, f as Plus, g as LoaderCircle, l as Rocket, n as Users, o as TrendingUp, r as User, s as Trash2, w as Briefcase } from "../_libs/lucide-react.mjs";
import { a as EconomicsCards, d as scenarioOf, i as DialogTitle, l as ScanProgress, n as Dialog, o as FulfillmentSection, r as DialogContent, s as MarketSection, u as Story } from "./scan-progress-DrlhJYYT.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/fit._id-foLyeaaD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function InterestPrompt({ title, children, undecided }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const inline = (0, import_react.useRef)(null);
	const offered = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		const element = inline.current;
		if (!element || !undecided || offered.current) return;
		const observer = new IntersectionObserver((entries) => {
			if (entries.some((e) => e.isIntersecting) && !offered.current) {
				offered.current = true;
				setOpen(true);
				observer.disconnect();
			}
		}, { threshold: .35 });
		observer.observe(element);
		return () => observer.disconnect();
	}, [undecided]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: inline,
		id: "interest-gate",
		className: "space-y-5 border-y border-signal bg-cloud/50 p-6 sm:p-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-2xl",
				children: title
			}),
			children,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
				className: "h-9 text-sm",
				onClick: () => setOpen(true),
				children: "Open in popup"
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			"aria-describedby": void 0,
			className: "w-[calc(100%-2rem)] max-w-2xl max-h-[85dvh] overflow-y-auto rounded-lg p-6 sm:p-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
				className: "pr-5 text-left text-2xl leading-snug",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-5",
				children
			})]
		})
	})] });
}
var STEPS = [
	"1 Market",
	"2 Your plan",
	"3 Report"
];
var BUCKETS = REVENUE_BUCKETS.map((b) => ({
	value: b,
	label: b
}));
function Wizard() {
	const row = Route.useLoaderData();
	const { id } = Route.useParams();
	const nav = useNavigate();
	const save = useServerFn(saveSubmission);
	const [step, setStep] = (0, import_react.useState)(row.answers?.flowVersion === 2 ? Math.min(row.answers?.flowStep ?? row.step_reached ?? 0, 5) : 0);
	const [declining, setDeclining] = (0, import_react.useState)(false);
	const [ended, setEnded] = (0, import_react.useState)(false);
	const [ownBusy, setOwnBusy] = (0, import_react.useState)(false);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [k, setK] = (0, import_react.useState)(row.kalodata ?? null);
	const [s, setS] = (0, import_react.useState)(() => ({
		role: row.role,
		submitter_name: row.submitter_name ?? "",
		submitter_email: row.submitter_email ?? "",
		client_name: row.client_name ?? "",
		client_email: row.client_email ?? "",
		brand_name: row.brand_name ?? "",
		branch: row.branch,
		answers: {
			fulfillment: "fbt",
			commitSamples: void 0,
			...row.answers ?? {}
		},
		products: row.products?.length ? row.products : [emptyProduct()],
		assumptions: {
			...DEFAULT_ASSUMPTIONS,
			...row.assumptions ?? {}
		}
	}));
	const up = (p) => setS((x) => ({
		...x,
		...p
	}));
	const ans = (p) => setS((x) => ({
		...x,
		answers: {
			...x.answers,
			...p
		}
	}));
	const r = (0, import_react.useMemo)(() => computeAll({
		branch: s.branch,
		answers: s.answers,
		products: s.products,
		assumptions: s.assumptions,
		kalodata: k
	}), [s, k]);
	(0, import_react.useEffect)(() => {
		if (s.answers.shopId) save({ data: {
			id,
			patch: { answers: s.answers }
		} });
	}, [s.answers.shopId]);
	const canNext = qualificationReady(step, s) && !(step === 2 && ownBusy);
	async function persist(nextStep, extra = {}) {
		setSaving(true);
		try {
			await save({ data: {
				id,
				patch: {
					role: s.role,
					submitter_name: s.submitter_name,
					submitter_email: s.submitter_email,
					client_name: s.client_name,
					client_email: s.client_email,
					brand_name: s.brand_name,
					branch: s.branch,
					step_reached: nextStep,
					answers: {
						...s.answers,
						flowVersion: 2,
						flowStep: nextStep,
						...extra
					},
					products: s.products,
					assumptions: s.assumptions
				}
			} });
			return true;
		} catch {
			toast.error("Could not save. Check your connection and try again.");
			return false;
		} finally {
			setSaving(false);
		}
	}
	async function next() {
		if (!canNext || !await persist(step + 1)) return;
		if (step === 5) return nav({
			to: "/report/$id",
			params: { id }
		});
		setStep(step + 1);
		window.scrollTo({ top: 0 });
	}
	async function interest(value) {
		if (!await persist(value === "yes" ? 1 : 0, { interest: value })) return;
		ans({ interest: value });
		if (value === "yes") {
			setStep(1);
			window.scrollTo({ top: 0 });
		} else setDeclining(true);
	}
	async function finish() {
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.submitter_email)) return;
		if (await persist(0, { interest: "no" })) {
			setEnded(true);
			setDeclining(false);
		}
	}
	if (ended) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-2xl space-y-6 px-5 py-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eyebrow, { children: "Your market report" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "text-3xl",
				children: [
					"Thank you, ",
					s.brand_name || "you're all set",
					"."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Your market report is ready whenever you need it." }),
			s.submitter_email && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-caption",
				children: "Your email is saved with this report."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/report/$id",
				params: { id },
				className: "font-semibold text-signal",
				children: ["View your market report ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "inline h-4 w-4" })]
			})
		]
	});
	const gate = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InterestPrompt, {
		undecided: !s.answers.interest,
		title: `Want Sophie Society to launch or scale ${s.brand_name || "your brand"} on TikTok Shop?`,
		children: declining ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Email for your market report",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					"aria-label": "Market report email",
					type: "email",
					value: s.submitter_email,
					onChange: (e) => up({ submitter_email: e.target.value })
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrimaryBtn, {
					onClick: finish,
					disabled: saving || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.submitter_email),
					children: "Finish"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
					onClick: () => setDeclining(false),
					children: "Back"
				})]
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PrimaryBtn, {
				onClick: () => interest("yes"),
				disabled: saving,
				children: ["Yes, show me my plan ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
				onClick: () => interest("no"),
				disabled: saving,
				children: "Not right now"
			})]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("mx-auto max-w-5xl px-5", step === 0 ? "pb-40" : "pb-16"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
				step,
				onJump: (i) => {
					setStep(i);
					setDeclining(false);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-10",
				children: [
					step === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepMarket, {
						id,
						s,
						k,
						setK,
						r,
						persist: () => persist(0),
						onKeywords: (keywords) => up({ products: s.products.map((p, i) => i === 0 ? {
							...p,
							keywords
						} : p) }),
						ans,
						afterShare: gate
					}),
					step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepWho, {
						s,
						up
					}),
					step === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepShop, {
						s,
						up,
						ans
					}), s.branch === "optimize" && s.answers.shopId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanProgress, {
						id,
						k,
						answers: s.answers,
						own: true,
						onData: setK,
						onBusy: setOwnBusy
					})] }),
					step === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(StepWrap, {
						eyebrow: "Your plan",
						title: "Product economics",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepBrand, {
							s,
							up,
							ans
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EconomicsCards, {
							r,
							products: s.products
						})]
					}),
					step === 4 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(StepWrap, {
						eyebrow: "Your plan",
						title: "Fulfillment comparison",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Own / 3PL cost per order",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumInput, {
								prefix: "$",
								value: s.assumptions.ownCost,
								onChange: (ownCost) => up({ assumptions: {
									...s.assumptions,
									ownCost
								} })
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FulfillmentSection, {
							r,
							products: s.products
						})]
					}),
					step === 5 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepWrap, {
						eyebrow: "Your plan",
						title: "Your 12-month plan",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Story, {
							r,
							k,
							answers: s.answers,
							brand: s.brand_name,
							products: s.products,
							earlyCta: true
						})
					})
				]
			}),
			step === 0 && !s.answers.interest && !declining && s.answers.competitorsConfirmed && r.insights.hasData && !selectedCompetitors(k, s.answers).some((p) => !k?.enriched?.[productKey(p)]?.attempted) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StickyPlanCta, {
				brand: s.brand_name,
				gmv: scenarioOf(r)?.rows[11]?.gmv ?? 0,
				disabled: saving,
				onYes: () => interest("yes"),
				onNo: () => {
					interest("no");
					setTimeout(() => document.getElementById("interest-gate")?.scrollIntoView({
						behavior: "smooth",
						block: "center"
					}), 50);
				}
			}),
			step > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "sticky bottom-0 mt-10 flex items-center justify-between gap-3 border-t border-border bg-background/95 py-4 backdrop-blur",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
					onClick: async () => {
						if (await persist(step - 1)) setStep(step - 1);
					},
					disabled: saving,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " Back"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PrimaryBtn, {
					onClick: next,
					disabled: !canNext || saving,
					children: [
						saving ? "Saving..." : step === 5 ? "See your full plan" : "Continue",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })
					]
				})]
			})
		]
	});
}
function StickyPlanCta({ brand, gmv, onYes, onNo, disabled }) {
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setMounted(true), []);
	if (!mounted) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "no-print fixed inset-x-0 bottom-0 z-40 sm:bottom-4 sm:flex sm:justify-center sm:px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3 bg-navy px-5 py-4 text-primary-foreground shadow-lg sm:flex-row sm:items-center sm:gap-5 sm:rounded-full sm:py-3 sm:pl-7 sm:pr-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm font-semibold",
				children: [
					brand || "Your brand",
					" could do ",
					usd(gmv),
					"/month on TikTok Shop by month 12. See your plan"
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onYes,
					disabled,
					className: "rounded-full bg-primary-foreground px-5 py-2 text-sm font-bold text-navy disabled:opacity-50",
					children: "Show me my plan"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onNo,
					disabled,
					className: "text-xs text-primary-foreground/80 underline",
					children: "Not now"
				})]
			})]
		})
	});
}
function Progress({ step, onJump }) {
	const phase = step === 0 ? 0 : 1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pt-2",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-3 gap-4",
			children: STEPS.map((n, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("h-1 rounded-full", i <= phase ? "bg-signal" : "bg-cloud") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
					className: cn("h-auto border-0 bg-transparent px-0 text-xs sm:text-sm", i === phase ? "text-navy" : "text-caption"),
					onClick: () => i === 0 && onJump(0),
					disabled: i > phase,
					children: n
				})]
			}, n))
		})
	});
}
function MultiChoice({ value, onChange, options }) {
	const toggle = (v) => {
		if (v === "none") return onChange(value.includes("none") ? [] : ["none"]);
		const base = value.filter((x) => x !== "none");
		onChange(base.includes(v) ? base.filter((x) => x !== v) : [...base, v]);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-3 sm:grid-cols-5",
		children: options.map((o) => {
			const active = value.includes(o.value);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => toggle(o.value),
				"aria-pressed": active,
				className: cn("bento flex items-center justify-between px-4 py-3 text-left font-semibold text-navy transition hover:border-signal", active && "border-signal bg-signal/5 ring-2 ring-signal/20"),
				children: [o.label, active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4 text-signal" })]
			}, o.value);
		})
	});
}
function StepWrap({ eyebrow, title, sub, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eyebrow, { children: eyebrow }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 text-3xl sm:text-4xl",
				children: title
			}),
			sub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-caption",
				children: sub
			})
		] }), children]
	});
}
function StepWho({ s, up }) {
	const team = s.role === "pod_leader" || s.role === "sales_exec";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(StepWrap, {
		eyebrow: "Your plan",
		title: "About you",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
			size: "lg",
			value: s.role ?? void 0,
			onChange: (role) => up({ role }),
			options: [
				{
					value: "client",
					label: "Partner",
					desc: "I run or own the brand",
					icon: User
				},
				{
					value: "pod_leader",
					label: "Pod Leader",
					desc: "Sophie Society team",
					icon: Users
				},
				{
					value: "sales_exec",
					label: "Brand Strategist",
					desc: "Sophie Society team",
					icon: Briefcase
				}
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-5 sm:grid-cols-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Your name",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
						value: s.submitter_name,
						onChange: (e) => up({ submitter_name: e.target.value })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Your email",
					help: "We send nothing without asking.",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
						type: "email",
						value: s.submitter_email,
						onChange: (e) => up({ submitter_email: e.target.value })
					})
				}),
				team && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Partner contact name",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
						value: s.client_name,
						onChange: (e) => up({ client_name: e.target.value })
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Partner contact email",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
						type: "email",
						value: s.client_email,
						onChange: (e) => up({ client_email: e.target.value })
					})
				})] })
			]
		})]
	});
}
function StepShop({ s, up, ans }) {
	const a = s.answers;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(StepWrap, {
		eyebrow: "Your plan",
		title: "Are you already selling on TikTok Shop?",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
				cols: 2,
				size: "lg",
				value: s.branch ?? void 0,
				onChange: (branch) => up({ branch }),
				options: [{
					value: "optimize",
					label: "Yes",
					desc: "Optimize my existing shop",
					icon: TrendingUp
				}, {
					value: "launch",
					label: "Not yet",
					desc: "Launch a new shop",
					icon: Rocket
				}]
			}),
			s.branch === "optimize" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopFinder, {
						a,
						ans
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Who runs it today?",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
							value: a.runsIt,
							onChange: (runsIt) => ans({ runsIt }),
							options: [
								{
									value: "inhouse",
									label: "In-house"
								},
								{
									value: "agency",
									label: "Another agency"
								},
								{
									value: "nobody",
									label: "Nobody actively"
								}
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-5 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Samples sent per month",
								help: "Free product sent to creators.",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumInput, {
									value: a.samplesNow,
									onChange: (samplesNow) => ans({ samplesNow })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Running GMV Max ads?",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(YesNo, {
									value: a.gmvMax,
									onChange: (gmvMax) => ans({ gmvMax })
								})
							}),
							a.gmvMax && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "GMV Max daily spend",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumInput, {
									prefix: "$",
									value: a.gmvMaxDaily,
									onChange: (gmvMaxDaily) => ans({ gmvMaxDaily })
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "What is your weekly creator outreach limit?",
						help: "Shops on probation are capped at 2,000 outreach messages per week.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
							value: a.probation,
							onChange: (probation) => ans({ probation }),
							options: [
								{
									value: "no",
									label: "Unlimited",
									desc: "No cap on outreach"
								},
								{
									value: "yes",
									label: "Capped at 2,000 / week",
									desc: "Shop on probation"
								},
								{
									value: "unsure",
									label: "I don't know"
								}
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "How do you fulfill today?",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
							value: a.fulfillment,
							onChange: (fulfillment) => ans({ fulfillment }),
							options: [
								{
									value: "fbt",
									label: "FBT"
								},
								{
									value: "own",
									label: "Own warehouse or 3PL"
								},
								{
									value: "mcf",
									label: "Amazon MCF"
								}
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Biggest challenge",
						help: "One line is plenty.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							value: a.challenge ?? "",
							onChange: (e) => ans({ challenge: e.target.value })
						})
					})
				]
			}),
			s.branch === "launch" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Do you have a US TikTok Shop seller account (US business entity)?",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
							value: a.usSeller,
							onChange: (usSeller) => ans({ usSeller }),
							options: [
								{
									value: "yes",
									label: "Yes"
								},
								{
									value: "no",
									label: "No"
								},
								{
									value: "progress",
									label: "In progress"
								}
							]
						})
					}),
					a.usSeller === "no" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, { children: "Sophie can't help set up US entities. You will still get the full market report at the end." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Where do you sell today?",
						help: "Pick all that apply.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MultiChoice, {
							value: Array.isArray(a.dtc) ? a.dtc : a.dtc ? [a.dtc] : [],
							onChange: (dtc) => ans({ dtc }),
							options: [
								{
									value: "amazon",
									label: "Amazon"
								},
								{
									value: "walmart",
									label: "Walmart"
								},
								{
									value: "shopify",
									label: "Shopify"
								},
								{
									value: "other",
									label: "Other"
								},
								{
									value: "none",
									label: "None"
								}
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Can you commit to sending 150+ free samples per month for at least 3 months?",
						help: "Samples to creators are the engine of TikTok Shop. Fewer samples means fewer videos and slower growth.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(YesNo, {
							value: a.commitSamples,
							onChange: (commitSamples) => ans({ commitSamples })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Can you invest about $100/day in TikTok ads once ~100 creator videos are live (around month 3)?",
						help: "Ads amplify the best creator videos and usually unlock the next growth step.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(YesNo, {
							value: a.commitAds,
							onChange: (commitAds) => ans({ commitAds })
						})
					})
				]
			})
		]
	});
}
function ShopFinder({ a, ans }) {
	const search = useServerFn(kalodata);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [results, setResults] = (0, import_react.useState)(null);
	const [err, setErr] = (0, import_react.useState)(null);
	async function find() {
		if (!a.shopName?.trim()) return;
		setBusy(true);
		setErr(null);
		const res = await search({ data: {
			action: "shop_search",
			params: { keyword: a.shopName }
		} });
		setBusy(false);
		if (!res.ok) return setErr(res.error ?? "Search failed");
		setResults(res.data ?? []);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "TikTok Shop name",
				help: "We look it up in TikTok Shop market data.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
						value: a.shopName ?? "",
						onChange: (e) => ans({ shopName: e.target.value }),
						onKeyDown: (e) => e.key === "Enter" && (e.preventDefault(), find())
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
						type: "button",
						onClick: find,
						disabled: busy,
						className: "shrink-0",
						children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4" }), " Find my shop"]
					})]
				})
			}),
			err && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Note, {
				tone: "warn",
				children: [err, " Try again to select your shop."]
			}),
			a.shopPick && !results && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-sm",
				children: ["Selected: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold text-navy",
					children: a.shopPick.shop_name
				})]
			}),
			results && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [results.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm text-caption",
					children: "No shops found. Try a shorter name."
				}), results.map((r) => {
					const active = a.shopId === String(r.shop_id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => ans({
							shopId: String(r.shop_id),
							shopPick: {
								shop_id: String(r.shop_id),
								shop_name: r.shop_name,
								image_url: r.image_url,
								revenue: toNum(r.revenue)
							}
						}),
						className: cn("bento flex items-center gap-3 p-3 text-left hover:border-signal", active && "border-signal ring-2 ring-signal/20"),
						children: [
							r.image_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: r.image_url,
								alt: "",
								className: "h-12 w-12 rounded-lg object-cover"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-12 w-12 rounded-lg bg-cloud" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "truncate font-semibold text-navy",
									children: r.shop_name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-caption",
									children: ["Last 30 days GMV ", usd(toNum(r.revenue))]
								})]
							}),
							active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "ml-auto h-5 w-5 text-signal" })
						]
					}, r.shop_id);
				})]
			})
		]
	});
}
function StepBrand({ s, up, ans }) {
	const a = s.answers;
	const setP = (i, p) => up({ products: s.products.map((x, j) => j === i ? {
		...x,
		...p
	} : x) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Monthly Amazon revenue",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectInput, {
							value: a.amazonRevenue,
							onChange: (amazonRevenue) => ans({ amazonRevenue }),
							options: BUCKETS
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Monthly DTC revenue",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectInput, {
							value: a.dtcRevenue,
							onChange: (dtcRevenue) => ans({ dtcRevenue }),
							options: BUCKETS
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Number of products in catalog",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumInput, {
							value: a.catalogSize,
							onChange: (catalogSize) => ans({ catalogSize })
						})
					})
				]
			}),
			s.products.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, {
				p,
				i,
				set: (x) => setP(i, x),
				canRemove: i > 0,
				askPrice: i > 0 || s.answers.marketPrice === void 0,
				remove: () => up({ products: s.products.filter((_, j) => j !== i) })
			}, i)),
			s.products.length < 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
				onClick: () => up({ products: [...s.products, emptyProduct()] }),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add hero product"]
			})
		]
	});
}
var sProviderNote = (p) => p.weight > 0 && p.length > 0 && p.width > 0 && p.height > 0;
function ProductCard({ p, i, set, remove, canRemove, askPrice }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5 border-y border-border py-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl",
					children: p.name || `Product ${i + 1}`
				}), canRemove && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
					onClick: remove,
					"aria-label": "Remove product",
					className: "h-9 px-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [
					i > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Product name",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							value: p.name,
							onChange: (e) => set({ name: e.target.value })
						})
					}),
					askPrice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Selling price",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumInput, {
							prefix: "$",
							value: p.price || void 0,
							onChange: (price) => set({ price })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "COGS per unit",
						help: "Landed cost of one unit.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumInput, {
							prefix: "$",
							value: p.cogs || void 0,
							onChange: (cogs) => set({ cogs })
						})
					})
				]
			}),
			p.asin && sProviderNote(p) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-caption",
				children: [
					"Package: ",
					p.length.toFixed(1),
					" x ",
					p.width.toFixed(1),
					" x ",
					p.height.toFixed(1),
					" in, ",
					p.weight.toFixed(2),
					" lb, from Amazon. Edit the values below if needed. FBT measures the unit at inbound, so the final fee can differ slightly."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-4 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Weight",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumInput, {
							value: p.weight || void 0,
							onChange: (weight) => set({ weight }),
							suffix: "lb"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Length",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumInput, {
							value: p.length || void 0,
							onChange: (length) => set({ length }),
							suffix: "in"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Width",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumInput, {
							value: p.width || void 0,
							onChange: (width) => set({ width }),
							suffix: "in"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Height",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumInput, {
							value: p.height || void 0,
							onChange: (height) => set({ height }),
							suffix: "in"
						})
					})
				]
			})
		]
	});
}
function StepMarket({ id, s, k, setK, r, persist, ans, afterShare, onKeywords }) {
	const save = useServerFn(saveSubmission), editKeywords = useServerFn(editMarketKeywords);
	const scan = useServerFn(runMarketScan);
	const [busy, setBusy] = (0, import_react.useState)(!k), [enriching, setEnriching] = (0, import_react.useState)(false);
	const started = (0, import_react.useRef)(false);
	const [keywords, setKeywords] = (0, import_react.useState)(s.products[0]?.keywords.join(", ") ?? "");
	const selected = selectedCompetitors(k, s.answers);
	async function editKw(values) {
		await editKeywords({ data: {
			id,
			keywords: values
		} });
		onKeywords(values);
		ans({
			competitorsConfirmed: false,
			excludedProducts: [],
			selectedProducts: void 0
		});
		setKeywords(values.join(", "));
		setBusy(true);
		try {
			setK(await scan({ data: { id } }));
		} catch {
			setK({
				ok: false,
				keywords: [],
				competitors: []
			});
		} finally {
			setBusy(false);
		}
	}
	const pending = selected.some((p) => !k?.enriched?.[productKey(p)]?.attempted);
	async function run() {
		setBusy(true);
		try {
			if (!await persist()) return;
			setK(await scan({ data: { id } }));
		} catch {
			setK({
				ok: false,
				keywords: [],
				competitors: []
			});
		} finally {
			setBusy(false);
		}
	}
	(0, import_react.useEffect)(() => {
		if (!started.current) {
			started.current = true;
			if (!k) run();
		}
	}, []);
	async function selection(a) {
		ans(a);
		await save({ data: {
			id,
			patch: { answers: {
				...s.answers,
				...a
			} }
		} });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(StepWrap, {
		eyebrow: "Your market · last 30 days",
		title: `${s.brand_name || "Your"} TikTok Shop market`,
		children: [k?.fetchedAt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-xs text-caption",
			children: ["Updated ", new Date(k.fetchedAt).toLocaleDateString("en-US")]
		}), busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Note, { children: [
			"Finding competing products for ",
			s.products.flatMap((p) => p.keywords).join(", "),
			". We broaden long keywords automatically, this can take up to a minute."
		] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			s.answers.competitorsConfirmed && pending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanProgress, {
				id,
				k,
				answers: s.answers,
				onData: setK,
				onBusy: setEnriching
			}),
			!enriching && !(s.answers.competitorsConfirmed && pending) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketSection, {
				id,
				r,
				k,
				answers: s.answers,
				onAnswers: selection,
				afterShare,
				onEditKeywords: editKw,
				onMarket: setK
			}),
			(!selected.length || s.answers.competitorsConfirmed && !pending && !competitorInsights(k, s.answers).hasData) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Broader keywords (up to 3)",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
						value: keywords,
						onChange: (e) => setKeywords(e.target.value)
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrimaryBtn, {
					onClick: () => {
						const values = keywords.split(",").map((v) => v.trim()).filter(Boolean).slice(0, 3);
						if (values.length) editKw(values);
					},
					children: "Edit keywords and search"
				})]
			}),
			!k?.ok && !k?.productOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
				onClick: () => void run(),
				children: "Retry market analysis"
			})
		] })]
	});
}
//#endregion
export { Wizard as component };
