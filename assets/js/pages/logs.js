(() => {
  const U = LHUtils, I = LHIcons;

  const LEVEL_CONFIG = {
    success: { icon: "checkCircle", color: "var(--success)", bg: "rgba(76,255,120,.1)" },
    info: { icon: "info", color: "var(--accent)", bg: "rgba(179,140,255,.1)" },
    warning: { icon: "alertTriangle", color: "var(--warning)", bg: "rgba(251,191,119,.1)" },
    error: { icon: "xCircle", color: "var(--error)", bg: "rgba(255,92,92,.1)" }
  };

  function render(snapshot) {
    const wrap = document.getElementById("log-timeline");
    if (!wrap) return;
    const logs = snapshot.logs || [];

    if (logs.length === 0) {
      wrap.innerHTML = `<div class="card" style="text-align:center;padding:4rem 1.5rem;color:var(--ink-faint);font-size:.875rem;">No activity recorded yet.</div>`;
      return;
    }

    wrap.innerHTML = `
      <div class="glass timeline">
        <div class="timeline-line"></div>
        <div class="timeline-items">
          ${logs.map((log, i) => {
            const cfg = LEVEL_CONFIG[log.level] || LEVEL_CONFIG.info;
            return `
              <div class="timeline-item" style="animation-delay:${i * 0.04}s">
                <div class="timeline-icon" style="background:${cfg.bg};color:${cfg.color}">${I[cfg.icon]}</div>
                <div class="timeline-body">
                  <div class="timeline-head">
                    <span class="timeline-title">${U.escapeHtml(log.title)}</span>
                    <span class="timeline-time">${U.formatDateTime(log.timestamp)}</span>
                  </div>
                  ${log.detail ? `<p class="timeline-detail">${U.escapeHtml(log.detail)}</p>` : ""}
                </div>
              </div>`;
          }).join("")}
        </div>
      </div>`;
  }

  LHStore.subscribe(render);
})();
