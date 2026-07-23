(() => {
  function row(label, value) {
    return `<div class="diag-row"><span class="diag-label">${label}</span><span class="diag-value">${value}</span></div>`;
  }

  function render(d) {
    const conn = document.getElementById("diag-connection");
    if (!conn) return;

    conn.innerHTML = [
      row("Current Origin", d.currentOrigin),
      row("Target Router", d.targetRouter || "—"),
      row("Connection Status", d.connectionStatus),
      row("HTTP Status", d.httpStatus ?? "—"),
      row("CORS Status", d.corsStatus),
      row("Authentication Status", d.authStatus),
      row("Mixed Content Blocked", d.mixedContent ? "yes" : "no"),
      row(
        "Cookies Present",
        d.cookiesPresent === "unverifiable"
          ? "unverifiable (cross-origin cookies aren't readable by JS)"
          : d.cookiesPresent ? "yes (this origin)" : "no (this origin)"
      ),
      row("Browser", LHUtils.escapeHtml(d.browser)),
      row("Timestamp", d.timestamp)
    ].join("");

    const req = document.getElementById("diag-request");
    req.innerHTML = d.lastRequest
      ? [row("Method", d.lastRequest.method), row("URL", d.lastRequest.url), row("Sent At", d.lastRequest.timestamp)].join("")
      : `<p style="font-size:.875rem;color:var(--ink-faint);margin:0;">No request has been made yet.</p>`;

    const res = document.getElementById("diag-response");
    if (d.lastResponse) {
      res.innerHTML = [
        row("URL", d.lastResponse.url),
        row("HTTP Status", d.lastResponse.httpStatus ?? "no response received"),
        row("OK", String(d.lastResponse.ok)),
        row("Received At", d.lastResponse.timestamp),
        d.lastResponse.error ? row("Error", LHUtils.escapeHtml(d.lastResponse.error)) : ""
      ].join("");
    } else {
      res.innerHTML = `<p style="font-size:.875rem;color:var(--ink-faint);margin:0;">No response yet.</p>`;
    }

    const errorCard = document.getElementById("diag-error-card");
    const errorText = document.getElementById("diag-error-text");
    if (d.lastError) {
      errorCard.style.display = "";
      errorText.textContent = d.lastError;
    } else {
      errorCard.style.display = "none";
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("diag-retry").addEventListener("click", () => LHStore.retryNow());
    document.getElementById("diag-forget").addEventListener("click", () => {
      LHRouterClient.clearCredentials();
      LHStore.retryNow();
    });
  });

  LHRouterClient.subscribeDiagnostics(render);
})();
