(() => {
  const U = LHUtils, I = LHIcons;

  function statCard({ label, value, sublabel, icon, accent = "default", index = 0 }) {
    const iconClass = accent === "success" ? "success" : accent === "error" ? "error" : "";
    return `
      <div class="card stat-card" style="animation-delay:${index * 0.04}s">
        <div class="stat-card-top">
          <span class="label">${label}</span>
          <div class="stat-icon ${iconClass}">${I[icon]}</div>
        </div>
        <div>
          <div class="stat-value">${value}</div>
          ${sublabel ? `<div class="stat-sublabel">${sublabel}</div>` : ""}
        </div>
      </div>`;
  }

  function render(snapshot) {
    const grid = document.getElementById("overview-grid");
    const sourceNote = document.getElementById("overview-source-note");
    if (!grid) return;

    if (!snapshot) {
      if (sourceNote) sourceNote.textContent = "No live router data — see the banner above.";
      grid.innerHTML = "";
      return;
    }

    sourceNote.textContent = `Live data from ${snapshot.router.model}`;

    const onlineDevices = (snapshot.devices || []).filter(d => d.online).length;

    grid.innerHTML = [
      statCard({ index: 0, label: "Internet", value: snapshot.internet.status === "online" ? "Connected" : "Offline", sublabel: snapshot.internet.wanIp, icon: "wifi", accent: snapshot.internet.status === "online" ? "success" : "error" }),
      statCard({ index: 1, label: "Router", value: snapshot.router.model, sublabel: snapshot.router.lanIp, icon: "router" }),
      statCard({ index: 2, label: "Latency", value: `${snapshot.internet.latencyMs ?? "—"} ms`, icon: "activity" }),
      statCard({ index: 3, label: "Download", value: U.formatBytesPerSecond(snapshot.internet.downloadBps), sublabel: "Realtime", icon: "arrowDown", accent: "success" }),
      statCard({ index: 4, label: "Upload", value: U.formatBytesPerSecond(snapshot.internet.uploadBps), sublabel: "Realtime", icon: "arrowUp" }),
      statCard({ index: 5, label: "Connected Devices", value: `${onlineDevices}`, sublabel: `of ${snapshot.devices.length} known`, icon: "users" }),
      statCard({ index: 6, label: "Firmware", value: snapshot.router.firmware, icon: "router" }),
      statCard({ index: 7, label: "Uptime", value: U.formatUptime(snapshot.router.uptimeSeconds), icon: "clock" }),
      statCard({ index: 8, label: "CPU", value: `${snapshot.router.cpuPercent}%`, icon: "cpu", accent: snapshot.router.cpuPercent > 80 ? "error" : "default" }),
      statCard({ index: 9, label: "Memory", value: `${snapshot.router.memoryPercent}%`, icon: "memory" }),
      statCard({ index: 10, label: "Temperature", value: snapshot.router.temperatureC ? `${snapshot.router.temperatureC}°C` : "—", icon: "thermometer", accent: snapshot.router.temperatureC > 65 ? "error" : "default" })
    ].join("");

    const wifiSection = document.getElementById("wifi-section");
    const wifiGrid = document.getElementById("wifi-grid");
    if (snapshot.wifi && snapshot.wifi.length > 0) {
      wifiSection.style.display = "";
      wifiGrid.innerHTML = snapshot.wifi.map(band => `
        <div class="card">
          <div class="wifi-row">
            <div>
              <div class="wifi-name">${U.escapeHtml(band.ssid)}</div>
              <div class="wifi-meta">${band.band} · Channel ${band.channel ?? "auto"}</div>
            </div>
            <div class="wifi-clients">
              <span class="dot ${band.enabled ? "online" : "offline"}"></span>
              ${band.clients} clients
            </div>
          </div>
        </div>`).join("");
    }
  }

  LHStore.subscribe(render);
})();
