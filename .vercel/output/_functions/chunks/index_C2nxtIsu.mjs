import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { d as renderHead, i as renderComponent, l as renderTemplate, u as maybeRenderHead } from "./server_C-PK2OEm.mjs";
import { t as createComponent } from "./compiler_zyFMNQyq.mjs";
import { useEffect, useState } from "react";
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
	"public/Assets/Hero/6.png",
	"public/Assets/Hero/7.png",
	"public/Assets/Hero/8.png",
	"public/Assets/Hero/1.png",
	"public/Assets/Hero/2.png",
	"public/Assets/Hero/3.png",
	"public/Assets/Hero/4.png",
	"public/Assets/Hero/5.png"
];
function HeroCarousel() {
	return /* @__PURE__ */ jsx("div", {
		className: "hero-carousel-container",
		children: /* @__PURE__ */ jsx("div", {
			className: "hero-carousel-track",
			children: images.map((src, index) => /* @__PURE__ */ jsx("div", {
				className: "hero-carousel-item",
				children: /* @__PURE__ */ jsx("img", {
					src,
					alt: `Artwork ${index}`
				})
			}, index))
		})
	});
}
//#endregion
//#region src/components/react/About/SpotifyWidget.tsx
function SpotifyWidget() {
	const [data, setData] = useState(null);
	useEffect(() => {
		const fetchSpotify = async () => {
			try {
				const res = await fetch("/api/spotify");
				if (res.ok) {
					const json = await res.json();
					setData(json);
				}
			} catch (err) {
				console.error("Error fetching Spotify data", err);
			}
		};
		fetchSpotify();
		const interval = setInterval(fetchSpotify, 15e3);
		return () => clearInterval(interval);
	}, []);
	return /* @__PURE__ */ jsxs("div", {
		className: "spotify-widget",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "spotify-header",
			children: [/* @__PURE__ */ jsx("span", {
				className: "spotify-icon",
				children: "♪"
			}), /* @__PURE__ */ jsx("span", { children: data?.isPlaying ? "Now Playing" : "Last Song" })]
		}), data ? /* @__PURE__ */ jsxs("a", {
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
					if (pushEvent && pushEvent.payload.commits && pushEvent.payload.commits.length > 0) setLastCommit({
						message: pushEvent.payload.commits[pushEvent.payload.commits.length - 1].message,
						repo: pushEvent.repo.name,
						date: new Date(pushEvent.created_at).toLocaleDateString()
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
			children: [/* @__PURE__ */ jsx("span", {
				className: "github-icon",
				children: "GH"
			}), /* @__PURE__ */ jsx("span", { children: "LATEST COMMIT" })]
		}), /* @__PURE__ */ jsx("div", {
			className: "github-body",
			children: lastCommit ? /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("div", {
				className: "commit-message",
				children: [
					"\"",
					lastCommit.message,
					"\""
				]
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
//#region src/components/astro/AboutSection.astro
var $$AboutSection = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${maybeRenderHead($$result)}<section id="about" class="about-section"><h1>ABOUT</h1><div class="about-grid"><div class="about-left"><div class="profile-icon"></div><button class="badge-btn">COMMISSION: OPEN</button><div class="mt-4">${renderComponent($$result, "SpotifyWidget", SpotifyWidget, {
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "/Users/tohru/Documents/Programming/Kyororoom/src/components/react/About/SpotifyWidget.tsx",
		"client:component-export": "default"
	})}</div><div class="mt-0">${renderComponent($$result, "DiscordWidget", DiscordWidget, {
		"client:load": true,
		"discordId": "YOUR_DISCORD_ID",
		"client:component-hydration": "load",
		"client:component-path": "/Users/tohru/Documents/Programming/Kyororoom/src/components/react/About/DiscordWidget.tsx",
		"client:component-export": "default"
	})}</div><div class="mt-0">${renderComponent($$result, "GitHubWidget", GitHubWidget, {
		"client:load": true,
		"username": "tohrudjunaedisato",
		"client:component-hydration": "load",
		"client:component-path": "/Users/tohru/Documents/Programming/Kyororoom/src/components/react/About/GitHubWidget.tsx",
		"client:component-export": "default"
	})}</div></div><div class="about-right"><h3 class="name">PROFILE</h3><p class="intro-text">Hi, I'm Kyoronginus! This is my tiny personal website, thanks for visiting.<br><br>I love doing creative stuffs as my hobby. Digital drawing is most of the part, but I also enjoy random things like coding and 3D modeling when I feel like it (yeah just call me jack of all trades but don't with master of none). Some quick facts about me:</p><p class="intro-text"></p><p class="intro-text"><ul><li>I'm Japanese-Indonesian. Born in Japan, but currently living in Indonesia.</li><li>Japanese is my native language, but I also speak Indonesian and English.</li><li>I'm a Computer Science Bachelor Undergraduate student.</li><li>Everyone calls me Kyoro, and you can call me the same!</li><li>I'm a night owl. My brain works best at night, so I usually stay up late when I'm available to do so. But the modern society these days doesn't allow me to do so everyday so I'm cooked</li><li>I use Clip Studio Paint Pro and Wacom Intuos CTL-4100WL for drawing.</li></ul></p></div></div></section>`;
}, "/Users/tohru/Documents/Programming/Kyororoom/src/components/astro/AboutSection.astro", void 0);
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
	return renderTemplate`<html lang="ja"><head><meta charset="UTF-8"><title>kyororoom</title>${renderHead($$result)}</head><body><!-- Navbar --><nav class="navbar"><div class="logo"><h2 class="my-0">KYOROROOM</h2></div><div class="nav-links"><a href="#works">WORKS</a><a href="#about">ABOUT</a><a href="#blog">BLOG</a><a href="#projects">PROJECTS</a><a href="#contact">CONTACT</a></div></nav><!-- TICKER (流れる掲示板) -->${renderComponent($$result, "Ticker", Ticker, {
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "/Users/tohru/Documents/Programming/Kyororoom/src/components/react/Hero/Ticker.tsx",
		"client:component-export": "default"
	})}<!-- HOME (横スクロールギャラリー) --><section id="home">${renderComponent($$result, "HeroCarousel", HeroCarousel, {
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "/Users/tohru/Documents/Programming/Kyororoom/src/components/react/Hero/HeroCarousel.tsx",
		"client:component-export": "default"
	})}</section><main><!-- ABOUT -->${renderComponent($$result, "AboutSection", $$AboutSection, {})}<!-- BLOG --><section id="blog"><h1>BLOG (PATREON?)</h1><div class="blog-list"><div class="blog-item"><span class="date">2026.6.1</span><div class="blog-thumb"></div><span class="title">Blog post title...</span><span class="arrow">-></span></div><div class="blog-item"><span class="date">2026.5.20</span><div class="blog-thumb"></div><span class="title">Another post...</span><span class="arrow">-></span></div><div class="view-more"><a href="#">VIEW MORE</a></div></div></section><!-- WORKS --><section id="works"><h1>WORKS</h1><div class="works-grid"><div class="work-item"></div><div class="work-item"></div><div class="work-item"></div><div class="work-item"></div><div class="work-item"></div><div class="work-item"></div><div class="work-item"></div><div class="work-item"></div></div></section><!-- PROJECTS --><section id="projects"><h1>PROJECTS</h1><div class="projects-grid"><div class="project-item">UCHINOKO KAWAII</div><div class="project-item">FIBONACCI <span class="arrow">-></span></div><div class="project-item">OEKAKUSA</div><div class="project-item">... <span class="arrow">-></span></div></div></section><!-- CONTACTS --><section id="contacts"><h1>CONTACTS</h1><div class="contact-links"><div class="social-icon">X</div><div class="social-icon">Discord server</div></div><div class="contact-badges"><button class="badge-btn">OC Gallery</button><button class="badge-btn">...</button><button class="badge-btn">...</button></div><div style="margin-top: 2rem; display: flex; ">${renderComponent($$result, "VisitorCounter", VisitorCounter, {
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
