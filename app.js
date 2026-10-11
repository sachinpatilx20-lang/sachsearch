/**
 * SACH.IN - Ultra-Sharp Monochrome Feature Engine
 * High-performance, zero-fluff integration of search, IMDb autosuggest,
 * app tiles, watch later, saved links, and YouTube results.
 */

(function () {
    'use strict';

    /* ==========================================================================
       APP ENGINES & TILES
       ========================================================================== */
    const DEFAULT_APPS = [
        // Original Movie Engines
        ["RogMovies",   "https://rogmovies.one/search.html?q=", false, "https://www.google.com/s2/favicons?domain=rogmovies.one&sz=64", "def_rog", false],
        ["VegaMovies",  "https://vegamovies.gallery/search.html?q=", false, "https://www.google.com/s2/favicons?domain=vegamovies.gallery&sz=64", "def_vega", false],
        ["MultiMovies", "https://multimovies.garden/search?q=", false, "https://www.google.com/s2/favicons?domain=multimovies.garden&sz=64", "def_multi", false],
        ["Flixeo",      "https://flixeo.tv/search?q=", false, "https://www.google.com/s2/favicons?domain=flixeo.tv&sz=64", "def_flixeo", false],
        ["CineJoy",     "https://cinejoy.pk/search/", false, "https://www.google.com/s2/favicons?domain=cinejoy.pk&sz=64", "def_cinejoy", false],
        ["Movy.sx",     "https://www.movy.sx/search/", false, "https://www.google.com/s2/favicons?domain=movy.sx&sz=64", "def_movy", false],

        // Major Platforms & Streamers
        ["Netflix",     "https://www.netflix.com/search?q=", false, "https://www.google.com/s2/favicons?domain=netflix.com&sz=64", "def_netflix", false],
        ["Hotstar",     "https://www.hotstar.com/in/explore?search_query=", false, "https://www.google.com/s2/favicons?domain=hotstar.com&sz=64", "def_hotstar", false],
        ["Prime Video", "https://www.primevideo.com/search?ie=UTF8&ref_=atv_nb_sug&phrase=", false, "https://www.google.com/s2/favicons?domain=primevideo.com&sz=64", "def_prime", false],
        ["ZEE5",        "https://www.zee5.com/search?q=", false, "https://www.google.com/s2/favicons?domain=zee5.com&sz=64", "def_zee5", false],
        ["SonyLIV",     "https://www.sonyliv.com/search?q=", false, "https://www.google.com/s2/favicons?domain=sonyliv.com&sz=64", "def_sonyliv", false],
        ["YouTube",     "https://www.youtube.com/results?search_query=", false, "https://www.google.com/s2/favicons?domain=youtube.com&sz=64", "def_youtube", false],
        ["Spotify",     "https://open.spotify.com/search/", false, "https://www.google.com/s2/favicons?domain=spotify.com&sz=64", "def_spotify", false],
        ["Google",      "https://www.google.com/search?q=", false, "https://www.google.com/s2/favicons?domain=google.com&sz=64", "def_google", false],
        ["WhatsApp",    "https://web.whatsapp.com/", true, "https://www.google.com/s2/favicons?domain=whatsapp.com&sz=64", "def_whatsapp", false],
        ["Telegram",    "https://web.telegram.org/", true, "https://www.google.com/s2/favicons?domain=web.telegram.org&sz=64", "def_telegram", false],
        ["Instagram",   "https://instagram.com/", true, "https://www.google.com/s2/favicons?domain=instagram.com&sz=64", "def_instagram", false],
        ["IMDb",        "https://www.imdb.com/find/?q=", false, "https://www.google.com/s2/favicons?domain=imdb.com&sz=64", "def_imdb", false],
        ["JustWatch",   "https://www.justwatch.com/in/search?q=", false, "https://www.google.com/s2/favicons?domain=justwatch.com&sz=64", "def_justwatch", false],
        ["X",           "https://x.com/search?q=", false, "https://www.google.com/s2/favicons?domain=x.com&sz=64", "def_x", false],
        ["Reddit",      "https://www.reddit.com/search/?q=", false, "https://www.google.com/s2/favicons?domain=reddit.com&sz=64", "def_reddit", false]
    ];

    const CUSTOM_APPS_KEY = "sach_custom_apps_v3";
    const HISTORY_KEY     = "sach_history_v3";

    function getCustomApps() {
        try {
            const raw = localStorage.getItem(CUSTOM_APPS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch { return []; }
    }
    function saveCustomApps(list) {
        try { localStorage.setItem(CUSTOM_APPS_KEY, JSON.stringify(list)); } catch {}
    }

    let APPS = [...DEFAULT_APPS, ...getCustomApps()];

    /* ==========================================================================
       DOM REFERENCES
       ========================================================================== */
    const input               = document.getElementById("search-input");
    const searchButton        = document.getElementById("search-button");
    const searchClear         = document.getElementById("search-clear");
    const box                 = document.getElementById("suggestions");
    const appsEl              = document.getElementById("apps");
    const activeCountEl       = document.getElementById("active-count");
    const currentQueryDisplay = document.getElementById("current-query-display");
    const recentTagsEl        = document.getElementById("recent-tags");
    const clearHistoryBtn     = document.getElementById("btn-clear-history");
    const btnResetSources     = document.getElementById("btn-reset-sources");

    // Watch Later DOM
    const wlToggleBtn         = document.getElementById("wlToggleBtn");
    const wlBadge             = document.getElementById("wlBadge");
    const wlSection           = document.getElementById("wlSection");
    const wlCountText         = document.getElementById("wlCountText");
    const wlClearBtn          = document.getElementById("wlClearBtn");
    const wlList              = document.getElementById("wlList");

    // Saved Links DOM
    const linksToggleBtn      = document.getElementById("linksToggleBtn");
    const linksBadge          = document.getElementById("linksBadge");
    const linksSection        = document.getElementById("linksSection");
    const linksCountText      = document.getElementById("linksCountText");
    const linksClearBtn       = document.getElementById("linksClearBtn");
    const linksRefreshAllBtn  = document.getElementById("linksRefreshAllBtn");
    const linksList           = document.getElementById("linksList");

    // Add App Box DOM
    const addAppToggleBtn     = document.getElementById("addAppToggleBtn");
    const addAppBox           = document.getElementById("addAppBox");
    const addAppUrlInput      = document.getElementById("addAppUrlInput");
    const addAppNameInput     = document.getElementById("addAppNameInput");
    const addAppDirectCheck   = document.getElementById("addAppDirectCheck");
    const addAppSubmitBtn     = document.getElementById("addAppSubmitBtn");
    const addAppCancelBtn     = document.getElementById("addAppCancelBtn");
    const addAppStatus        = document.getElementById("addAppStatus");

    // YouTube DOM
    const ytSection           = document.getElementById("ytSection");
    const ytStatus            = document.getElementById("ytStatus");
    const ytList              = document.getElementById("ytList");

    const toastContainer      = document.getElementById("toast-container");

    /* ==========================================================================
       HELPERS & STORAGE
       ========================================================================== */
    function showToast(msg) {
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.textContent = msg;
        toastContainer.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add("show"));
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 200);
        }, 2200);
    }

    function isUrlLike(str) {
        const s = (str || "").trim();
        if (!s || s.includes(" ")) return false;
        return /^https?:\/\//i.test(s) || /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/i.test(s);
    }

    function targetUrl(app) {
        const q = input.value.trim();
        if (!app) return "https://www.google.com/search?q=" + encodeURIComponent(q);
        const [, base, noSearch] = app;
        return (noSearch || !q) ? base : base + encodeURIComponent(q);
    }

    function escapeHtml(str) {
        return (str || '').replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
        }[m]));
    }

    /* History management */
    function loadHistory() {
        try {
            const raw = localStorage.getItem(HISTORY_KEY);
            return raw ? JSON.parse(raw).slice(0, 8) : [];
        } catch { return []; }
    }
    function saveHistory(list) {
        try { localStorage.setItem(HISTORY_KEY, JSON.stringify(list)); } catch {}
    }
    function addHistory(q) {
        const query = q.trim();
        if (!query) return;
        const list = [query, ...loadHistory().filter(x => x.toLowerCase() !== query.toLowerCase())].slice(0, 8);
        saveHistory(list);
        renderHistory();
    }
    function renderHistory() {
        const list = loadHistory();
        recentTagsEl.innerHTML = "";
        if (!list.length) {
            recentTagsEl.innerHTML = '<span style="font-size:11px;color:var(--text-low);">None</span>';
            return;
        }
        list.forEach(item => {
            const tag = document.createElement("span");
            tag.className = "recent-tag";
            tag.textContent = item;
            tag.addEventListener("click", () => {
                input.value = item;
                syncAppLinks();
                scheduleYouTube();
                input.focus();
            });
            recentTagsEl.appendChild(tag);
        });
    }

    /* ==========================================================================
       APPS TILES RENDERING
       ========================================================================== */
    let appLinks = [];
    function renderApps() {
        appsEl.innerHTML = "";
        appLinks = [];
        APPS = [...DEFAULT_APPS, ...getCustomApps()];

        APPS.forEach(app => {
            const [name, , , iconUrl, id, isCustom] = app;
            const wrap = document.createElement("div");
            wrap.className = "app-tile-wrap";

            const a = document.createElement("a");
            a.className = "app-tile";
            a.href = targetUrl(app);
            a.target = "_blank";
            a.rel = "noopener";
            a.title = name;

            const img = document.createElement("img");
            img.src = iconUrl;
            img.alt = "";
            img.loading = "lazy";
            img.onerror = () => { img.style.display = "none"; };

            const span = document.createElement("span");
            span.textContent = name;

            a.append(img, span);
            wrap.appendChild(a);
            appLinks.push({ el: a, app });

            if (isCustom) {
                const del = document.createElement("button");
                del.className = "app-del-btn";
                del.type = "button";
                del.innerHTML = "×";
                del.title = "Remove " + name;
                del.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const updated = getCustomApps().filter(x => x[4] !== id);
                    saveCustomApps(updated);
                    renderApps();
                    showToast("Removed");
                });
                wrap.appendChild(del);
            }

            appsEl.appendChild(wrap);
        });

        if (activeCountEl) activeCountEl.textContent = `${APPS.length} ENGINES`;
    }

    function syncAppLinks() {
        appLinks.forEach(({ el, app }) => { el.href = targetUrl(app); });
        const q = input.value.trim();
        if (searchClear) searchClear.classList.toggle("visible", q.length > 0);
        if (currentQueryDisplay) currentQueryDisplay.textContent = q ? `"${q}"` : "READY";
    }

    /* ==========================================================================
       ADD APP / ENGINE LOGIC
       ========================================================================== */
    function toggleAddAppBox(force) {
        const open = force !== undefined ? force : addAppBox.style.display === "none";
        addAppBox.style.display = open ? "flex" : "none";
        if (addAppToggleBtn) addAppToggleBtn.classList.toggle("active", open);
        if (open) {
            addAppUrlInput.focus();
            addAppStatus.textContent = "";
        }
    }

    async function handleAddApp() {
        let raw = (addAppUrlInput.value || "").trim();
        if (!raw) {
            addAppStatus.className = "form-status error";
            addAppStatus.textContent = "URL required";
            return;
        }
        if (!/^https?:\/\//i.test(raw)) raw = "https://" + raw;

        let domain = "";
        try { domain = new URL(raw).hostname.replace(/^www\./, ""); } catch { domain = raw; }

        let name = (addAppNameInput.value || "").trim();
        if (!name) {
            const brand = domain.split(".")[0];
            name = brand.charAt(0).toUpperCase() + brand.slice(1);
        }

        const isDirect = addAppDirectCheck.checked;
        const iconUrl = "https://www.google.com/s2/favicons?domain=" + encodeURIComponent(domain) + "&sz=64";

        const customApp = [
            name,
            raw.includes("{q}") ? raw.replace("{q}", "") : raw,
            isDirect,
            iconUrl,
            "app_" + Date.now(),
            true
        ];

        const list = getCustomApps();
        list.push(customApp);
        saveCustomApps(list);

        renderApps();
        syncAppLinks();

        addAppStatus.className = "form-status success";
        addAppStatus.textContent = "Added: " + name;
        addAppUrlInput.value = "";
        addAppNameInput.value = "";
        addAppDirectCheck.checked = false;

        setTimeout(() => toggleAddAppBox(false), 1000);
    }

    /* ==========================================================================
       IMDb AUTOSUGGEST (ZERO-CORS JSONP & PROXY)
       ========================================================================== */
    function imdbNorm(q) {
        return (q || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    }

    function _imdbJsonp(norm) {
        return new Promise(res => {
            const cb = "imdb$" + norm;
            const s = document.createElement("script");
            const tid = setTimeout(() => { delete window[cb]; s.remove(); res(null); }, 3000);
            const done = d => {
                clearTimeout(tid);
                delete window[cb];
                s.remove();
                res(d);
            };
            window[cb] = data => done(data && Array.isArray(data.d) ? data.d : null);
            s.onerror = () => done(null);
            s.src = "https://sg.media-imdb.com/suggests/" + norm.charAt(0) + "/" + encodeURIComponent(norm) + ".json";
            document.head.appendChild(s);
        });
    }

    async function getImdbSuggestions(query) {
        const norm = imdbNorm(query);
        if (!norm) return [];
        let items = await _imdbJsonp(norm);
        return items || [];
    }

    function dismissSuggestions() {
        if (box) {
            box.style.display = "none";
            box.innerHTML = "";
        }
    }

    function getImdbImageUrl(item) {
        if (!item || !item.i) return null;
        if (Array.isArray(item.i)) return item.i[0] || null;
        if (typeof item.i === "string") return item.i;
        return item.i.imageUrl || null;
    }

    function showSuggestions(items, query = "") {
        box.innerHTML = "";

        // Smart URL detection row
        if (query && isUrlLike(query)) {
            const row = document.createElement("div");
            row.className = "sug-row";
            row.innerHTML = `
                <div class="sug-thumb-ph">⎘</div>
                <div class="sug-text">
                    <div class="sug-title">Save link URL with metadata</div>
                    <div class="sug-meta">${escapeHtml(query)}</div>
                </div>
                <div class="sug-actions">
                    <button type="button" class="sug-btn">Save</button>
                </div>
            `;
            row.addEventListener("click", () => {
                dismissSuggestions();
                handleSaveUrl(query);
                input.value = "";
                syncAppLinks();
            });
            box.appendChild(row);
        }

        if (!items || !items.length) {
            box.style.display = box.children.length ? "block" : "none";
            return;
        }

        items.slice(0, 6).forEach(item => {
            const row = document.createElement("div");
            row.className = "sug-row";

            const imgUrl = getImdbImageUrl(item);
            if (imgUrl) {
                const img = document.createElement("img");
                img.className = "sug-thumb";
                img.src = imgUrl;
                img.loading = "lazy";
                row.appendChild(img);
            } else {
                const ph = document.createElement("div");
                ph.className = "sug-thumb-ph";
                ph.textContent = "🎬";
                row.appendChild(ph);
            }

            const textWrap = document.createElement("div");
            textWrap.className = "sug-text";

            const tEl = document.createElement("div");
            tEl.className = "sug-title";
            tEl.textContent = item.l;

            const mEl = document.createElement("div");
            mEl.className = "sug-meta";
            mEl.textContent = [item.y, item.q, item.s].filter(Boolean).join(" · ");

            textWrap.append(tEl, mEl);
            row.appendChild(textWrap);

            const actions = document.createElement("div");
            actions.className = "sug-actions";

            if (item.id) {
                const wlBtn = document.createElement("button");
                wlBtn.className = "sug-btn" + (isWatchLater(item.id) ? " saved" : "");
                wlBtn.type = "button";
                wlBtn.textContent = isWatchLater(item.id) ? "Saved" : "Later";
                wlBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    toggleWatchLater({
                        id: item.id,
                        type: "imdb",
                        title: item.l,
                        channel: [item.y, item.q].filter(Boolean).join(" · "),
                        length: "",
                        thumbUrl: imgUrl || ""
                    });
                });
                actions.appendChild(wlBtn);

                const link = document.createElement("a");
                link.className = "sug-btn";
                link.href = "https://www.imdb.com/title/" + encodeURIComponent(item.id) + "/";
                link.target = "_blank";
                link.rel = "noopener";
                link.textContent = "↗";
                link.addEventListener("click", e => e.stopPropagation());
                actions.appendChild(link);
            }

            row.appendChild(actions);

            row.addEventListener("click", () => {
                input.value = item.l;
                dismissSuggestions();
                syncAppLinks();
                scheduleYouTube();
                addHistory(item.l);
            });

            box.appendChild(row);
        });

        box.style.display = "block";
    }

    /* ==========================================================================
       WATCH LATER (PERSISTENT & CACHED)
       ========================================================================== */
    const WL_STORAGE_KEY = "sach_wl_v3";
    const SEED_WL = [
        {
            id: "mqqft2x_Aa4",
            type: "yt",
            title: "THE BATMAN — Main Trailer",
            channel: "Warner Bros. Pictures",
            length: "2:38",
            thumbUrl: "https://i.ytimg.com/vi/mqqft2x_Aa4/mqdefault.jpg"
        },
        {
            id: "Way9Dexny3w",
            type: "yt",
            title: "Dune: Part Two | Official Trailer 3",
            channel: "Warner Bros. Pictures",
            length: "2:52",
            thumbUrl: "https://i.ytimg.com/vi/Way9Dexny3w/mqdefault.jpg"
        }
    ];

    function getWatchLater() {
        try {
            const raw = localStorage.getItem(WL_STORAGE_KEY);
            return raw ? JSON.parse(raw) : SEED_WL;
        } catch { return SEED_WL; }
    }
    function saveWatchLater(items) {
        try { localStorage.setItem(WL_STORAGE_KEY, JSON.stringify(items)); } catch {}
        renderWatchLater();
    }
    function isWatchLater(id) {
        return getWatchLater().some(x => x.id === id);
    }
    function toggleWatchLater(item) {
        const list = getWatchLater();
        const idx = list.findIndex(x => x.id === item.id);
        if (idx >= 0) {
            list.splice(idx, 1);
            showToast("Removed from Watch Later");
        } else {
            list.unshift(item);
            showToast("Saved to Watch Later");
        }
        saveWatchLater(list);
    }

    function renderWatchLater() {
        const items = getWatchLater();
        if (wlBadge) wlBadge.textContent = items.length;
        if (wlCountText) wlCountText.textContent = items.length;
        if (wlToggleBtn) wlToggleBtn.classList.toggle("has-items", items.length > 0);

        wlList.innerHTML = "";
        if (!items.length) {
            wlList.innerHTML = '<div class="empty-state">No items in Watch Later</div>';
            return;
        }

        items.forEach(item => {
            const a = document.createElement("a");
            a.className = "content-card";
            a.target = "_blank";
            a.rel = "noopener";
            a.href = item.type === "imdb"
                ? "https://www.imdb.com/title/" + encodeURIComponent(item.id) + "/"
                : "https://www.youtube.com/watch?v=" + encodeURIComponent(item.id);

            const removeBtn = document.createElement("button");
            removeBtn.className = "card-btn-action remove";
            removeBtn.type = "button";
            removeBtn.innerHTML = "×";
            removeBtn.title = "Remove";
            removeBtn.addEventListener("click", e => {
                e.preventDefault();
                e.stopPropagation();
                toggleWatchLater(item);
            });
            a.appendChild(removeBtn);

            const thumbWrap = document.createElement("div");
            thumbWrap.className = "card-thumb-wrap" + (item.type === "imdb" ? " poster-wrap" : "");

            if (item.thumbUrl) {
                const img = document.createElement("img");
                img.src = item.thumbUrl;
                img.alt = "";
                img.loading = "lazy";
                thumbWrap.appendChild(img);
            }

            if (item.length) {
                const badge = document.createElement("span");
                badge.className = "card-badge-right";
                badge.textContent = item.length;
                thumbWrap.appendChild(badge);
            }

            const typeBadge = document.createElement("span");
            typeBadge.className = "card-badge-left";
            typeBadge.textContent = item.type.toUpperCase();
            thumbWrap.appendChild(typeBadge);

            const meta = document.createElement("div");
            meta.className = "card-meta";

            const t = document.createElement("div");
            t.className = "card-title";
            t.textContent = item.title;

            const sub = document.createElement("div");
            sub.className = "card-sub";
            sub.textContent = item.channel;

            meta.append(t, sub);
            a.append(thumbWrap, meta);
            wlList.appendChild(a);
        });
    }

    /* ==========================================================================
       SAVED LINKS WITH METADATA
       ========================================================================== */
    const LINKS_STORAGE_KEY = "sach_links_v3";
    const SEED_LINKS = [
        {
            id: "link_gh",
            url: "https://github.com",
            domain: "github.com",
            title: "GitHub: Let's build from here",
            description: "The AI-powered developer platform to build and scale software.",
            image: "https://opengraph.githubassets.com/1/github",
            favicon: "https://www.google.com/s2/favicons?domain=github.com&sz=64"
        },
        {
            id: "link_hn",
            url: "https://news.ycombinator.com",
            domain: "ycombinator.com",
            title: "Hacker News",
            description: "Technology & startup news community.",
            image: "https://s0.wp.com/mshots/v1/https%3A%2F%2Fnews.ycombinator.com?w=640",
            favicon: "https://www.google.com/s2/favicons?domain=news.ycombinator.com&sz=64"
        }
    ];

    function getSavedLinks() {
        try {
            const raw = localStorage.getItem(LINKS_STORAGE_KEY);
            return raw ? JSON.parse(raw) : SEED_LINKS;
        } catch { return SEED_LINKS; }
    }
    function saveSavedLinks(items) {
        try { localStorage.setItem(LINKS_STORAGE_KEY, JSON.stringify(items)); } catch {}
        renderSavedLinks();
    }

    async function handleSaveUrl(rawUrl) {
        let url = (rawUrl || "").trim();
        if (!url) return;
        if (!/^https?:\/\//i.test(url)) url = "https://" + url;

        let domain = "";
        try { domain = new URL(url).hostname.replace(/^www\./, ""); } catch { domain = url; }

        const item = {
            id: "link_" + Date.now(),
            url: url,
            domain: domain,
            title: domain,
            description: url,
            image: "https://s0.wp.com/mshots/v1/" + encodeURIComponent(url) + "?w=640",
            favicon: "https://www.google.com/s2/favicons?domain=" + encodeURIComponent(domain) + "&sz=64"
        };

        const list = getSavedLinks();
        list.unshift(item);
        saveSavedLinks(list);
        showToast("Saved Link: " + domain);

        // Fetch OpenGraph in background via Microlink
        try {
            const resp = await fetch("https://api.microlink.io/?url=" + encodeURIComponent(url));
            if (resp.ok) {
                const j = await resp.json();
                if (j.data) {
                    if (j.data.title) item.title = j.data.title;
                    if (j.data.description) item.description = j.data.description;
                    if (j.data.image?.url) item.image = j.data.image.url;
                    saveSavedLinks(list);
                }
            }
        } catch {}
    }

    function renderSavedLinks() {
        const items = getSavedLinks();
        if (linksBadge) linksBadge.textContent = items.length;
        if (linksCountText) linksCountText.textContent = items.length;
        if (linksToggleBtn) linksToggleBtn.classList.toggle("has-items", items.length > 0);

        linksList.innerHTML = "";
        if (!items.length) {
            linksList.innerHTML = '<div class="empty-state">No saved links</div>';
            return;
        }

        items.forEach(item => {
            const a = document.createElement("a");
            a.className = "content-card";
            a.target = "_blank";
            a.rel = "noopener";
            a.href = item.url;

            const removeBtn = document.createElement("button");
            removeBtn.className = "card-btn-action remove";
            removeBtn.type = "button";
            removeBtn.innerHTML = "×";
            removeBtn.title = "Remove";
            removeBtn.addEventListener("click", e => {
                e.preventDefault();
                e.stopPropagation();
                const list = getSavedLinks().filter(x => x.id !== item.id);
                saveSavedLinks(list);
                showToast("Link removed");
            });
            a.appendChild(removeBtn);

            const thumbWrap = document.createElement("div");
            thumbWrap.className = "card-thumb-wrap";

            if (item.image) {
                const img = document.createElement("img");
                img.src = item.image;
                img.alt = "";
                img.loading = "lazy";
                thumbWrap.appendChild(img);
            }

            const domBadge = document.createElement("span");
            domBadge.className = "card-badge-left";
            domBadge.textContent = item.domain;
            thumbWrap.appendChild(domBadge);

            const meta = document.createElement("div");
            meta.className = "card-meta";

            const t = document.createElement("div");
            t.className = "card-title";
            t.textContent = item.title;

            if (item.description) {
                const d = document.createElement("div");
                d.className = "card-desc";
                d.textContent = item.description;
                meta.appendChild(d);
            }

            meta.appendChild(t);
            a.append(thumbWrap, meta);
            linksList.appendChild(a);
        });
    }

    /* ==========================================================================
       YOUTUBE RESULTS (ALLORIGINS SCRAPER)
       ========================================================================== */
    async function _ytScrape(query) {
        const ytUrl = "https://www.youtube.com/results?search_query=" + encodeURIComponent(query);
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 6000);
        const resp = await fetch("https://api.allorigins.win/get?url=" + encodeURIComponent(ytUrl), { signal: ctrl.signal });
        clearTimeout(tid);
        if (!resp.ok) return [];
        const json = await resp.json();
        const html = json.contents || "";

        const start = html.indexOf("ytInitialData =");
        if (start === -1) return [];
        const brace = html.indexOf("{", start);
        if (brace === -1) return [];
        let depth = 0, end = -1;
        for (let i = brace; i < html.length; i++) {
            if (html[i] === "{") depth++;
            else if (html[i] === "}") { if (--depth === 0) { end = i; break; } }
        }
        if (end === -1) return [];

        let data;
        try { data = JSON.parse(html.slice(brace, end + 1)); } catch { return []; }

        const videos = [], seen = new Set();
        (function walk(n) {
            if (videos.length >= 6 || !n || typeof n !== "object") return;
            const v = n.videoRenderer;
            if (v && v.videoId && !seen.has(v.videoId)) {
                seen.add(v.videoId);
                videos.push({
                    id: v.videoId,
                    title: v.title?.runs?.[0]?.text || v.title?.simpleText || "Video",
                    channel: v.ownerText?.runs?.[0]?.text || "",
                    length: v.lengthText?.simpleText || "",
                    thumbUrl: "https://i.ytimg.com/vi/" + v.videoId + "/mqdefault.jpg"
                });
            }
            for (const k in n) walk(n[k]);
        })(data);
        return videos;
    }

    let ytTimer, ytToken = 0;
    function scheduleYouTube() {
        clearTimeout(ytTimer);
        const q = input.value.trim();
        if (q.length < 3 || isUrlLike(q)) {
            ytSection.style.display = "none";
            return;
        }
        ytTimer = setTimeout(() => loadYouTube(q), 650);
    }

    async function loadYouTube(query) {
        const token = ++ytToken;
        ytSection.style.display = "flex";
        ytStatus.textContent = "Loading...";
        ytList.innerHTML = "";

        try {
            const videos = await _ytScrape(query);
            if (token !== ytToken) return;

            ytStatus.textContent = videos.length ? `${videos.length} results` : "No direct results";
            videos.forEach(v => {
                const a = document.createElement("a");
                a.className = "content-card";
                a.href = "https://www.youtube.com/watch?v=" + encodeURIComponent(v.id);
                a.target = "_blank";
                a.rel = "noopener";

                const wlBtn = document.createElement("button");
                wlBtn.className = "card-btn-action" + (isWatchLater(v.id) ? " saved" : "");
                wlBtn.type = "button";
                wlBtn.innerHTML = "⏱";
                wlBtn.title = "Watch Later";
                wlBtn.addEventListener("click", e => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleWatchLater({
                        id: v.id,
                        type: "yt",
                        title: v.title,
                        channel: v.channel,
                        length: v.length,
                        thumbUrl: v.thumbUrl
                    });
                    wlBtn.classList.toggle("saved", isWatchLater(v.id));
                });
                a.appendChild(wlBtn);

                const thumbWrap = document.createElement("div");
                thumbWrap.className = "card-thumb-wrap";

                const img = document.createElement("img");
                img.src = v.thumbUrl;
                img.alt = "";
                img.loading = "lazy";
                thumbWrap.appendChild(img);

                if (v.length) {
                    const badge = document.createElement("span");
                    badge.className = "card-badge-right";
                    badge.textContent = v.length;
                    thumbWrap.appendChild(badge);
                }

                const meta = document.createElement("div");
                meta.className = "card-meta";

                const t = document.createElement("div");
                t.className = "card-title";
                t.textContent = v.title;

                const sub = document.createElement("div");
                sub.className = "card-sub";
                sub.textContent = v.channel;

                meta.append(t, sub);
                a.append(thumbWrap, meta);
                ytList.appendChild(a);
            });
        } catch {
            if (token === ytToken) ytStatus.textContent = "Error loading YouTube";
        }
    }

    /* ==========================================================================
       EVENT BINDINGS & INIT
       ========================================================================== */
    function init() {
        // Search inputs
        let sugTimer;
        input.addEventListener("input", () => {
            const q = input.value.trim();
            clearTimeout(sugTimer);
            syncAppLinks();

            if (!q) {
                dismissSuggestions();
                ytSection.style.display = "none";
                return;
            }

            sugTimer = setTimeout(async () => {
                const items = await getImdbSuggestions(q);
                showSuggestions(items, q);
            }, 200);

            scheduleYouTube();
        });

        input.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                const q = input.value.trim();
                dismissSuggestions();
                if (q) {
                    addHistory(q);
                    // Open top search on Google or first engine
                    const g = APPS.find(a => a[0] === "Google") || APPS[0];
                    window.open(targetUrl(g), "_blank");
                }
            } else if (e.key === "Escape") {
                dismissSuggestions();
                input.value = "";
                syncAppLinks();
                ytSection.style.display = "none";
            }
        });

        searchButton.addEventListener("click", () => {
            const q = input.value.trim();
            dismissSuggestions();
            if (q) {
                addHistory(q);
                const g = APPS.find(a => a[0] === "Google") || APPS[0];
                window.open(targetUrl(g), "_blank");
            }
        });

        if (searchClear) {
            searchClear.addEventListener("click", () => {
                input.value = "";
                dismissSuggestions();
                syncAppLinks();
                ytSection.style.display = "none";
                input.focus();
            });
        }

        // Close suggestions on outside click
        document.addEventListener("click", e => {
            if (!e.target.closest(".search-cockpit")) dismissSuggestions();
        });

        // History
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener("click", () => {
                saveHistory([]);
                renderHistory();
                showToast("History cleared");
            });
        }

        // Reset defaults
        if (btnResetSources) {
            btnResetSources.addEventListener("click", () => {
                if (confirm("Reset engines to defaults?")) {
                    saveCustomApps([]);
                    renderApps();
                    syncAppLinks();
                    showToast("Reset complete");
                }
            });
        }

        // Watch Later toggles
        if (wlToggleBtn) {
            wlToggleBtn.addEventListener("click", () => {
                const open = wlSection.style.display === "none";
                wlSection.style.display = open ? "flex" : "none";
                wlToggleBtn.classList.toggle("active", open);
            });
        }
        if (wlClearBtn) {
            wlClearBtn.addEventListener("click", () => {
                if (confirm("Clear Watch Later?")) {
                    saveWatchLater([]);
                    showToast("Watch Later cleared");
                }
            });
        }

        // Saved Links toggles
        if (linksToggleBtn) {
            linksToggleBtn.addEventListener("click", () => {
                const open = linksSection.style.display === "none";
                linksSection.style.display = open ? "flex" : "none";
                linksToggleBtn.classList.toggle("active", open);
            });
        }
        if (linksClearBtn) {
            linksClearBtn.addEventListener("click", () => {
                if (confirm("Clear Saved Links?")) {
                    saveSavedLinks([]);
                    showToast("Links cleared");
                }
            });
        }
        if (linksRefreshAllBtn) {
            linksRefreshAllBtn.addEventListener("click", () => {
                showToast("Refreshed");
                renderSavedLinks();
            });
        }

        // Add App toggles
        if (addAppToggleBtn) addAppToggleBtn.addEventListener("click", () => toggleAddAppBox());
        if (addAppCancelBtn) addAppCancelBtn.addEventListener("click", () => toggleAddAppBox(false));
        if (addAppSubmitBtn) addAppSubmitBtn.addEventListener("click", handleAddApp);
        if (addAppUrlInput) {
            addAppUrlInput.addEventListener("keydown", e => {
                if (e.key === "Enter") handleAddApp();
                else if (e.key === "Escape") toggleAddAppBox(false);
            });
        }

        // Global shortcuts
        document.addEventListener("keydown", e => {
            if (e.key === "/" && document.activeElement !== input && document.activeElement !== addAppUrlInput && document.activeElement !== addAppNameInput) {
                e.preventDefault();
                input.focus();
                input.select();
            }
        });

        // Initial Renders
        renderApps();
        renderHistory();
        renderWatchLater();
        renderSavedLinks();
        syncAppLinks();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
