import { i as __toESM } from "../_runtime.mjs";
import { A as nicheStats, C as usd, D as formatGrowth, F as FBT_FACTS, I as FBT_RATE_CARD, L as fbtFeePanel, O as groupCompetitors, S as toNum, _ as pct, a as SOURCE, b as ratePct, c as competitorInsights, f as marginTone, h as opportunitySignals, j as relevanceOf, m as num, s as candidateProducts, v as productKey, x as selectedCompetitors, y as productMarketStats } from "./calc-BRdncDBi.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as Note, i as GhostBtn, l as Stat, m as useServerFn, n as Eyebrow, p as cn, s as PrimaryBtn, u as TextInput } from "./ui-2b07_hmL.mjs";
import { i as validVideoId, t as hasZeroCommission } from "./qualification-DCEdAUKe.mjs";
import { a as editMarketTerms, c as findMarketCompetitors, l as findOwnProducts, s as enrichMarketProduct, t as addMarketCompetitor } from "./fit.functions-BjbDqtzX.mjs";
import { C as CalendarCheck, S as Check, a as TriangleAlert, g as LoaderCircle, i as Truck, p as Play, t as X, v as CircleCheck, x as ChevronDown } from "../_libs/lucide-react.mjs";
import { a as Line, c as Bar, i as XAxis, l as ResponsiveContainer, n as BarChart, o as CartesianGrid, r as YAxis, s as ReferenceLine, t as ComposedChart, u as Tooltip } from "../_libs/recharts+[...].mjs";
import { a as DialogOverlay$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/scan-progress-DrlhJYYT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-navy/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props
}));
DialogOverlay.displayName = DialogOverlay$1.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	})]
})] }));
DialogContent.displayName = DialogContent$1.displayName;
var DialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className),
	...props
});
DialogHeader.displayName = "DialogHeader";
var DialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
DialogFooter.displayName = "DialogFooter";
var DialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
	ref,
	className: cn("text-lg font-semibold leading-none tracking-tight", className),
	...props
}));
DialogTitle.displayName = DialogTitle$1.displayName;
var DialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
DialogDescription.displayName = DialogDescription$1.displayName;
function SourceLine() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-3 text-xs text-caption",
		children: SOURCE
	});
}
var money = (v) => v === null ? "n/a" : usd(v);
var count = (v) => v === null ? "n/a" : num(v);
var percent = (v) => v === null ? "n/a" : pct(v);
var roas = (v) => v === null ? "n/a" : `${v.toFixed(2)}x`;
function cells(p, capped) {
	return [
		money(p.gmv),
		money(p.price),
		percent(p.commission),
		count(p.affiliates),
		`${count(p.newVideos)}${capped ? "+" : ""}`,
		count(p.videos),
		count(p.lives),
		`${percent(p.videoShare)} / ${percent(p.liveShare)} / ${percent(p.shopShare)}`,
		percent(p.adsShare),
		roas(p.roas),
		money(p.gmvPerAffiliate),
		money(p.robustTrimmedMean),
		percent(p.hitRate)
	];
}
function MarketInsights({ k, answers, parts = [
	"benchmark",
	"videos",
	"creators",
	"ads"
] }) {
	const show = (x) => parts.includes(x);
	const d = competitorInsights(k, answers);
	const [video, setVideo] = (0, import_react.useState)(null);
	if (!d.hasData) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, { children: "Not enough market data for this keyword. Try a broader keyword." });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-10",
		children: [
			d.sellerRunVideoCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Note, { children: [d.sellerRunVideoCount, " seller-run videos were excluded from affiliate creator benchmarks."] }),
			hasZeroCommission([
				...d.products.map((p) => p.commission),
				d.market.commission,
				...d.own.map((p) => p.commission)
			]) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, {
				tone: "neutral",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-start gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-5 w-5 shrink-0" }), " A 0% commission may mean TikTok Shop commission data was retrieved incorrectly. Verify it before using this benchmark."]
				})
			}),
			show("benchmark") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-2xl",
						children: [
							"How the top ",
							d.products.length,
							" products sell on TikTok"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto border-y border-border",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full min-w-[1800px] text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
								className: "border-b border-border text-left",
								children: [
									"Product",
									"30d GMV",
									"Price",
									"Commission",
									"Active affiliates",
									"New videos / month",
									"Videos with views",
									"Lives",
									"GMV: videos / lives / shop tab",
									"Top videos as ads",
									"Ad ROAS",
									"GMV per affiliate",
									"Affiliate GMV per video (trimmed)",
									"Video hit rate"
								].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "eyebrow px-3 py-3",
									children: h
								}, h))
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [
								d.products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-border",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex w-60 items-center gap-3",
											children: [(p.product.master_image_url || p.product.image_url) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
												className: "h-10 w-10 rounded object-cover",
												src: p.product.master_image_url || p.product.image_url,
												alt: ""
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "line-clamp-2",
												children: p.product.product_name
											})]
										})
									}), cells(p, p.capped).map((v, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3",
										children: v
									}, i))]
								}, productKey(p.product))),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "bg-cloud font-semibold text-navy",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3",
										children: "Market average (median)"
									}), cells(d.market).map((v, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3",
										children: v
									}, i))]
								}),
								d.own.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-t border-border bg-growth/10",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "px-3 py-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block font-semibold",
											children: "You vs market average"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "line-clamp-2 w-60",
											children: p.product.product_name
										})]
									}), cells(p, p.capped).map((v, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3",
										children: v
									}, i))]
								}, productKey(p.product)))
							] })]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourceLine, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-caption",
						children: "Counts and rates use medians of available products. Affiliate GMV per video excludes seller-run accounts and removes the top 5% of videos. Hit rate is the share of affiliate videos earning over $500. Video and creator rankings are sampled, not the whole market."
					})
				]
			}),
			show("videos") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-2xl",
						children: "Top 10 videos"
					}),
					d.topVideos.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto border-y border-border",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full min-w-[900px] text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
								className: "border-b border-border text-left",
								children: [
									"Creator",
									"Followers",
									"30d revenue",
									"Views",
									"Type",
									"ROAS",
									"Published",
									""
								].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "eyebrow px-3 py-3",
									children: h
								}, h))
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: d.topVideos.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "px-3 py-3",
										children: ["@", v.belonged_creator_handle]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3",
										children: v.followers === void 0 ? "n/a" : num(Number(v.followers))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3",
										children: usd(Number(v.revenue) || 0)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3",
										children: num(Number(v.views) || 0)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "rounded bg-cloud px-2 py-1 text-xs font-semibold",
											children: Number(v.ad) === 1 ? "Ad" : "Organic"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3",
										children: v.ads_roas === void 0 ? "n/a" : roas(Number(v.ads_roas))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3",
										children: v.publish_date?.split(" ")[0] ?? "n/a"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
											className: "h-9 whitespace-nowrap px-3 text-sm",
											disabled: !validVideoId(String(v.video_id)),
											onClick: () => setVideo({
												id: String(v.video_id),
												handle: v.belonged_creator_handle ?? ""
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-4 w-4" }), " Watch video"]
										})
									})
								]
							}, v.video_id)) })]
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, { children: "Video rankings are unavailable for these products." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourceLine, {})
				]
			}),
			show("creators") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-2xl",
						children: "Creator profile"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: d.creators.leader ? `Most sales come from creators with ${d.creators.leader} followers.` : "Creator profile data is unavailable." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full min-w-[540px] text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
								className: "border-b border-border text-left",
								children: [
									"Followers",
									"Creators",
									"Revenue share",
									...d.own.length ? ["Your creators", "Your revenue share"] : []
								].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "eyebrow p-3",
									children: h
								}, h))
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: d.creators.buckets.map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-3",
										children: b.label
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-3",
										children: b.count
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-3",
										children: pct(b.share)
									}),
									d.own.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-3",
										children: d.ownCreators.buckets[i]?.count ?? 0
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-3",
										children: pct(d.ownCreators.buckets[i]?.share ?? 0)
									})] })
								]
							}, b.label)) })]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm",
						children: [
							"Revenue from videos: ",
							percent(d.creators.videoShare),
							". Lives: ",
							percent(d.creators.liveShare),
							"."
						]
					}),
					d.own.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm",
						children: [
							"You vs market average: videos ",
							percent(d.ownCreators.videoShare),
							", lives ",
							percent(d.ownCreators.liveShare),
							"."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourceLine, {})
				]
			}),
			show("ads") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-2xl",
						children: "Ads"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Top videos running as ads",
								value: percent(d.ads.adsShare)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Revenue-weighted ad ROAS",
								value: roas(d.ads.roas)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Ad revenue ratio",
								value: percent(d.ads.adRevenueRatio)
							})
						]
					}),
					d.own.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm",
						children: [
							"You vs market average: ",
							percent(d.ownAds.adsShare),
							" ad videos, ",
							roas(d.ownAds.roas),
							" ROAS, ",
							percent(d.ownAds.adRevenueRatio),
							" ad revenue ratio."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-caption",
						children: "ROAS is Kalodata's estimate. Ads metrics cover the returned top videos; revenue ratios are revenue-weighted across ad videos."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourceLine, {})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!video,
				onOpenChange: (open) => {
					if (!open) setVideo(null);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-h-[95dvh] max-w-md overflow-y-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["Video by @", video?.handle] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "TikTok Shop competitor video" }),
						video && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
							title: `TikTok video by ${video.handle}`,
							src: `https://www.tiktok.com/player/v1/${video.id}?autoplay=0`,
							allow: "fullscreen; encrypted-media",
							allowFullScreen: true,
							className: "mx-auto aspect-[9/16] max-h-[68dvh] w-full rounded border border-border"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-caption",
							children: [
								"If TikTok cannot play this video here, ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: `https://www.tiktok.com/@${encodeURIComponent(video.handle)}/video/${video.id}`,
									target: "_blank",
									rel: "noreferrer",
									className: "font-semibold text-signal",
									children: "open it on TikTok"
								}),
								"."
							]
						})] })
					]
				})
			})
		]
	});
}
var img = (p) => p.master_image_url || p.image_url;
var marketStats = (k, answers) => productMarketStats(k, answers);
function KeywordLine({ k, onEdit }) {
	const [editing, setEditing] = (0, import_react.useState)(false);
	const info = k?.keywordInfo ?? [];
	const [value, setValue] = (0, import_react.useState)(info.map((i) => i.input).join(", "));
	if (!info.length && !onEdit) return null;
	const submit = (v) => {
		const kws = v.split(",").map((x) => x.trim()).filter(Boolean).slice(0, 3);
		if (kws.length) {
			onEdit?.(kws);
			setEditing(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3 text-sm",
		children: [
			info.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-caption",
				children: [
					"Market based on: ",
					info.map((i, n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						n > 0 && ", ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold text-navy",
							children: i.used
						}),
						i.broadened && ` (broadened from '${i.input}')`
					] }, i.input)),
					onEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [" · ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "font-semibold text-signal underline",
						onClick: () => setEditing((e) => !e),
						children: "Edit keywords"
					})] })
				]
			}),
			onEdit && (editing || !info.length) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex flex-wrap gap-2",
				onSubmit: (e) => {
					e.preventDefault();
					submit(value);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					"aria-label": "Search keywords",
					placeholder: "Up to 3 keywords, comma separated",
					value,
					onChange: (e) => setValue(e.target.value),
					className: "max-w-md"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrimaryBtn, {
					type: "submit",
					children: "Search again"
				})]
			}),
			onEdit && (k?.suggestions?.length ?? 0) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-caption",
					children: "Few products found. Try:"
				}), k?.suggestions?.map((sug) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => onEdit([sug]),
					className: "rounded-full border border-signal px-3 py-1 font-semibold text-navy hover:bg-signal/10",
					children: sug
				}, sug))]
			})
		]
	});
}
function MarketShare({ k, answers }) {
	const stats = marketStats(k, answers);
	const shares = stats.products.slice(0, 10).map((p) => ({
		...p,
		share: stats.gmv ? toNum(p.revenue) / stats.gmv * 100 : 0
	}));
	const others = stats.products.slice(10).reduce((s, p) => s + toNum(p.revenue), 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-xl",
				children: "Market share"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [shares.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-[36px_minmax(0,1fr)_60px] items-center gap-3 sm:grid-cols-[40px_minmax(0,240px)_1fr_64px]",
					children: [
						img(p) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: img(p),
							alt: "",
							className: "h-9 w-9 rounded object-cover"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-9 w-9 rounded bg-cloud" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							title: p.product_name,
							className: "truncate text-sm font-semibold text-navy",
							children: p.product_name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "col-start-2 row-start-auto h-2 bg-cloud sm:col-start-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: cn("h-full", i < 3 ? "bg-navy" : "bg-signal"),
								style: { width: `${p.share}%` }
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "col-start-3 row-start-auto text-right text-xs text-navy sm:col-start-auto",
							children: pct(p.share)
						})
					]
				}, productKey(p))), others > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between border-t border-border pt-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Others" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: pct(stats.gmv ? others / stats.gmv * 100 : 0) })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourceLine, {})
		]
	});
}
function PriceBands({ k, answers, title = "Price bands" }) {
	const prices = marketStats(k, answers).products.map((p) => toNum(p.unit_price)).filter((n) => n > 0);
	const maxPrice = Math.max(...prices, answers.marketPrice ?? 0, 1);
	const bandWidth = Math.ceil(maxPrice / 5 / 5) * 5;
	const bands = Array.from({ length: 5 }, (_, i) => ({
		price: (i + .5) * bandWidth,
		count: prices.filter((p) => p >= i * bandWidth && (i === 4 ? p <= (i + 1) * bandWidth : p < (i + 1) * bandWidth)).length
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-xl",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-64",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
						data: bands,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "price",
								type: "number",
								domain: [0, bandWidth * 5],
								tickFormatter: (v) => usd(v)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
								allowDecimals: false,
								width: 30
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								labelFormatter: (v) => `${usd(Number(v) - bandWidth / 2)} to ${usd(Number(v) + bandWidth / 2)}`,
								formatter: (v) => [v, "Products"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								dataKey: "count",
								fill: "var(--signal)",
								barSize: 40,
								isAnimationActive: false
							}),
							answers.marketPrice !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceLine, {
								x: answers.marketPrice,
								stroke: "var(--navy)",
								strokeWidth: 2,
								label: {
									value: "Your price",
									fill: "var(--navy)",
									position: "insideTopRight"
								}
							})
						]
					})
				})
			}),
			answers.marketPrice !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-caption",
				children: ["Your price: ", usd(answers.marketPrice, 2)]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourceLine, {})
		]
	});
}
function ConfirmCompetitors({ id, k, answers, onAnswers, onEditKeywords, onMarket }) {
	const [tab, setTab] = (0, import_react.useState)("direct");
	const [term, setTerm] = (0, import_react.useState)("");
	const [query, setQuery] = (0, import_react.useState)("");
	const [found, setFound] = (0, import_react.useState)([]);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [message, setMessage] = (0, import_react.useState)("");
	const editTerms = useServerFn(editMarketTerms), find = useServerFn(findMarketCompetitors), add = useServerFn(addMarketCompetitor);
	const pool = k?.pool ?? [];
	const niche = nicheStats(pool, answers.productOverrides);
	const direct = candidateProducts(k, answers).filter((p) => toNum(p.revenue) >= 5e3);
	const adjacent = groupCompetitors(pool.filter((p) => relevanceOf(p, answers.productOverrides) === "adjacent"));
	const irrelevant = groupCompetitors(pool.filter((p) => relevanceOf(p, answers.productOverrides) === "no"));
	const chosen = (answers.selectedProducts ?? selectedCompetitors(k, answers).map(productKey)).filter((key) => direct.some((p) => productKey(p) === key));
	const set = new Set(chosen);
	const selectedGmv = direct.filter((p) => set.has(productKey(p))).reduce((n, p) => n + toNum(p.revenue), 0);
	const toggle = (key) => {
		onAnswers({ selectedProducts: set.has(key) ? chosen.filter((x) => x !== key) : chosen.length < 8 ? [...chosen, key] : chosen });
	};
	const move = (p, relevance) => {
		const overrides = { ...answers.productOverrides ?? {} };
		for (const id of p.listingIds ?? [productKey(p)]) overrides[id] = relevance;
		onAnswers({
			productOverrides: overrides,
			selectedProducts: relevance === "direct" ? chosen : chosen.filter((id) => id !== productKey(p)),
			competitorsConfirmed: false
		});
	};
	async function saveTerms(terms) {
		if (!terms.length || !id || !onMarket) {
			onEditKeywords?.(terms);
			return;
		}
		setBusy(true);
		setMessage("");
		try {
			onMarket(await editTerms({ data: {
				id,
				terms
			} }));
			onAnswers({
				selectedProducts: void 0,
				competitorsConfirmed: false,
				productOverrides: {}
			});
		} catch {
			setMessage("Could not update that search term.");
		} finally {
			setBusy(false);
		}
	}
	async function searchMissing() {
		if (!id || !query.trim()) return;
		setBusy(true);
		setMessage("");
		setFound([]);
		try {
			const result = await find({ data: {
				id,
				query
			} });
			if (result.productId) await addProduct(result.productId);
			else setFound(result.products);
		} catch {
			setMessage("No matching product was found. Try its exact product ID.");
		} finally {
			setBusy(false);
		}
	}
	async function addProduct(productId) {
		if (!id) return;
		const result = await add({ data: {
			id,
			productId
		} });
		onMarket?.(result.k);
		onAnswers(result.answers);
		setFound([]);
		setQuery("");
		setMessage("Competitor added to Direct.");
	}
	const rows = tab === "direct" ? direct : tab === "adjacent" ? adjacent : irrelevant;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl",
					children: "Confirm your competitors"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-caption",
					children: [
						"Pick the products a shopper would compare with yours. Up to ",
						8,
						"."
					]
				})]
			}),
			k?.discovery && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-navy",
					children: [
						"We scanned ",
						k.discovery.totalScanned,
						" products across ",
						k.discovery.searchesCompleted,
						" searches. Your selection covers ",
						pct(niche.gmv ? selectedGmv / niche.gmv * 100 : 0),
						" of the direct niche GMV (",
						usd(selectedGmv),
						" of ",
						usd(niche.gmv),
						")."
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						k.discovery.searchTerms.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs",
							children: [t, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": `Remove ${t}`,
								disabled: busy || k.discovery?.searchTerms.length === 1,
								onClick: () => void saveTerms(k.discovery.searchTerms.filter((x) => x !== t)),
								children: "×"
							})]
						}, t)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							"aria-label": "Add market search term",
							value: term,
							onChange: (e) => setTerm(e.target.value),
							placeholder: "Add term",
							className: "h-9 w-36"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
							className: "h-9",
							disabled: busy || !term.trim() || k.discovery.searchTerms.length >= 8,
							onClick: () => {
								saveTerms([...k.discovery.searchTerms, term.trim().toLowerCase()]);
								setTerm("");
							},
							children: "Search term"
						})
					]
				})]
			}),
			!k?.discovery && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeywordLine, {
				k,
				onEdit: onEditKeywords
			}),
			direct.length < 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Note, { children: [
				"This niche is still small on TikTok Shop: only ",
				direct.length,
				" products sell over $5K a month. Review Adjacent products or add a broader search term."
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2 border-b border-border pb-3",
				children: [[
					["direct", `Direct competitors (${direct.length})`],
					["adjacent", `Adjacent (${adjacent.length})`],
					["no", `Not relevant (${irrelevant.length})`]
				].map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTab(value),
					className: cn("rounded-full border px-3 py-1.5 text-sm font-semibold", tab === value ? "border-navy bg-navy text-primary-foreground" : "border-border text-navy"),
					children: label
				}, value)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "ml-auto text-sm font-semibold text-navy",
					children: [
						chosen.length,
						" of ",
						8,
						" selected"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: rows.slice(0, tab === "no" ? 20 : 80).map((p) => {
					const key = productKey(p), on = set.has(key), full = !on && chosen.length >= 8;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("flex flex-col gap-3 border p-3 sm:flex-row sm:items-start", on ? "border-signal bg-card ring-2 ring-signal/20" : "border-border"),
						children: [
							tab === "direct" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: on,
								disabled: full,
								onChange: () => toggle(key),
								"aria-label": `Include ${p.product_name}`,
								className: "mt-1 h-5 w-5 shrink-0 accent-[var(--signal)]"
							}),
							img(p) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: img(p),
								alt: "",
								className: "h-16 w-16 shrink-0 rounded object-cover"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-16 w-16 shrink-0 rounded bg-cloud" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1 space-y-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										title: p.product_name,
										className: "line-clamp-2 text-sm font-semibold text-navy",
										children: p.product_name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-caption",
										children: [
											p.shop_name ?? p.seller_name ?? p.product_shop_name ?? "Seller unavailable",
											" · ",
											usd(toNum(p.unit_price), 2),
											" · ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-semibold text-navy",
												children: [usd(toNum(p.revenue)), " / 30d"]
											}),
											" · ",
											pct(ratePct(p.commission_rate)),
											" commission"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-caption",
										children: [
											"Found: ",
											(p.foundTerms ?? []).join(", ") || "seller expansion",
											p.listingCount > 1 ? ` · +${p.listingCount - 1} more listings` : ""
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs",
										children: p.relevanceReason
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								"aria-label": `Classify ${p.product_name}`,
								value: relevanceOf(p, answers.productOverrides),
								onChange: (e) => move(p, e.target.value),
								className: "h-9 rounded-md border border-border bg-background px-2 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "direct",
										children: "Direct"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "adjacent",
										children: "Adjacent"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "no",
										children: "Not relevant"
									})
								]
							})
						]
					}, key);
				})
			}),
			id && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bento space-y-3 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-semibold text-navy",
						children: "Missing a competitor?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2 sm:flex-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							"aria-label": "Find missing competitor",
							value: query,
							onChange: (e) => setQuery(e.target.value),
							placeholder: "Product name, brand, TikTok link or product ID"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
							disabled: busy || !query.trim(),
							onClick: () => void searchMissing(),
							children: "Find product"
						})]
					}),
					found.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "max-h-64 space-y-2 overflow-y-auto",
						children: found.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => void addProduct(productKey(p)),
							className: "flex w-full items-center gap-3 border-b border-border py-2 text-left text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex-1",
									children: p.product_name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: usd(toNum(p.revenue)) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-signal",
									children: "Add"
								})
							]
						}, productKey(p)))
					})
				]
			}),
			message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, { children: message }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrimaryBtn, {
				type: "button",
				disabled: chosen.length < 2 || busy,
				onClick: () => onAnswers({
					selectedProducts: chosen,
					competitorsConfirmed: true
				}),
				children: "Analyze selected competitors"
			})
		]
	});
}
function ProductMarket({ id, k, answers, onAnswers, afterShare, onEditKeywords, onMarket }) {
	const m = productMarketStats(k, answers);
	if (!k?.ok || !m.products.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, { children: k?.ok ? "No competing products found. Try a broader keyword." : "Market data unavailable. Please retry when you are ready." }),
		k?.ok && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeywordLine, {
			k,
			onEdit: onEditKeywords
		}),
		afterShare
	] });
	if (onAnswers && !answers.competitorsConfirmed) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmCompetitors, {
		id,
		k,
		answers,
		onAnswers,
		onEditKeywords,
		onMarket
	});
	const stats = marketStats(k, answers);
	const leader = stats.products[0];
	const commissions = stats.products.map((p) => ratePct(p.commission_rate)).filter((n) => n > 0).sort((a, b) => a - b);
	const low = commissions[Math.floor(commissions.length * .25)] ?? 0;
	const high = commissions[Math.floor(commissions.length * .75)] ?? 0;
	const channel = (p) => [
		"Creator video",
		"Live",
		"Shop tab"
	][[
		toNum(p.video_revenue),
		toNum(p.live_revenue),
		toNum(p.shopping_mall_revenue ?? p.showcase_revenue)
	].reduce((best, v, i, a) => v > (a[best] ?? 0) ? i : best, 0)];
	const insights = competitorInsights(k, answers);
	if (!insights.hasData) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, { children: "Not enough market data for this keyword. Try a broader keyword." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeywordLine, {
				k,
				onEdit: onEditKeywords
			}),
			onAnswers && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
				onClick: () => onAnswers({ competitorsConfirmed: false }),
				children: "Edit competitors"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeywordLine, { k }),
			onAnswers && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
				type: "button",
				className: "text-sm underline text-navy",
				onClick: () => onAnswers({ competitorsConfirmed: false }),
				children: [
					"Edit competitors (",
					insights.products.length,
					" selected)"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Direct niche GMV, 30 days",
						value: usd(stats.gmv),
						sub: `${stats.productCount} direct products from ${stats.sellerCount || "multiple"} sellers`,
						tone: "dark"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Units sold, 30 days",
						value: num(stats.units)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Median price",
						value: usd(stats.medianPrice, 2)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Median affiliate commission",
						value: pct(stats.medianCommission)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Creator videos",
						value: pct(stats.shares[0] ?? 0),
						sub: "Share of 30-day GMV"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Live / shop tab",
						value: `${pct(stats.shares[1] ?? 0)} / ${pct(stats.shares[2] ?? 0)}`,
						sub: "Share of 30-day GMV"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketShare, {
				k,
				answers
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketInsights, {
				k,
				answers
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Note, { children: [
						"Creator videos drive ",
						pct(stats.shares[0] ?? 0),
						" of sales in this market."
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, { children: commissions.length ? `Top products pay ${pct(low)} to ${pct(high)} affiliate commission.` : "Affiliate commission data is unavailable." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, { children: leader ? `The #1 product does ${usd(toNum(leader.revenue))} a month at ${usd(toNum(leader.unit_price), 2)}.` : "Choose competitors to see the market leader." })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceBands, {
				k,
				answers
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-xl",
						children: "Competing products"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto border-y border-border",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full min-w-[860px] text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
								className: "border-b border-border text-left",
								children: [
									"Product",
									"Price",
									"30d GMV",
									"Units",
									"Growth",
									"Commission",
									"Main channel"
								].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "eyebrow px-3 py-3",
									children: h
								}, h))
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: stats.products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-3",
											children: [img(p) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
												src: img(p),
												alt: "",
												className: "h-10 w-10 rounded object-cover"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "line-clamp-2 w-56 text-navy",
												children: p.product_name
											})]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3",
										children: usd(toNum(p.unit_price), 2)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 font-semibold text-navy",
										children: usd(toNum(p.revenue))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3",
										children: num(toNum(p.sales_volumn ?? p.sales_volume))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3",
										children: formatGrowth(p.revenue_growth_rate, p.launch_date) === "new" ? "new" : formatGrowth(p.revenue_growth_rate, p.launch_date) === null ? "n/a" : pct(formatGrowth(p.revenue_growth_rate, p.launch_date))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3",
										children: pct(ratePct(p.commission_rate))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3",
										children: channel(p)
									})
								]
							}, productKey(p))) })]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourceLine, {})
				]
			}),
			afterShare
		]
	});
}
function EconomicsCards({ r, products }) {
	const e = r.econ;
	if (!r.profitAvailable) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, { children: "Add your product cost to see profit, margin and ROI. FBT and GMV estimates remain available." });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExpectedRoi, { r }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Profit per order",
						value: usd(e.avgContribFloor, 2),
						sub: `Average, at ${r.assumptions.adsFloorPct}% ads`,
						tone: marginTone(e.avgMarginFloor)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Margin after TikTok costs",
						value: pct(e.avgMarginFloor),
						sub: `${pct(e.avgMarginTarget)} at ${r.assumptions.adsTargetPct}% ads`,
						tone: marginTone(e.avgMarginFloor)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Monthly program investment",
						value: usd(e.monthlyProgramCost),
						sub: "Fee + samples + ads from month 3"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Break-even GMV",
						value: e.breakEvenGmv ? usd(e.breakEvenGmv) : "Not profitable",
						sub: "TikTok GMV per month",
						tone: "dark"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "bento overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[640px] text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-left",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
							className: "border-b border-border",
							children: [
								"Product",
								"Price",
								"Fulfillment",
								`Profit @${r.assumptions.adsFloorPct}% ads`,
								"Margin",
								`Profit @${r.assumptions.adsTargetPct}% ads`,
								"Margin",
								"Sample cost"
							].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "eyebrow px-4 py-3 font-semibold",
								children: h
							}, h))
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: products.map((p, i) => {
						const x = e.perProduct[i];
						if (!x) return null;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border last:border-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 font-semibold text-navy",
									children: p.name || `Product ${i + 1}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3",
									children: usd(p.price, 2)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3",
									children: usd(x.fee, 2)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3",
									children: usd(x.contribFloor, 2)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: cn("px-4 py-3 font-semibold", toneText(x.marginFloor)),
									children: pct(x.marginFloor)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3",
									children: usd(x.contribTarget, 2)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: cn("px-4 py-3 font-semibold", toneText(x.marginTarget)),
									children: pct(x.marginTarget)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3",
									children: usd(x.sampleUnitCost, 2)
								})
							]
						}, i);
					}) })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-caption",
				children: [
					FBT_RATE_CARD.label,
					". Profit includes a 3% returns allowance. Monthly samples cost ",
					usd(e.monthlySampleCost),
					" (",
					r.assumptions.samplesPerMonth,
					" x ",
					usd(e.sampleUnitCost, 2),
					"). Sophie fee ",
					usd(r.assumptions.sophieFee),
					"/month; revenue share only applies above $100K GMV per month."
				]
			})
		]
	});
}
function ExpectedRoi({ r }) {
	const s = r.scenarios.find((scenario) => scenario.label === "Target");
	if (!s || !r.profitAvailable) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, { children: "Add your product cost to see ROI and profit. The GMV plan is still available." });
	const tone = s.roi >= 0 ? "good" : s.roi > -40 ? "neutral" : "warn";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-3 sm:grid-cols-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "sm:col-span-1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: "Expected ROI, 12 months",
				value: pct(s.roi),
				sub: `${s.samples} samples per month scenario`,
				tone
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bento p-5 text-sm sm:col-span-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "eyebrow",
					children: "How to read this"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2",
					children: [
						"For every ",
						usd(100),
						" invested over 12 months, projected contribution is",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold text-navy",
							children: usd(100 + s.roi)
						}),
						" after TikTok fees, creator commissions, product cost and shipping. ",
						s.breakEvenMonth ? `It pays back in month ${s.breakEvenMonth}.` : "It does not pay back within 12 months."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-xs text-caption",
					children: [
						"Ads return ",
						r.assumptions.roas,
						"x their spend (ROAS) from month ",
						r.assumptions.adStartMonth,
						". Assumes ",
						r.assumptions.affiliateSharePct,
						"% of sales come from affiliate creators (commission only on those) and ads at ",
						r.assumptions.adsFloorPct,
						"% of GMV."
					]
				})
			]
		})]
	});
}
var toneText = (m) => ({
	good: "text-navy",
	neutral: "text-navy",
	warn: "text-drive"
})[marginTone(m)];
function FulfillmentSection({ r, products }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			r.fulfillment.map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bento p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-4 font-semibold text-navy",
						children: f.product
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-3 sm:grid-cols-3",
						children: f.opts.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: cn("rounded-xl border border-border p-4", o.key === f.cheapest && "border-growth bg-growth/10"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "eyebrow",
									children: [o.label, o.key === f.cheapest && " · cheapest"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 text-2xl font-bold text-navy",
									children: usd(o.unit, 2)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-caption",
									children: [
										"per order · ",
										usd(o.monthly),
										"/mo at ",
										num(r.unitsPerProduct),
										" units"
									]
								})
							]
						}, o.key))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FbtPanel, { product: products?.[i] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 h-40",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: f.opts,
							layout: "vertical",
							margin: { left: 10 },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									type: "number",
									hide: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									type: "category",
									dataKey: "label",
									width: 90,
									tick: { fontSize: 12 }
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { formatter: (v) => usd(v, 2) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "unit",
									fill: "var(--signal)",
									radius: [
										0,
										6,
										6,
										0
									]
								})
							]
						}) })
					})
				]
			}, i)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-caption",
				children: "MCF and own 3PL are editable estimates. Monthly volume uses the Target scenario, month 6."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Truck, {
					className: "mt-0.5 h-5 w-5 shrink-0 text-signal",
					strokeWidth: 1.5
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "FBT advantages: the FBT badge and faster delivery promise usually lift conversion, and creator samples can ship straight from FBT stock." })]
			}) })
		]
	});
}
function FbtPanel({ product }) {
	if (!product) return null;
	const panel = fbtFeePanel(product);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-5 rounded-xl border border-border p-4 text-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "font-semibold text-navy",
				children: [
					panel.weight.toFixed(2),
					" lb chargeable weight · ",
					panel.tier
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs text-caption",
				children: [
					"Uses ",
					panel.reason === "actual" ? "actual weight: 2 lb or less and at most 332 cubic inches" : `the greater of actual and dimensional weight (${panel.dimensional.toFixed(2)} lb dimensional)`,
					". ",
					FBT_RATE_CARD.label,
					"."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid grid-cols-4 gap-2",
				children: panel.fees.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-xs text-caption",
					children: [
						f.units === 4 ? "4+" : f.units,
						" unit",
						f.units === 1 ? "" : "s"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-semibold text-navy",
					children: f.fee === null ? "Team quote" : usd(f.fee, 2)
				})] }, f.units))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3",
				children: [
					"Sample cost per unit: ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold text-navy",
						children: usd(panel.sampleCost, 2)
					}),
					" (COGS + single-unit FBT fee)."
				]
			}),
			panel.next && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs text-caption",
				children: [panel.next.remainingOz.toFixed(1), " oz under the next tier."]
			}),
			!panel.eligibility.eligible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, { children: panel.eligibility.reason }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-caption",
				children: FBT_FACTS.join(" ")
			})
		]
	});
}
function MarketSection({ id, k, answers, onAnswers, afterShare, onEditKeywords, onMarket }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductMarket, {
		id,
		k,
		answers,
		onAnswers,
		afterShare,
		onEditKeywords,
		onMarket
	});
}
var BOOKING_URL = "https://calendly.com/pablo-sophiesociety/30min";
function BookCall({ popup = false }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (popup) setOpen(true);
	}, [popup]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "no-print space-y-3 border-y border-border py-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-2xl",
				children: "Book a call with the Sophie TikTok Shop team"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-caption",
				children: "Walk through your plan with the Sophie Society team."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PrimaryBtn, {
				onClick: () => setOpen(true),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarCheck, { className: "h-5 w-5" }), " Book a call"]
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[90dvh] max-w-3xl overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Book a call with Sophie Society" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Find a time to discuss your TikTok Shop plan." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-caption",
					children: "Review your market, fulfillment and six-month projection with our team."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PrimaryBtn, {
					onClick: () => window.open(BOOKING_URL, "_blank", "noopener,noreferrer"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarCheck, { className: "h-5 w-5" }), " Choose a time"]
				})
			]
		})
	})] });
}
var SCENARIOS = ["Target", "Conservative"];
var short = (n) => n < 0 ? `-${short(-n)}` : n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `$${Math.round(n / 1e3)}K` : usd(n);
var cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
var monthLabel = (m) => m ? `Month ${m}` : `After month 12`;
var scenarioOf = (r, label = "Target") => r.scenarios.find((s) => s.label === label);
function Collapse({ label, children }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostBtn, {
			type: "button",
			className: "no-print h-9 text-sm",
			"aria-expanded": open,
			onClick: () => setOpen((o) => !o),
			children: [
				label,
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: cn("h-4 w-4 transition", open && "rotate-180") })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn(open ? "block" : "hidden", "print:block"),
			children
		})]
	});
}
function Section({ eyebrow, title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "story-section space-y-6 border-t border-border pt-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eyebrow, { children: eyebrow }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mt-2 text-3xl",
			children: title
		})] }), children]
	});
}
function ProfitChart({ r }) {
	const [label, setLabel] = (0, import_react.useState)("Target");
	const s = scenarioOf(r, label) ?? r.scenarios[0];
	if (!s) return null;
	const data = s.rows.map((row) => ({
		month: `M${row.month}`,
		gmv: Math.round(row.gmv),
		profit: Math.round(row.net),
		cum: Math.round(row.cumNet)
	}));
	if (!r.profitAvailable) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bento space-y-4 p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "eyebrow",
				children: [
					"Monthly GMV, ",
					label,
					" scenario"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-80",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ComposedChart, {
					data,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
							stroke: "var(--border)",
							vertical: false
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, { dataKey: "month" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, { tickFormatter: (v) => short(Number(v)) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { formatter: (v) => usd(v) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
							dataKey: "gmv",
							fill: "var(--navy)",
							isAnimationActive: false
						})
					]
				}) })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, { children: "Add your product cost to see profit." })
		]
	});
	const max = Math.max(...data.map((d) => d.profit)), min = Math.min(...data.map((d) => d.profit));
	const offset = max <= 0 ? 0 : min >= 0 ? 1 : max / (max - min);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bento space-y-4 p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "eyebrow",
					children: [
						"Monthly GMV and profit, ",
						label,
						" scenario"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "no-print flex gap-1",
					role: "group",
					"aria-label": "Scenario",
					children: SCENARIOS.filter((x) => scenarioOf(r, x)).map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-pressed": label === x,
						onClick: () => setLabel(x),
						className: cn("rounded-full border px-3 py-1 text-xs font-semibold", label === x ? "border-navy bg-navy text-primary-foreground" : "border-border text-navy"),
						children: x
					}, x))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-80",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ComposedChart, {
					data,
					margin: {
						top: 28,
						right: 12,
						left: 0,
						bottom: 0
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
							id: "profitTone",
							x1: "0",
							y1: "0",
							x2: "0",
							y2: "1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
								offset,
								stopColor: "var(--growth)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
								offset,
								stopColor: "var(--gold)"
							})]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
							stroke: "var(--border)",
							vertical: false
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
							dataKey: "month",
							tick: { fontSize: 12 }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
							tickFormatter: (v) => short(Number(v)),
							tick: { fontSize: 12 },
							width: 56
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { formatter: (v, n) => [usd(v), n === "gmv" ? "GMV" : n === "profit" ? "Monthly profit" : "Cumulative profit"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceLine, {
							y: 0,
							stroke: "var(--navy)"
						}),
						s.profitableMonth && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceLine, {
							x: `M${s.profitableMonth}`,
							stroke: "var(--growth)",
							strokeDasharray: "3 3",
							label: {
								value: `Profitable month: Month ${s.profitableMonth}`,
								position: "top",
								fill: "var(--navy)",
								fontSize: 11
							}
						}),
						s.breakEvenMonth && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceLine, {
							x: `M${s.breakEvenMonth}`,
							stroke: "var(--signal)",
							strokeDasharray: "3 3",
							label: {
								value: `Investment paid back: Month ${s.breakEvenMonth}`,
								position: "insideTopRight",
								fill: "var(--navy)",
								fontSize: 11
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
							dataKey: "gmv",
							fill: "var(--navy)",
							barSize: 22,
							isAnimationActive: false
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
							dataKey: "profit",
							stroke: "url(#profitTone)",
							strokeWidth: 3,
							dot: false,
							isAnimationActive: false
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
							dataKey: "cum",
							stroke: "var(--signal)",
							strokeDasharray: "6 4",
							strokeWidth: 2,
							dot: false,
							isAnimationActive: false
						})
					]
				}) })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-x-5 gap-y-1 text-xs text-caption",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mr-1 inline-block h-2 w-3 bg-navy" }), "Monthly GMV"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mr-1 inline-block h-0.5 w-3 bg-growth align-middle" }), "Monthly profit (orange when negative)"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mr-1 inline-block h-0.5 w-3 bg-signal align-middle" }), "Cumulative profit"] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "font-semibold text-navy",
					children: ["Profitable month: ", monthLabel(s.profitableMonth)]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "font-semibold text-navy",
					children: ["Investment paid back: ", monthLabel(s.breakEvenMonth)]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Collapse, {
				label: "See month by month",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full min-w-[760px] text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
							className: "text-left text-caption",
							children: [
								"Month",
								"Samples",
								"New videos",
								"Active affiliates",
								"GMV",
								"Total costs",
								"Monthly profit",
								"Cumulative profit"
							].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 pr-3",
								children: h
							}, h))
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: s.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "py-1.5",
									children: row.month
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: num(row.samples) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: num(row.newVideos) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: num(row.affiliates) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "font-semibold text-navy",
									children: usd(row.gmv)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: usd(row.gmv - row.net) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: usd(row.net) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: usd(row.cumNet) })
							]
						}, row.month)) })]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-caption",
				children: "Sophie's revenue share applies only above $100K GMV/month and is not included here."
			})
		]
	});
}
function Story({ r, k, answers, brand, products, marketOnly = false, popup = false, earlyCta = false }) {
	const name = brand || "Your brand";
	const price = answers.marketPrice ?? products[0]?.price;
	const o = opportunitySignals(k, answers, price || void 0);
	const base = scenarioOf(r);
	const rows = base?.rows ?? [];
	const m12 = rows[11];
	const a = r.assumptions, d = r.insights, mk = d.market;
	const keyword = cap(k?.keywordInfo?.[0]?.used ?? products[0]?.keywords?.[0] ?? "This category");
	const commission = Math.round(a.affiliatePct);
	const creators = d.creators.leader ? `${d.creators.leader} followers` : "creators selling comparable products";
	const hasPlan = !marketOnly && d.hasData && !!base;
	const rec = r.fulfillment.filter((f) => f.cheapest === "fbt").length >= r.fulfillment.length / 2 ? "FBT is the cheapest option for most of your hero products and adds the FBT badge. We recommend FBT." : `Your cheapest option is ${r.fulfillment[0]?.opts.find((x) => x.key === r.fulfillment[0]?.cheapest)?.label}. FBT can still be worth it for the badge and faster delivery.`;
	const signals = [
		{
			label: "Market size",
			word: o.size,
			text: `${short(o.gmv)} in 30-day GMV across the top competing products.`
		},
		{
			label: "Competition",
			word: o.competition,
			text: `The top 3 products hold ${pct(o.concentration)} of top-20 sales.`
		},
		{
			label: "Momentum",
			word: o.momentum,
			text: `Median revenue growth of the top products is ${pct(o.growth)}.`
		},
		{
			label: "Price fit",
			word: o.priceFit ?? "Unknown",
			text: o.priceFit ? `Your ${usd(price ?? 0, 2)} vs a typical ${usd(o.priceLow, 2)} to ${usd(o.priceHigh, 2)} band.` : "Add your price to see where you fit."
		}
	];
	const playbook = [
		{
			label: "Commission paid",
			value: mk.commission === null ? "n/a" : pct(mk.commission)
		},
		{
			label: "Active affiliates",
			value: mk.affiliates === null ? "n/a" : num(mk.affiliates)
		},
		{
			label: "New videos per month",
			value: mk.newVideos === null ? "n/a" : num(mk.newVideos)
		},
		{
			label: "Sales from videos / lives",
			value: `${mk.videoShare === null ? "n/a" : pct(mk.videoShare)} / ${mk.liveShare === null ? "n/a" : pct(mk.liveShare)}`
		},
		{
			label: "Top videos running as ads",
			value: d.ads.adsShare === null ? "n/a" : pct(d.ads.adsShare),
			sub: d.ads.roas === null ? "ROAS n/a" : `${d.ads.roas.toFixed(2)}x ROAS, Kalodata estimate`
		},
		{
			label: "Creator sweet spot",
			value: d.creators.leader ? `${d.creators.leader}` : "n/a",
			sub: "Followers"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "story space-y-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "story-section rounded-lg bg-navy p-6 text-primary-foreground sm:p-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "eyebrow text-primary-foreground/70",
						children: marketOnly ? "Market summary" : "Summary"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-2xl font-semibold leading-snug sm:text-3xl",
						children: [
							keyword,
							" is a ",
							short(o.gmv),
							"/month market on TikTok Shop, and creator videos drive ",
							pct(o.videoShare),
							" of it.",
							hasPlan && m12 ? ` ${name} can realistically reach ${short(m12.gmv)}/month by month 12.` : ""
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("mt-8 grid gap-6", hasPlan ? "sm:grid-cols-3" : "sm:grid-cols-1"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm text-primary-foreground/70",
							children: "Market size, 30 days"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-4xl font-bold",
							children: short(o.gmv)
						})] }), hasPlan && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm text-primary-foreground/70",
							children: "Your month-12 GMV (Target)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-4xl font-bold",
							children: short(m12?.gmv ?? 0)
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm text-primary-foreground/70",
							children: "Profitable from"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-4xl font-bold",
							children: monthLabel(base?.profitableMonth ?? null)
						})] })] })]
					}),
					hasPlan && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-6 border-t border-primary-foreground/20 pt-4",
						children: [
							"Launch with ",
							commission,
							"% commission and ",
							num(a.samplesPerMonth),
							" samples a month, start ads in month ",
							a.adStartMonth,
							"."
						]
					})
				]
			}),
			earlyCta && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookCall, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				eyebrow: "The opportunity",
				title: "Why now",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
						children: signals.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bento space-y-2 p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "eyebrow",
									children: x.label
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-2xl font-bold text-navy",
									children: x.word
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm",
									children: x.text
								})
							]
						}, x.label))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketShare, {
						k,
						answers
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceBands, {
						k,
						answers,
						title: "Where you fit"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				eyebrow: "The playbook",
				title: "What the winners do",
				children: d.hasData ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
						children: playbook.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: x.label,
							value: x.value,
							sub: x.sub ?? "Median of selected competitors"
						}, x.label))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketInsights, {
						k,
						answers,
						parts: ["videos"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Collapse, {
						label: "See full comparison",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketInsights, {
							k,
							answers,
							parts: [
								"benchmark",
								"creators",
								"ads"
							]
						})
					})
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, { children: "Not enough market data for this keyword. Try a broader keyword." })
			}),
			hasPlan && base && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					eyebrow: "Your plan",
					title: "Three phases to month 12",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 lg:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phase, {
								n: 1,
								name: "Launch",
								months: "Months 1-2",
								items: [
									`Set commission at ${commission}%${r.adjusted ? " (team adjusted)" : " (market median)"}.`,
									`Send ${num(a.samplesPerMonth)} samples a month.`,
									`Target creators with ${creators}.`
								],
								goal: `${num(rows[1]?.affiliates ?? 0)} videos live and first sales.`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phase, {
								n: 2,
								name: "Build",
								months: "Months 3-6",
								items: [
									`Keep ${num(a.samplesPerMonth)} samples a month.`,
									"Run a monthly creator challenge.",
									`Start GMV Max at ${usd(a.adDaily)}/day targeting ${a.roas ? `${a.roas.toFixed(1)}x` : "market"} ROAS.`
								],
								goal: `${num(rows[5]?.affiliates ?? 0)} active affiliates and ${usd(rows[5]?.gmv ?? 0)} GMV/month by month 6.`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phase, {
								n: 3,
								name: "Scale",
								months: "Months 7-12",
								items: [
									"Scale winning creators and videos with Spark codes.",
									"Add lives with top creators.",
									"Add products to the shop."
								],
								goal: `${usd(m12?.gmv ?? 0)} GMV/month by month 12.`
							})
						]
					}), r.adjusted && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, { children: "Adjusted by Sophie team" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					eyebrow: "Your numbers",
					title: "GMV and profitability",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfitChart, { r }),
						r.profitAvailable && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Total investment until payback",
									value: usd(base.maxInvestment),
									sub: "Deepest point of cumulative profit",
									tone: "dark"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Profitable month",
									value: monthLabel(base.profitableMonth)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Month-12 monthly profit",
									value: usd(m12?.net ?? 0),
									tone: (m12?.net ?? 0) > 0 ? "good" : "neutral"
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Profit per order",
								value: usd(r.econ.avgContribFloor, 2),
								sub: `Average, at ${a.adsFloorPct}% ads`
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Margin after TikTok costs",
								value: pct(r.econ.avgMarginFloor)
							})]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, { children: rec }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Collapse, {
							label: "See fulfillment comparison",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FulfillmentSection, {
								r,
								products
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					eyebrow: "What we need from you",
					title: "Your commitments",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-3",
						children: [
							`${num(a.samplesPerMonth)} samples a month for at least 3 months, about ${usd(r.econ.monthlySampleCost)}/month in product and shipping.`,
							"Inventory sent to FBT.",
							`Ad budget of ${usd(a.adDaily)}/day from month ${a.adStartMonth}.`,
							`Affiliate commission at ${commission}%.`
						].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mt-0.5 h-5 w-5 shrink-0 text-signal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t })]
						}, t))
					})
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "story-section space-y-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookCall, { popup })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-caption",
				children: "Market data: Kalodata, TikTok Shop US, last 30 days. Projections are estimates based on competitor benchmarks, not guarantees."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourceLine, {})
		]
	});
}
function Phase({ n, name, months, items, goal }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bento flex flex-col gap-3 p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex h-8 w-8 items-center justify-center rounded-full bg-navy text-sm font-bold text-primary-foreground",
					children: n
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "font-semibold text-navy",
					children: [
						"Phase ",
						n,
						", ",
						name
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs text-caption",
					children: months
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "list-disc space-y-1 pl-5 text-sm",
				children: items.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: i }, i))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-auto border-t border-border pt-3 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold text-navy",
						children: "Goal:"
					}),
					" ",
					goal
				]
			})
		]
	});
}
function ScanProgress({ id, k, answers, onData, own = false, onBusy }) {
	const enrich = useServerFn(enrichMarketProduct), find = useServerFn(findOwnProducts);
	const [busy, setBusy] = (0, import_react.useState)(false), [error, setError] = (0, import_react.useState)(""), [active, setActive] = (0, import_react.useState)("");
	const running = (0, import_react.useRef)(false);
	const products = own ? k?.ownProducts ?? [] : selectedCompetitors(k, answers);
	const cache = own ? k?.ownEnriched : k?.enriched;
	const key = products.map(productKey).join(",");
	async function run() {
		if (running.current || !k?.ok) return;
		running.current = true;
		setBusy(true);
		onBusy?.(true);
		setError("");
		try {
			let latest = k;
			if (own) latest = await find({ data: {
				id,
				shopId: answers.shopId
			} });
			const list = own ? latest.ownProducts ?? [] : selectedCompetitors(latest, answers);
			onData(latest);
			if (own && !list.length) setError("No product data was available for your shop. You can continue with market benchmarks.");
			for (const p of list) {
				const idp = productKey(p);
				if ((own ? latest.ownEnriched : latest.enriched)?.[idp]?.attempted) continue;
				setActive(idp);
				latest = await enrich({ data: {
					id,
					productId: idp,
					own
				} });
				onData(latest);
			}
		} catch {
			setError("The scan stopped. Continue to finish the remaining products.");
		} finally {
			running.current = false;
			setBusy(false);
			setActive("");
			onBusy?.(false);
		}
	}
	(0, import_react.useEffect)(() => {
		if (own || products.some((p) => !cache?.[productKey(p)]?.attempted)) run();
	}, [
		key,
		own,
		answers.shopId
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		"aria-live": "polite",
		children: [
			busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-semibold text-navy",
				children: own ? "Analyzing your products" : "Analyzing selected competitors"
			}),
			products.map((p) => {
				const e = cache?.[productKey(p)];
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 border-b border-border py-2 text-sm",
					children: [
						e?.attempted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4 shrink-0 text-growth" }) : active === productKey(p) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 shrink-0 animate-spin text-signal" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-4 w-4 shrink-0 rounded-full border border-border" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-0 flex-1 truncate",
							children: p.product_name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "shrink-0 text-xs text-caption",
							children: e?.attempted ? e.detail ? "Complete" : "Unavailable" : active === productKey(p) ? "Scanning" : "Waiting"
						})
					]
				}, productKey(p));
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, { children: error }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostBtn, {
				onClick: () => void run(),
				disabled: busy,
				children: "Continue scan"
			})] })
		]
	});
}
//#endregion
export { EconomicsCards as a, ProfitChart as c, scenarioOf as d, DialogTitle as i, ScanProgress as l, Dialog as n, FulfillmentSection as o, DialogContent as r, MarketSection as s, BookCall as t, Story as u };
