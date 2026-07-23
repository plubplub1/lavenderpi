(() => {
  function fillForm() {
    const s = LHSettings.get();
    document.getElementById("routerHost").value = s.routerHost;
    document.getElementById("anthropicApiKey").value = s.anthropicApiKey;
    document.getElementById("refreshInterval").value = s.refreshInterval;
    document.getElementById("refreshIntervalLabel").textContent = `${s.refreshInterval}s`;
  }

  function renderConnectionStatus(d) {
    const box = document.getElementById("connection-status");
    if (!box) return;
    const live = d.connectionStatus === "online";
    box.innerHTML = `
      <div class="settings-status-row">
        ${live ? LHIcons.shieldCheck.replace("currentColor", "#4CFF78") : LHIcons.shieldAlert.replace("currentColor", "#B38CFF")}
        <div style="flex:1">
          <div style="font-size:.875rem;font-weight:500;color:var(--ink);">${live ? "Connected to live router" : "No live router data"}</div>
          <div style="margin-top:.125rem;font-size:.75rem;color:var(--ink-muted);">
            ${live ? `${d.targetRouter}` : `Status: ${d.connectionStatus} — see Diagnostics for details.`}
          </div>
        </div>
      </div>`;
  }

  function save(e) {
    e.preventDefault();
    LHSettings.set({
      routerHost: document.getElementById("routerHost").value.trim(),
      anthropicApiKey: document.getElementById("anthropicApiKey").value.trim(),
      refreshInterval: Number(document.getElementById("refreshInterval").value)
    });
    LHStore.restart();
    const saved = document.getElementById("save-confirmation");
    saved.style.opacity = "1";
    setTimeout(() => { saved.style.opacity = "0"; }, 1800);
  }

  function exportLogs() {
    const snapshot = LHStore.getSnapshot();
    if (!snapshot) {
      alert("No live snapshot to export yet — connect to your router first.");
      return;
    }
    const blob = new Blob([JSON.stringify(snapshot.logs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lavender-home-logs-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  document.addEventListener("DOMContentLoaded", () => {
    fillForm();
    document.getElementById("settings-form").addEventListener("submit", save);
    document.getElementById("refreshInterval").addEventListener("input", (e) => {
      document.getElementById("refreshIntervalLabel").textContent = `${e.target.value}s`;
    });
    document.getElementById("export-logs-btn").addEventListener("click", exportLogs);
    document.getElementById("open-login-btn").addEventListener("click", () => LHLayout.openLoginDialog());
    document.getElementById("forget-credentials-btn").addEventListener("click", () => {
      LHRouterClient.clearCredentials();
      LHStore.retryNow();
    });
  });

  LHRouterClient.subscribeDiagnostics(renderConnectionStatus);
})();
