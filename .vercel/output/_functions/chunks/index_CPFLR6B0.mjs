import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { d as renderHead, f as addAttribute, i as renderComponent, l as renderTemplate, u as maybeRenderHead, y as createAstro } from "./server_C-PK2OEm.mjs";
import { t as createComponent } from "./compiler_zyFMNQyq.mjs";
import { useEffect, useRef, useState } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region src/components/react/Hero/Ticker.tsx
function Ticker() {
	const [patreonPosts, setPatreonPosts] = useState([]);
	useEffect(() => {
		const fetchPatreon = async () => {
			try {
				const res = await fetch("/api/patreon");
				if (res.ok) {
					const data = await res.json();
					setPatreonPosts(data);
				}
			} catch (err) {
				console.error("Failed to fetch Patreon updates", err);
			}
		};
		fetchPatreon();
	}, []);
	const allMessages = [...["Currently editing the portfolio.", "Commissions are OPEN!"], ...patreonPosts.map((p) => `[Patreon Update] ${p.title} (${p.type})`)];
	const tickerItems = [
		...allMessages,
		...allMessages,
		...allMessages,
		...allMessages
	];
	return /* @__PURE__ */ jsx("div", {
		className: "ticker-wrapper",
		children: /* @__PURE__ */ jsx("div", {
			className: "ticker-content",
			children: tickerItems.map((msg, idx) => /* @__PURE__ */ jsx("span", { children: msg }, idx))
		})
	});
}
//#endregion
//#region src/components/react/Hero/HeroCarousel.tsx
var images = [
	"public/Assets/Hero/Carousel/6.png",
	"public/Assets/Hero/Carousel/7.png",
	"public/Assets/Hero/Carousel/8.png",
	"public/Assets/Hero/Carousel/1.png",
	"public/Assets/Hero/Carousel/2.png",
	"public/Assets/Hero/Carousel/3.png",
	"public/Assets/Hero/Carousel/4.png",
	"public/Assets/Hero/Carousel/5.png"
];
function HeroCarousel() {
	const trackRef = useRef(null);
	const [isDown, setIsDown] = useState(false);
	const [startX, setStartX] = useState(0);
	const [scrollLeft, setScrollLeft] = useState(0);
	const handleMouseDown = (e) => {
		if (!trackRef.current) return;
		setIsDown(true);
		trackRef.current.classList.add("active");
		setStartX(e.pageX - trackRef.current.offsetLeft);
		setScrollLeft(trackRef.current.scrollLeft);
	};
	const handleMouseLeave = () => {
		setIsDown(false);
		if (trackRef.current) trackRef.current.classList.remove("active");
	};
	const handleMouseUp = () => {
		setIsDown(false);
		if (trackRef.current) trackRef.current.classList.remove("active");
	};
	const handleMouseMove = (e) => {
		if (!isDown || !trackRef.current) return;
		e.preventDefault();
		const walk = (e.pageX - trackRef.current.offsetLeft - startX) * 2;
		trackRef.current.scrollLeft = scrollLeft - walk;
	};
	return /* @__PURE__ */ jsx("div", {
		className: "hero-carousel-container",
		children: /* @__PURE__ */ jsx("div", {
			className: "hero-carousel-track",
			ref: trackRef,
			onMouseDown: handleMouseDown,
			onMouseLeave: handleMouseLeave,
			onMouseUp: handleMouseUp,
			onMouseMove: handleMouseMove,
			children: images.map((src, index) => /* @__PURE__ */ jsx("div", {
				className: "hero-carousel-item",
				children: /* @__PURE__ */ jsx("img", {
					src,
					alt: `Artwork ${index}`,
					draggable: "false"
				})
			}, index))
		})
	});
}
//#endregion
//#region src/components/react/About/SpotifyWidget.tsx
var CACHE_KEY$1 = "kyororoom_spotify_last_track";
function formatRelativeTime$1(epochSeconds) {
	const nowSeconds = Math.floor(Date.now() / 1e3);
	const diffSeconds = Math.max(0, nowSeconds - epochSeconds);
	const ONE_DAY_SECONDS = 86400;
	if (diffSeconds < ONE_DAY_SECONDS) {
		const hours = Math.floor(diffSeconds / 3600);
		return `${hours} hour${hours === 1 ? "" : "s"} ago`;
	} else {
		const days = Math.floor(diffSeconds / ONE_DAY_SECONDS);
		return `${days} day${days === 1 ? "" : "s"} ago`;
	}
}
function SpotifyWidget() {
	const [data, setData] = useState(null);
	useEffect(() => {
		try {
			const cached = localStorage.getItem(CACHE_KEY$1);
			if (cached) {
				const parsed = JSON.parse(cached);
				setData(parsed);
			}
		} catch {}
		const fetchSpotify = async () => {
			try {
				const res = await fetch("/api/spotify");
				if (res.ok) {
					const json = await res.json();
					if (json.title) {
						setData(json);
						try {
							localStorage.setItem(CACHE_KEY$1, JSON.stringify(json));
						} catch {}
					} else if (json.isPlaying === false) setData((prev) => {
						if (prev && prev.title) return {
							...prev,
							isPlaying: false
						};
						return json;
					});
				}
			} catch (err) {
				console.error("Error fetching Spotify data", err);
			}
		};
		fetchSpotify();
		const interval = setInterval(fetchSpotify, 15e3);
		return () => clearInterval(interval);
	}, []);
	const headerText = data?.isPlaying ? "Now Playing" : data?.timestamp ? `Last Song • ${formatRelativeTime$1(data.timestamp)}` : "Last Song";
	return /* @__PURE__ */ jsxs("div", {
		className: "spotify-widget",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "spotify-header",
			children: [/* @__PURE__ */ jsx("span", {
				className: "spotify-icon",
				children: "♪"
			}), /* @__PURE__ */ jsx("span", { children: headerText })]
		}), data && data.title ? /* @__PURE__ */ jsxs("a", {
			href: data.songUrl,
			target: "_blank",
			rel: "noreferrer",
			className: "spotify-track",
			children: [data.albumImageUrl && /* @__PURE__ */ jsx("img", {
				src: data.albumImageUrl,
				alt: "Album",
				className: "album-art"
			}), /* @__PURE__ */ jsxs("div", {
				className: "track-info",
				children: [/* @__PURE__ */ jsx("div", {
					className: "track-title-container",
					children: /* @__PURE__ */ jsx("div", {
						className: "track-title",
						children: data.title
					})
				}), /* @__PURE__ */ jsx("div", {
					className: "track-artist",
					children: data.artist
				})]
			})]
		}) : /* @__PURE__ */ jsx("div", {
			className: "spotify-loading",
			children: "Loading..."
		})]
	});
}
//#endregion
//#region src/components/react/About/DiscordWidget.tsx
function DiscordWidget({ discordId }) {
	const [data, setData] = useState(null);
	useEffect(() => {
		if (!discordId) return;
		const fetchLanyard = async () => {
			try {
				const res = await fetch(`https://api.lanyard.rest/v1/users/${discordId}`);
				if (res.ok) {
					const json = await res.json();
					setData(json.data);
				}
			} catch (err) {
				console.error("Error fetching Discord status", err);
			}
		};
		fetchLanyard();
		const interval = setInterval(fetchLanyard, 3e4);
		return () => clearInterval(interval);
	}, [discordId]);
	const statusColor = {
		online: "#43b581",
		idle: "#faa61a",
		dnd: "#f04747",
		offline: "#747f8d"
	}[data?.discord_status || "offline"];
	return /* @__PURE__ */ jsxs("div", {
		className: "discord-widget widget",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "discord-header",
			children: [/* @__PURE__ */ jsx("span", {
				className: "status-dot",
				style: { backgroundColor: statusColor }
			}), /* @__PURE__ */ jsx("span", { children: "DISCORD STATUS" })]
		}), /* @__PURE__ */ jsxs("div", {
			className: "discord-body",
			children: [/* @__PURE__ */ jsx("span", {
				className: "status-text",
				children: data?.discord_status ? data.discord_status.toUpperCase() : "LOADING..."
			}), data?.activities && data.activities.length > 0 && /* @__PURE__ */ jsx("div", {
				className: "activity-text",
				children: data.activities[0].name === "Custom Status" && data.activities[0].state ? `"${data.activities[0].state}"` : `Playing: ${data.activities[0].name}`
			})]
		})]
	});
}
//#endregion
//#region src/components/react/About/GitHubWidget.tsx
function GitHubWidget({ username }) {
	const [lastCommit, setLastCommit] = useState(null);
	useEffect(() => {
		if (!username) return;
		const fetchGitHub = async () => {
			try {
				const res = await fetch(`https://api.github.com/users/${username}/events/public`);
				if (res.ok) {
					const pushEvent = (await res.json()).find((e) => e.type === "PushEvent");
					if (pushEvent) {
						let message = "Push event (no commit details)";
						if (pushEvent.payload.commits && pushEvent.payload.commits.length > 0) message = pushEvent.payload.commits[pushEvent.payload.commits.length - 1].message;
						else if (pushEvent.payload.head) try {
							const commitRes = await fetch(`https://api.github.com/repos/${pushEvent.repo.name}/commits/${pushEvent.payload.head}`);
							if (commitRes.ok) message = (await commitRes.json()).commit.message;
						} catch (e) {
							console.error("Error fetching specific commit", e);
						}
						setLastCommit({
							message,
							repo: pushEvent.repo.name,
							date: new Date(pushEvent.created_at).toLocaleDateString()
						});
					} else setLastCommit({
						message: "No recent commits",
						repo: "Kyoronginus",
						date: (/* @__PURE__ */ new Date()).toLocaleDateString()
					});
				}
			} catch (err) {
				console.error("Error fetching GitHub events", err);
			}
		};
		fetchGitHub();
	}, [username]);
	return /* @__PURE__ */ jsxs("div", {
		className: "github-widget widget",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "github-header",
			children: [/* @__PURE__ */ jsx("img", {
				src: "/Assets/icons/pixel-code.svg",
				alt: "Code",
				className: "pixel-icon"
			}), /* @__PURE__ */ jsx("span", { children: "LATEST COMMIT" })]
		}), /* @__PURE__ */ jsx("div", {
			className: "github-body",
			children: lastCommit ? /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("div", {
				className: "commit-message-container",
				children: /* @__PURE__ */ jsxs("div", {
					className: "commit-message",
					children: [
						"\"",
						lastCommit.message,
						"\""
					]
				})
			}), /* @__PURE__ */ jsxs("div", {
				className: "commit-repo",
				children: [
					lastCommit.repo,
					" • ",
					lastCommit.date
				]
			})] }) : /* @__PURE__ */ jsx("span", {
				className: "github-loading",
				children: "Loading..."
			})
		})]
	});
}
//#endregion
//#region src/components/react/About/ArtWidget.tsx
var CACHE_KEY = "kyororoom_art_commit";
var CACHE_TTL_MS = 6e5;
function formatRelativeTime(epochSeconds) {
	const nowSeconds = Math.floor(Date.now() / 1e3);
	const diffSeconds = Math.max(0, nowSeconds - epochSeconds);
	const ONE_DAY_SECONDS = 86400;
	if (diffSeconds < ONE_DAY_SECONDS) {
		const hours = Math.floor(diffSeconds / 3600);
		return `${hours} hour${hours === 1 ? "" : "s"} ago`;
	} else {
		const days = Math.floor(diffSeconds / ONE_DAY_SECONDS);
		return `${days} day${days === 1 ? "" : "s"} ago`;
	}
}
function getArtTitle(storagePath) {
	if (!storagePath) return "";
	const match = (storagePath.split("/").pop() || "").match(/\d+_(.+?)_\d+_(?:thumb|full)\.png$/);
	return match && match[1] ? match[1] : "";
}
function ArtWidget() {
	const [art, setArt] = useState(null);
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		try {
			const cachedStr = localStorage.getItem(CACHE_KEY);
			if (cachedStr) {
				const cached = JSON.parse(cachedStr);
				if (Date.now() - cached.cachedAt < CACHE_TTL_MS && cached.data) {
					setArt(cached.data);
					setLoading(false);
					return;
				}
			}
		} catch {}
		const fetchArt = async () => {
			try {
				let res = await fetch("/api/art");
				if (!res.ok) res = await fetch("https://us-central1-oekakusa.cloudfunctions.net/api/users/NC9InoxB7HdZY6zSiKkNjaOc5Lc2/commits/latest");
				if (res.ok) {
					const data = await res.json();
					setArt(data);
					try {
						localStorage.setItem(CACHE_KEY, JSON.stringify({
							data,
							cachedAt: Date.now()
						}));
					} catch {}
				}
			} catch (err) {
				console.error("Error fetching latest art commit:", err);
			} finally {
				setLoading(false);
			}
		};
		fetchArt();
	}, []);
	const imageUrl = art?.thumbnail_small_url || art?.thumbnail_url;
	const linkUrl = art?.thumbnail_small_url || art?.thumbnail_url;
	const title = getArtTitle(art?.storage_small_path || art?.storage_path);
	return /* @__PURE__ */ jsxs("div", {
		className: "art-widget widget",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "art-header",
			children: [/* @__PURE__ */ jsx("img", {
				src: "/Assets/icons/pixel-art.svg",
				alt: "Art",
				className: "pixel-icon"
			}), /* @__PURE__ */ jsx("span", { children: "LATEST ART" })]
		}), /* @__PURE__ */ jsx("div", {
			className: "art-body",
			children: loading ? /* @__PURE__ */ jsx("span", {
				className: "art-loading",
				children: "Loading..."
			}) : art && imageUrl ? /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("a", {
				href: linkUrl,
				target: "_blank",
				rel: "noopener noreferrer",
				className: "art-image-link",
				title: "Click to view artwork",
				children: /* @__PURE__ */ jsx("img", {
					src: imageUrl,
					alt: "Latest art commit",
					className: "art-image",
					loading: "lazy"
				})
			}), /* @__PURE__ */ jsxs("div", {
				className: "art-footer",
				children: [title && /* @__PURE__ */ jsx("span", {
					className: "art-title",
					children: title
				}), /* @__PURE__ */ jsx("span", {
					className: "art-time",
					children: art.timestamp ? formatRelativeTime(art.timestamp) : ""
				})]
			})] }) : /* @__PURE__ */ jsx("span", {
				className: "art-loading",
				children: "No art commits found"
			})
		})]
	});
}
//#endregion
//#region src/components/astro/AboutSection.astro
var $$AboutSection = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${maybeRenderHead($$result)}<section id="about" class="about-section"><h1>ABOUT</h1><div class="about-grid"><div class="about-left"><div class="profile-icon"></div><button class="badge-btn">COMMISSION: OPEN</button><div class="mt-4">${renderComponent($$result, "SpotifyWidget", SpotifyWidget, {
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "/Users/tohru/Documents/Programming/Kyororoom/src/components/react/About/SpotifyWidget.tsx",
		"client:component-export": "default"
	})}</div><div class="mt-0">${renderComponent($$result, "DiscordWidget", DiscordWidget, {
		"client:load": true,
		"discordId": "980689739143327764",
		"client:component-hydration": "load",
		"client:component-path": "/Users/tohru/Documents/Programming/Kyororoom/src/components/react/About/DiscordWidget.tsx",
		"client:component-export": "default"
	})}</div><div class="mt-0">${renderComponent($$result, "GitHubWidget", GitHubWidget, {
		"client:load": true,
		"username": "Kyoronginus",
		"client:component-hydration": "load",
		"client:component-path": "/Users/tohru/Documents/Programming/Kyororoom/src/components/react/About/GitHubWidget.tsx",
		"client:component-export": "default"
	})}</div><div class="mt-0">${renderComponent($$result, "ArtWidget", ArtWidget, {
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "/Users/tohru/Documents/Programming/Kyororoom/src/components/react/About/ArtWidget.tsx",
		"client:component-export": "default"
	})}</div></div><div class="about-right"><h3 class="name">PROFILE</h3><p class="intro-text">Hi, I'm Kyoronginus! This is my tiny personal website, thanks for visiting.<br><br>I love doing creative stuffs as my hobby. Digital drawing is most of the part, but I also enjoy random things like coding and 3D modeling when I feel like it (yeah just call me jack of all trades but don't with master of none). Some quick facts about me:</p><p class="intro-text"></p><p class="intro-text"><ul><li>I'm Japanese-Indonesian. Born in Japan, but currently living in Indonesia.</li><li>Japanese is my native language, but I also speak Indonesian and English.</li><li>I'm a Computer Science Bachelor Undergraduate student.</li><li>Everyone calls me Kyoro, and you can call me the same!</li><li>I'm a night owl. My brain works best at night, so I usually stay up late when I'm available to do so. But the modern society these days doesn't allow me to do so everyday so I'm cooked</li><li>I use Clip Studio Paint Pro and Wacom Intuos CTL-4100WL for drawing.</li></ul></p></div></div></section>`;
}, "/Users/tohru/Documents/Programming/Kyororoom/src/components/astro/AboutSection.astro", void 0);
//#endregion
//#region src/components/astro/MediaBanner.astro
createAstro("https://astro.build");
var $$MediaBanner = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$MediaBanner;
	const { type, src, alt = "Media Banner" } = Astro.props;
	return renderTemplate`${maybeRenderHead($$result)}<section class="media-banner-section" data-astro-cid-jubjw5u7>${type === "video" ? renderTemplate`<video class="media-banner"${addAttribute(src, "src")} autoplay loop muted playsinline data-astro-cid-jubjw5u7></video>` : renderTemplate`<img class="media-banner"${addAttribute(src, "src")}${addAttribute(alt, "alt")} data-astro-cid-jubjw5u7>`}</section>`;
}, "/Users/tohru/Documents/Programming/Kyororoom/src/components/astro/MediaBanner.astro", void 0);
//#endregion
//#region src/components/react/Contact/VisitorCounter.tsx
function VisitorCounter() {
	const [views, setViews] = useState(null);
	useEffect(() => {
		const fetchViews = async () => {
			try {
				const res = await fetch("/api/views");
				if (res.ok) {
					const data = await res.json();
					setViews(data.views);
				}
			} catch (err) {
				console.error("Failed to fetch views", err);
			}
		};
		fetchViews();
	}, []);
	return /* @__PURE__ */ jsxs("div", {
		className: "visitor-counter widget",
		children: [/* @__PURE__ */ jsx("div", {
			className: "counter-label",
			children: "YOU ARE VISITOR NO."
		}), /* @__PURE__ */ jsx("div", {
			className: "counter-display",
			children: views !== null ? String(views).padStart(6, "0") : "------"
		})]
	});
}
//#endregion
//#region src/pages/index.astro
var pages_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => ""
});
var $$Index = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`<html lang="ja"><head><meta charset="UTF-8"><title>kyororoom</title>${renderHead($$result)}</head><body>${renderComponent($$result, "MorphingTopo", null, {
		"client:only": "react",
		"client:component-hydration": "only",
		"client:component-path": "/Users/tohru/Documents/Programming/Kyororoom/src/components/react/Background/MorphingTopo.tsx",
		"client:component-export": "default"
	})}<!-- Navbar --><nav class="navbar"><div class="logo"><h2 class="my-0">KYOROROOM</h2></div><div class="nav-links"><a href="#works">WORKS</a><a href="#about">ABOUT</a><a href="#blog">BLOG</a><a href="#projects">PROJECTS</a><a href="#contact">CONTACT</a></div></nav><!-- TICKER (流れる掲示板) -->${renderComponent($$result, "Ticker", Ticker, {
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "/Users/tohru/Documents/Programming/Kyororoom/src/components/react/Hero/Ticker.tsx",
		"client:component-export": "default"
	})}<!-- HOME (横スクロールギャラリー) --><section id="home">${renderComponent($$result, "HeroCarousel", HeroCarousel, {
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "/Users/tohru/Documents/Programming/Kyororoom/src/components/react/Hero/HeroCarousel.tsx",
		"client:component-export": "default"
	})}</section><main><div class="banner-container flex flex-wrap gap-2">${renderComponent($$result, "MediaBanner", $$MediaBanner, {
		"type": "image",
		"src": "/Assets/Hero/Video/Uchinoko Kawaii.gif",
		"alt": "Animated Banner"
	})}${renderComponent($$result, "MediaBanner", $$MediaBanner, {
		"type": "image",
		"src": "/Assets/Hero/Etc/idolized.png",
		"alt": "Static Banner"
	})}${renderComponent($$result, "MediaBanner", $$MediaBanner, {
		"type": "image",
		"src": "/Assets/Hero/Video/oekakusa.gif",
		"alt": "Animated Banner"
	})}<!-- <MediaBanner type="image" src="/Assets/Hero/Etc/oekakusa.png" alt="Static Banner" /> --></div><!-- ABOUT -->${renderComponent($$result, "AboutSection", $$AboutSection, {})}<!-- BLOG --><section id="blog"><h1>BLOG (PATREON?)</h1><div class="blog-list"><div class="blog-item"><span class="date">2026.6.1</span><div class="blog-thumb"></div><span class="title">Blog post title...</span><span class="arrow">-></span></div><div class="blog-item"><span class="date">2026.5.20</span><div class="blog-thumb"></div><span class="title">Another post...</span><span class="arrow">-></span></div><div class="view-more"><a href="#">VIEW MORE</a></div></div></section><!-- WORKS --><section id="works"><h1>WORKS</h1><div class="works-grid"><div class="work-item"></div><div class="work-item"></div><div class="work-item"></div><div class="work-item"></div><div class="work-item"></div><div class="work-item"></div><div class="work-item"></div><div class="work-item"></div></div></section><!-- PROJECTS --><section id="projects"><h1>PROJECTS</h1><div class="projects-grid"><div class="project-item">UCHINOKO KAWAII</div><div class="project-item">FIBONACCI <span class="arrow">-></span></div><div class="project-item">OEKAKUSA</div><div class="project-item">... <span class="arrow">-></span></div></div></section><!-- CONTACTS --><section id="contacts"><h1>CONTACTS</h1><div class="contact-links"><div class="social-icon">X</div><div class="social-icon">Discord server</div></div><div class="contact-badges"><button class="badge-btn">OC Gallery</button><button class="badge-btn">...</button><button class="badge-btn">...</button></div><div style="margin-top: 2rem; display: flex; ">${renderComponent($$result, "VisitorCounter", VisitorCounter, {
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "/Users/tohru/Documents/Programming/Kyororoom/src/components/react/Contact/VisitorCounter.tsx",
		"client:component-export": "default"
	})}</div></section></main></body></html>`;
}, "/Users/tohru/Documents/Programming/Kyororoom/src/pages/index.astro", void 0);
var $$file = "/Users/tohru/Documents/Programming/Kyororoom/src/pages/index.astro";
//#endregion
//#region \0virtual:astro:page:src/pages/index@_@astro
var page = () => pages_exports;
//#endregion
export { page };
