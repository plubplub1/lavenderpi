/**
 * GRIM — network assistant.
 * This is a pure static site with no backend, so this calls the Anthropic API
 * directly from the browser using a key you paste into Settings (stored only
 * in localStorage on this device). That means:
 *   - Your key is visible in this browser's dev tools / localStorage.
 *   - It is sent with every request to api.anthropic.com directly from here.
 * This is fine for a personal dashboard only you use. Do NOT deploy this
 * site publicly with your key saved in it, and do not share this browser
 * profile. For a shared/public deployment, add a small backend proxy that
 * holds the key server-side instead — happy to build that if you need it.
 */
(() => {
  const U = LHUtils, I = LHIcons;
  let messages = [];
  let loading = false;

  const SUGGESTIONS = ["Which device is using the most bandwidth?", "How many devices are connected?", "Is my Internet healthy?"];

  function networkContext(snapshot) {
    if (!snapshot) return "No network data available yet.";
    const top = [...(snapshot.devices || [])]
      .sort((a, b) => (b.downloadBps + b.uploadBps) - (a.downloadBps + a.uploadBps))
      .slice(0, 5)
      .map(d => `- ${d.hostname} (${d.manufacturer}): ${d.online ? "online" : "offline"}, down ${U.formatBytesPerSecond(d.downloadBps)}, up ${U.formatBytesPerSecond(d.uploadBps)}, ${U.formatBytes(d.trafficTodayBytes)} today`)
      .join("\n");

    return `Current network snapshot (source: ${snapshot.connectionSource}, fetched ${snapshot.fetchedAt}):
Internet: ${snapshot.internet.status}, latency ${snapshot.internet.latencyMs ?? "unknown"}ms, WAN IP ${snapshot.internet.wanIp ?? "unknown"}
Router: ${snapshot.router.model}, firmware ${snapshot.router.firmware}, uptime ${U.formatUptime(snapshot.router.uptimeSeconds)}
Router health: CPU ${snapshot.router.cpuPercent}%, memory ${snapshot.router.memoryPercent}%, temp ${snapshot.router.temperatureC ?? "unknown"}°C
Connected devices: ${(snapshot.devices || []).filter(d => d.online).length} of ${(snapshot.devices || []).length} known devices online

Top devices by current bandwidth use:
${top}`;
  }

  function renderEmpty() {
    return `
      <div class="chat-empty">
        <div class="chat-empty-icon">${I.sparkles}</div>
        <div>
          <p class="font-display" style="font-size:1.125rem;font-weight:500;margin:0;">Ask GRIM anything</p>
          <p style="margin:.25rem 0 0;font-size:.875rem;color:var(--ink-muted);">Your network assistant, powered by live dashboard data.</p>
        </div>
        <div class="chat-suggestions">
          ${SUGGESTIONS.map(s => `<button class="chip" data-suggestion="${U.escapeHtml(s)}">${U.escapeHtml(s)}</button>`).join("")}
        </div>
      </div>`;
  }

  function render() {
    const scroll = document.getElementById("chat-scroll");
    const errorBox = document.getElementById("chat-error");
    if (!scroll) return;

    if (messages.length === 0) {
      scroll.innerHTML = renderEmpty();
    } else {
      scroll.innerHTML = messages.map(m => `
        <div class="chat-msg ${m.role}">
          <div class="chat-avatar ${m.role === "assistant" ? "assistant" : "user"}">${m.role === "assistant" ? I.sparkles : I.user}</div>
          <div class="chat-bubble ${m.role === "assistant" ? "assistant" : "user"}">${U.escapeHtml(m.content)}</div>
        </div>`).join("") + (loading ? `<div class="chat-thinking"><span class="dot online" style="width:6px;height:6px"></span>GRIM is thinking…</div>` : "");
    }

    errorBox.style.display = "none";
    scroll.scrollTop = scroll.scrollHeight;
  }

  async function send(text) {
    if (!text.trim() || loading) return;
    const settings = LHSettings.get();
    const errorBox = document.getElementById("chat-error");

    if (!settings.anthropicApiKey) {
      errorBox.textContent = "Add your Anthropic API key in Settings to enable GRIM.";
      errorBox.style.display = "block";
      return;
    }

    messages.push({ role: "user", content: text });
    document.getElementById("chat-input").value = "";
    loading = true;
    render();

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": settings.anthropicApiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1024,
          system: `You are GRIM, the network assistant built into Lavender Home OS. Be concise, direct, and practical. Use the live network data below when answering — never invent numbers that aren't in it.\n\n${networkContext(LHStore.getSnapshot())}`,
          messages: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || `Request failed (${res.status})`);

      const reply = (data.content || []).find(b => b.type === "text")?.text || "I couldn't generate a response.";
      messages.push({ role: "assistant", content: reply });
    } catch (err) {
      errorBox.textContent = `GRIM is unavailable: ${err.message}. (Note: some browsers/extensions block direct API calls — a small backend proxy avoids this.)`;
      errorBox.style.display = "block";
    } finally {
      loading = false;
      render();
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    render();
    document.getElementById("chat-scroll").addEventListener("click", (e) => {
      const chip = e.target.closest("[data-suggestion]");
      if (chip) send(chip.dataset.suggestion);
    });
    document.getElementById("chat-form").addEventListener("submit", (e) => {
      e.preventDefault();
      send(document.getElementById("chat-input").value);
    });
  });
})();
