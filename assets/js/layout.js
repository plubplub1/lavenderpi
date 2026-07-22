// Lavender Home OS — shared layout (header + sidebar + mobile nav).
// Each HTML page just needs: <div id="lh-header"></div> <div id="lh-sidebar"></div>
// <div id="lh-mobile-nav"></div> and body[data-page="..."] set to one of the keys below.
const LHLayout = (() => {
  const NAV_ITEMS = [
    { href: "index.html", key: "overview", label: "Overview", icon: "grid" },
    { href: "devices.html", key: "devices", label: "Devices", icon: "laptop" },
    { href: "analytics.html", key: "analytics", label: "Analytics", icon: "bars" },
    { href: "logs.html", key: "logs", label: "Logs", icon: "scroll" },
    { href: "ai.html", key: "ai", label: "AI", icon: "sparkles" },
    { href: "settings.html", key: "settings", label: "Settings", icon: "settings" }
  ];

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
    LHStore.subscribe((snapshot) => {
      const dot = document.getElementById("lh-status-dot");
      const label = document.getElementById("lh-status-label");
      if (!dot || !label) return;
      const online = snapshot?.internet?.status === "online";
      dot.className = `dot md ${online ? "online" : "offline"}`;
      label.textContent = online ? "Online" : "Offline";
    });
  }

  function init() {
    const activeKey = document.body.dataset.page;
    renderHeader();
    renderSidebar(activeKey);
    renderMobileNav(activeKey);

    const bgGlow = document.createElement("div");
    bgGlow.className = "app-bg-glow";
    document.body.prepend(bgGlow);

    LHStore.start();
    wireStatus();
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", LHLayout.init);
