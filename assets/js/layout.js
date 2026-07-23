// Lavender Home OS — shared layout (header + sidebar + mobile nav + connection
// banner + login dialog). Each HTML page just needs:
// <div id="lh-header"></div> <div id="lh-sidebar"></div> <div id="lh-mobile-nav"></div>
// and body[data-page="..."] set to one of the keys below.
const LHLayout = (() => {
  const NAV_ITEMS = [
    { href: "index.html", key: "overview", label: "Overview", icon: "grid" },
    { href: "devices.html", key: "devices", label: "Devices", icon: "laptop" },
    { href: "analytics.html", key: "analytics", label: "Analytics", icon: "bars" },
    { href: "logs.html", key: "logs", label: "Logs", icon: "scroll" },
    { href: "ai.html", key: "ai", label: "AI", icon: "sparkles" },
    { href: "diagnostics.html", key: "diagnostics", label: "Diagnostics", icon: "radar" },
    { href: "settings.html", key: "settings", label: "Settings", icon: "settings" }
  ];

  const STATUS_COPY = {
    idle: { title: "Connecting to router…", detail: "" },
    connecting: { title: "Connecting to router…", detail: "" },
    "requires-login": { title: "Router login required", detail: "Enter your router credentials to continue." },
    authenticating: { title: "Authenticating…", detail: "" },
    "auth-failed": { title: "Router login failed", detail: "Check your username and password, or open Diagnostics." },
    "blocked-cors": {
      title: "Blocked by browser security (CORS)",
      detail: "The router is reachable, but this page is on a different origin and the router did not allow it to read the response."
    },
    "blocked-mixed-content": {
      title: "Blocked by browser security (mixed content)",
      detail: "This page is loaded over https and cannot fetch an http:// router address."
    },
    unreachable: {
      title: "Router unavailable",
      detail: "No response from the router. It may be offline, on a different network, or unreachable from this browser."
    }
  };

  function renderHeader() {
    const host = document.getElementById("lh-header");
    if (!host) return;
    host.outerHTML = `
      <header class="app-header glass-strong">
        <div class="header-status">
          <span id="lh-status-dot" class="dot degraded"></span>
          <span id="lh-status-label" class="label">Connecting</span>
          <span class="header-divider"></span>
          <span class="header-title font-display text-gradient-accent">Lavender Home</span>
        </div>
      </header>`;
  }

  function renderSidebar(activeKey) {
    const host = document.getElementById("lh-sidebar");
    if (!host) return;
    const links = NAV_ITEMS.map(item => `
      <a href="${item.href}" class="${item.key === activeKey ? "active" : ""}">
        ${LHIcons[item.icon]}
        <span>${item.label}</span>
      </a>`).join("");
    host.outerHTML = `<nav class="sidebar">${links}</nav>`;
  }

  function renderMobileNav(activeKey) {
    const host = document.getElementById("lh-mobile-nav");
    if (!host) return;
    const links = NAV_ITEMS.map(item => `
      <a href="${item.href}" class="${item.key === activeKey ? "active" : ""}">
        ${LHIcons[item.icon]}
        <span>${item.label}</span>
      </a>`).join("");
    host.outerHTML = `<nav class="mobile-nav glass-strong">${links}</nav>`;
  }

  function wireStatus() {
    LHRouterClient.subscribeDiagnostics((d) => {
      const dot = document.getElementById("lh-status-dot");
      const label = document.getElementById("lh-status-label");
      if (!dot || !label) return;
      const online = d.connectionStatus === "online";
      dot.className = `dot md ${online ? "online" : "offline"}`;
      label.textContent = online ? "Online" : "Offline";
    });
  }

  // ── connection banner (injected into every page's <main>, no HTML edits needed) ──
  function renderBanner() {
    const main = document.querySelector("main.app-main");
    if (!main) return;
    const banner = document.createElement("div");
    banner.id = "lh-banner";
    banner.className = "glass conn-banner";
    banner.style.display = "none";
    main.prepend(banner);

    LHRouterClient.subscribeDiagnostics((d) => {
      if (d.connectionStatus === "online") {
        banner.style.display = "none";
        return;
      }
      banner.style.display = "";
      const copy = STATUS_COPY[d.connectionStatus] || STATUS_COPY.unreachable;
      const isLoadingState = ["idle", "connecting", "authenticating"].includes(d.connectionStatus);
      const needsLogin = d.connectionStatus === "requires-login" || d.connectionStatus === "auth-failed";
      banner.innerHTML = `
        <div class="conn-banner-left">
          <div class="conn-banner-icon ${isLoadingState ? "" : "error"}">${LHIcons.alertOctagon}</div>
          <div>
            <div class="conn-banner-title">${copy.title}</div>
            ${copy.detail ? `<div class="conn-banner-detail">${copy.detail}</div>` : ""}
          </div>
        </div>
        <div class="conn-banner-actions">
          ${needsLogin
            ? `<button class="btn-chip accent" id="lh-banner-login">${LHIcons.logIn}Log in</button>`
            : `<button class="btn-chip" id="lh-banner-retry">${LHIcons.refresh}Retry</button>`}
          <a href="diagnostics.html" class="btn-chip">Diagnostics</a>
        </div>`;

      const loginBtn = document.getElementById("lh-banner-login");
      if (loginBtn) loginBtn.addEventListener("click", openLoginDialog);
      const retryBtn = document.getElementById("lh-banner-retry");
      if (retryBtn) retryBtn.addEventListener("click", () => LHStore.retryNow());
    });
  }

  // ── login dialog (injected once into <body>, reused by every page) ──────
  function renderLoginDialog() {
    const dialog = document.createElement("div");
    dialog.id = "lh-login-overlay";
    dialog.className = "login-overlay";
    dialog.style.display = "none";
    dialog.innerHTML = `
      <div class="glass login-dialog">
        <div class="login-dialog-head">
          <div class="login-dialog-title">
            <div class="login-dialog-icon">${LHIcons.lock}</div>
            <div>
              <h2>Router login</h2>
              <p id="lh-login-target"></p>
            </div>
          </div>
          <button id="lh-login-close" class="focus-ring" style="color:var(--ink-faint)">${LHIcons.x}</button>
        </div>
        <form id="lh-login-form">
          <label class="field-label">Username</label>
          <input type="text" id="lh-login-username" value="admin" autocomplete="username">
          <label class="field-label" style="margin-top:.75rem">Password</label>
          <input type="password" id="lh-login-password" autocomplete="current-password">
          <div id="lh-login-error" class="chat-error" style="display:none;margin-top:.75rem"></div>
          <p class="settings-note" style="margin-top:.75rem">
            This request goes directly from your browser to the router — nothing is sent to any server. It will
            likely be blocked (CORS or mixed content); see Diagnostics for the exact reason if it fails.
          </p>
          <button type="submit" id="lh-login-submit" class="btn-accent" style="width:100%;justify-content:center;margin-top:1rem">Connect</button>
        </form>
      </div>`;
    document.body.appendChild(dialog);

    document.getElementById("lh-login-close").addEventListener("click", closeLoginDialog);
    dialog.addEventListener("click", (e) => { if (e.target === dialog) closeLoginDialog(); });

    document.getElementById("lh-login-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById("lh-login-submit");
      const errorBox = document.getElementById("lh-login-error");
      errorBox.style.display = "none";
      submitBtn.disabled = true;
      submitBtn.textContent = "Connecting…";

      const username = document.getElementById("lh-login-username").value.trim();
      const password = document.getElementById("lh-login-password").value;
      const ok = await LHRouterClient.login({ username, password });

      submitBtn.disabled = false;
      submitBtn.textContent = "Connect";

      if (ok) {
        closeLoginDialog();
        LHStore.retryNow();
      } else {
        errorBox.textContent = "Login failed or was blocked by the browser. Check Diagnostics for the exact reason (CORS, mixed content, or wrong credentials).";
        errorBox.style.display = "block";
      }
    });

    LHRouterClient.subscribeDiagnostics((d) => {
      document.getElementById("lh-login-target").textContent = d.targetRouter || "";
      if (d.connectionStatus === "requires-login") openLoginDialog();
    });
  }

  function openLoginDialog() {
    const overlay = document.getElementById("lh-login-overlay");
    if (overlay) overlay.style.display = "flex";
  }

  function closeLoginDialog() {
    const overlay = document.getElementById("lh-login-overlay");
    if (overlay) overlay.style.display = "none";
  }

  function init() {
    const activeKey = document.body.dataset.page;
    renderHeader();
    renderSidebar(activeKey);
    renderMobileNav(activeKey);

    const bgGlow = document.createElement("div");
    bgGlow.className = "app-bg-glow";
    document.body.prepend(bgGlow);

    renderBanner();
    renderLoginDialog();

    LHStore.start();
    wireStatus();
  }

  return { init, openLoginDialog, closeLoginDialog };
})();

document.addEventListener("DOMContentLoaded", LHLayout.init);
