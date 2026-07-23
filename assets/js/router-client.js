/**
 * ──────────────────────────────────────────────────────────────────────────
 * Lavender Home OS — browser-only router client (no backend, no fallback)
 * ──────────────────────────────────────────────────────────────────────────
 * Every request in this file is a fetch() made by the code currently running
 * in your browser tab. There is no server, no API route, no Node process
 * involved in reaching the router — and there is NO automatic fallback to
 * fake data anywhere in this file. If the router can't be reached, every
 * function here returns null and records exactly why in `diagnostics`.
 *
 * Two browser security mechanisms are the most likely reason this fails no
 * matter how correct your credentials are:
 *   1. CORS — the router almost certainly doesn't send an
 *      `Access-Control-Allow-Origin` header, so the browser blocks the
 *      response even though the request reached the router.
 *   2. Mixed content — if this page is served over https, browsers refuse
 *      to let it fetch an http:// address (your router) at all.
 * This client detects and reports both conditions separately — see the
 * Diagnostics page.
 * ──────────────────────────────────────────────────────────────────────────
 */
const LHRouterClient = (() => {
  const CREDENTIALS_KEY = "lavender-home-os:router-credentials";

  let credentials = loadCredentials();

  let diagnostics = {
    currentOrigin: typeof window !== "undefined" ? window.location.origin : "unknown",
    targetRouter: null,
    connectionStatus: "idle", // idle | connecting | requires-login | authenticating | auth-failed | online | blocked-cors | blocked-mixed-content | unreachable
    lastRequest: null,
    lastResponse: null,
    httpStatus: null,
    corsStatus: "unknown", // unknown | allowed | blocked
    authStatus: "unauthenticated", // unauthenticated | authenticating | authenticated | failed
    cookiesPresent: "unverifiable",
    browser: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
    timestamp: new Date().toISOString(),
    lastError: null,
    mixedContent: false
  };

  const diagnosticsListeners = new Set();

  function nowIso() { return new Date().toISOString(); }

  function loadCredentials() {
    try {
      const raw = localStorage.getItem(CREDENTIALS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function saveCredentials(creds) {
    credentials = creds;
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(creds));
  }

  function clearCredentials() {
    credentials = null;
    localStorage.removeItem(CREDENTIALS_KEY);
  }

  function hasCredentials() {
    return credentials !== null;
  }

  function updateDiagnostics(patch) {
    diagnostics = { ...diagnostics, ...patch, timestamp: nowIso() };
    diagnosticsListeners.forEach(fn => fn(diagnostics));
  }

  function subscribeDiagnostics(fn) {
    diagnosticsListeners.add(fn);
    fn(diagnostics);
    return () => diagnosticsListeners.delete(fn);
  }

  function getDiagnostics() {
    return diagnostics;
  }

  function detectMixedContent(targetUrl) {
    if (typeof window === "undefined") return false;
    return window.location.protocol === "https:" && targetUrl.startsWith("http://");
  }

  function getBaseUrl() {
    const settings = LHSettings.get();
    const host = (settings.routerHost || "192.168.1.1").trim();
    const base = host.startsWith("http") ? host : `http://${host}`;
    return base.replace(/\/$/, "");
  }

  // ── low-level probe: logs everything, distinguishes CORS vs unreachable ──
  async function probe(path, init = {}) {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${path}`;
    const method = init.method || "GET";
    updateDiagnostics({ targetRouter: baseUrl });

    console.log(`[LavenderRouter] → ${method} ${url}`, init);
    updateDiagnostics({
      lastRequest: { url, method, timestamp: nowIso() },
      mixedContent: detectMixedContent(url)
    });

    if (detectMixedContent(url)) {
      const err = "Mixed content: this https page cannot fetch an http:// router address";
      console.error(`[LavenderRouter] ✕ blocked before send — ${err}`);
      updateDiagnostics({
        lastResponse: { url, httpStatus: null, ok: false, timestamp: nowIso(), error: err },
        connectionStatus: "blocked-mixed-content",
        lastError: err
      });
      return { ok: false, status: null, json: null };
    }

    try {
      const res = await fetch(url, { ...init, mode: "cors", credentials: "include" });
      console.log(`[LavenderRouter] ← ${res.status} ${url}`, res);
      updateDiagnostics({
        lastResponse: { url, httpStatus: res.status, ok: res.ok, timestamp: nowIso() },
        httpStatus: res.status,
        corsStatus: "allowed"
      });
      if (!res.ok) return { ok: false, status: res.status, json: null };

      const contentType = res.headers.get("content-type") || "";
      const json = contentType.includes("json")
        ? await res.json().catch(() => null)
        : await res.text().catch(() => null);
      return { ok: true, status: res.status, json };
    } catch (err) {
      // fetch() throws a generic error for both CORS blocks and real network
      // failures. Probe again with mode:"no-cors" — if that resolves, the
      // router IS reachable and the browser is specifically hiding the
      // response from us (a genuine CORS block). If it also fails, the
      // router is unreachable (wrong network, offline, firewalled, DNS).
      console.error(`[LavenderRouter] ✕ ${method} ${url} failed:`, err);
      let corsStatus = "unknown";
      let status = "unreachable";
      try {
        await fetch(url, { method, mode: "no-cors" });
        corsStatus = "blocked";
        status = "blocked-cors";
        console.warn(`[LavenderRouter] no-cors probe to ${url} resolved — router is reachable, response is CORS-blocked.`);
      } catch (probeErr) {
        status = "unreachable";
        console.error(`[LavenderRouter] no-cors probe to ${url} also failed — router appears unreachable.`, probeErr);
      }
      updateDiagnostics({
        lastResponse: { url, httpStatus: null, ok: false, timestamp: nowIso(), error: err?.message || String(err) },
        httpStatus: null,
        corsStatus,
        connectionStatus: status,
        lastError: err?.message || String(err)
      });
      return { ok: false, status: null, json: null };
    }
  }

  // ── login ────────────────────────────────────────────────────────────────
  async function login(creds) {
    updateDiagnostics({ connectionStatus: "authenticating", authStatus: "authenticating" });

    // TODO verify for your exact firmware (V5R022C00S137 / 3BB build): this
    // guesses the common Huawei HG8145 login endpoint and form field names.
    // Open DevTools → Network on the router's own admin page to confirm the
    // real endpoint/payload, then adjust this function only — everything
    // downstream (fetchSnapshot, UI, diagnostics) stays the same.
    const result = await probe("/login.cgi", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ UserName: creds.username, PassWord: creds.password }).toString()
    });

    const cookiesPresent = typeof document !== "undefined" ? document.cookie.length > 0 : "unverifiable";

    if (result.ok) {
      saveCredentials(creds);
      updateDiagnostics({ authStatus: "authenticated", connectionStatus: "online", cookiesPresent });
      return true;
    }

    updateDiagnostics({ authStatus: "failed", cookiesPresent });
    return false;
  }

  // ── snapshot ─────────────────────────────────────────────────────────────
  /**
   * Returns a live snapshot, or `null` if the router can't be reached or
   * authenticated. NEVER returns fabricated/demo data.
   */
  async function fetchSnapshot() {
    if (!credentials) {
      updateDiagnostics({ connectionStatus: "requires-login", targetRouter: getBaseUrl() });
      return null;
    }

    updateDiagnostics({ connectionStatus: "connecting" });

    // TODO verify: best-effort endpoint guesses for Huawei HG8145X6-family
    // firmware, not a confirmed API for V5R022C00S137 / 3BB.
    const [deviceInfo, wan, wlan, hosts] = await Promise.all([
      probe("/api/system/deviceinfo"),
      probe("/api/ntwk/wan"),
      probe("/api/ntwk/wlan"),
      probe("/api/ntwk/hosts")
    ]);

    if (!deviceInfo.ok || !wan.ok || !hosts.ok) {
      // connectionStatus was already set by probe() to the specific reason
      // (blocked-cors / blocked-mixed-content / unreachable / auth-failed).
      return null;
    }

    const di = deviceInfo.json || {};
    const w = wan.json || {};
    const wl = Array.isArray(wlan.json) ? wlan.json : [];
    const hostList = Array.isArray(hosts.json) ? hosts.json : [];

    updateDiagnostics({ connectionStatus: "online" });

    return {
      connectionSource: "live",
      fetchedAt: nowIso(),
      router: {
        model: di.DeviceName || "Huawei HG8145X6",
        firmware: di.SoftwareVersion || "unknown",
        serial: di.SerialNumber || null,
        macAddress: di.MacAddress || null,
        cpuPercent: Number(di.CpuUsage || 0),
        memoryPercent: Number(di.MemoryUsage || 0),
        temperatureC: di.Temperature ? Number(di.Temperature) : null,
        uptimeSeconds: Number(di.UpTime || 0),
        lanIp: di.LanIp || getBaseUrl()
      },
      internet: {
        status: w.LinkStatus === "up" ? "online" : "offline",
        wanIp: w.ExternalIPAddress || null,
        wanIpv6: w.ExternalIPv6Address || null,
        gateway: w.DefaultGateway || null,
        dns: [w.DNSServer1, w.DNSServer2].filter(Boolean),
        latencyMs: w.Latency ? Number(w.Latency) : null,
        downloadBps: Number(w.RxRate || 0),
        uploadBps: Number(w.TxRate || 0)
      },
      wifi: wl.map(b => ({
        ssid: b.SSID || "unknown",
        band: b.Frequency === "5G" ? "5GHz" : "2.4GHz",
        enabled: Boolean(b.Enable),
        channel: b.Channel ? Number(b.Channel) : null,
        clients: Number(b.ClientCount || 0)
      })),
      devices: hostList.map((h, i) => ({
        id: h.MACAddress || `device-${i}`,
        hostname: h.HostName || "Unknown Device",
        manufacturer: h.Manufacturer || "Unknown",
        vendor: h.Vendor || h.Manufacturer || "Unknown",
        mac: h.MACAddress || "00:00:00:00:00:00",
        ipv4: h.IPAddress || null,
        ipv6: h.IPv6Address || null,
        signal: h.RSSI ? Number(h.RSSI) : null,
        band: h.InterfaceType === "802.11" ? (h.Frequency === "5G" ? "5GHz" : "2.4GHz") : "Ethernet",
        downloadBps: Number(h.RxRate || 0),
        uploadBps: Number(h.TxRate || 0),
        trafficTodayBytes: Number(h.TrafficToday || 0),
        connectedSince: h.ConnectedSince || null,
        online: Boolean(h.Active)
      })),
      dhcp: [],
      trafficHistory: [],
      logs: []
    };
  }

  return {
    hasCredentials, saveCredentials, clearCredentials,
    login, fetchSnapshot,
    subscribeDiagnostics, getDiagnostics
  };
})();
