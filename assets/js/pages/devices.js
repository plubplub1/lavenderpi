(() => {
  const U = LHUtils, I = LHIcons;
  let allDevices = [];

  function bandIcon(band) {
    return band === "Ethernet" ? I.cable : I.wifi;
  }

  function renderRows(devices) {
    const wrap = document.getElementById("device-rows");
    const countLabel = document.getElementById("device-count");
    if (!wrap) return;
    countLabel.textContent = `${devices.length} devices`;

    if (devices.length === 0) {
      wrap.innerHTML = `<div style="padding:3rem 1.5rem;text-align:center;font-size:.875rem;color:var(--ink-faint);">No devices match your search.</div>`;
      return;
    }

    wrap.innerHTML = devices.map((d, i) => `
      <div class="device-row" style="animation-delay:${i * 0.02}s">
        <div class="device-name-cell">
          <div class="device-name">${U.escapeHtml(d.hostname)}</div>
          <div class="device-sub">${U.escapeHtml(d.manufacturer)} · ${d.connectedSince ? `since ${U.relativeTime(d.connectedSince)}` : "—"}</div>
        </div>
        <div class="device-mono">${d.mac}</div>
        <div style="color:var(--ink-muted)">
          <div>${d.ipv4 ?? "—"}</div>
          ${d.ipv6 ? `<div style="font-size:.75rem;color:var(--ink-faint);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:14rem" title="${d.ipv6}">${d.ipv6}</div>` : ""}
        </div>
        <div style="display:flex;align-items:center;gap:.375rem;color:var(--ink-muted)">
          <span style="width:14px;height:14px;color:var(--ink-faint);display:inline-flex">${bandIcon(d.band)}</span>
          <span>${d.signal !== null ? `${d.signal} dBm` : (d.band ?? "—")}</span>
        </div>
        <div style="color:${d.online && d.downloadBps > 1_000_000 ? "var(--accent)" : "var(--ink-muted)"}">${U.formatBytesPerSecond(d.downloadBps)}</div>
        <div style="color:var(--ink-muted)">${U.formatBytesPerSecond(d.uploadBps)}</div>
        <div class="device-status-cell">
          <span class="dot ${d.online ? "online" : "offline"}"></span>
          <span class="device-status-mobile">${d.online ? "Online" : "Offline"} · ${U.formatBytes(d.trafficTodayBytes)} today</span>
        </div>
      </div>`).join("");
  }

  function applyFilter() {
    const q = (document.getElementById("device-search").value || "").trim().toLowerCase();
    if (!q) { renderRows(allDevices); return; }
    renderRows(allDevices.filter(d =>
      d.hostname.toLowerCase().includes(q) ||
      d.manufacturer.toLowerCase().includes(q) ||
      d.mac.toLowerCase().includes(q) ||
      (d.ipv4 ?? "").includes(q)
    ));
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("device-search").addEventListener("input", applyFilter);
  });

  LHStore.subscribe((snapshot) => {
    allDevices = snapshot ? (snapshot.devices || []) : [];
    applyFilter();
  });
})();
