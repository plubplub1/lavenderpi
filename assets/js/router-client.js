/**
 * ──────────────────────────────────────────────────────────────────────────
 * Lavender Home OS — best-effort LIVE router client (browser/static version)
 * ──────────────────────────────────────────────────────────────────────────
 * Read this before relying on it:
 *
 * A pure static site has no backend, so this file must call your router
 * directly from the browser. In practice this will very likely fail:
 *
 *   1. Home routers (including Huawei HG8145X6 firmware) almost never send
 *      `Access-Control-Allow-Origin` headers, so the browser blocks the
 *      response even if the request reaches the router (CORS).
 *   2. If this site is deployed on Cloudflare Pages (https://...), calling
 *      an http://192.168.1.1 router is blocked as mixed content by browsers.
 *   3. Even opened locally via file://, most browsers restrict fetch() to
 *      other origins similarly.
 *
 * This function is still implemented so it "just works" in the rare setup
 * where none of the above apply (e.g. a router that does send permissive
 * CORS headers, accessed over plain http from an http:// page on the same
 * network) — and so you have a clear place to wire in a browser extension
 * or local proxy if you build one later. Endpoint paths are the same
 * best-effort guesses as the Next.js version and are marked TODO verify.
 *
 * If you want guaranteed live data with no CORS issues, the reliable path
 * is a tiny same-origin proxy (a Cloudflare Worker, or any backend) that
 * fetches the router server-side and returns JSON — happy to build that
 * as an optional add-on file if you want it.
 * ──────────────────────────────────────────────────────────────────────────
 */
const LHRouterClient = (() => {
  async function tryFetchLiveSnapshot(settings) {
    if (!settings.routerHost || !settings.routerUsername || !settings.routerPassword) {
      return null;
    }

    const baseUrl = settings.routerHost.startsWith("http") ? settings.routerHost : `http://${settings.routerHost}`;

    try {
      // TODO verify: real login endpoint/payload for your firmware.
      const loginRes = await fetch(`${baseUrl}/login.cgi`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          UserName: settings.routerUsername,
          PassWord: settings.routerPassword
        }).toString(),
        credentials: "include",
        mode: "cors"
      });
      if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`);

      const [deviceInfo, wan, wlan, hosts] = await Promise.all([
        fetch(`${baseUrl}/api/system/deviceinfo`, { credentials: "include" }).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${baseUrl}/api/ntwk/wan`, { credentials: "include" }).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${baseUrl}/api/ntwk/wlan`, { credentials: "include" }).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${baseUrl}/api/ntwk/hosts`, { credentials: "include" }).then(r => r.ok ? r.json() : null).catch(() => null)
      ]);

      if (!deviceInfo || !wan || !hosts) return null;

      return {
        connectionSource: "live",
        fetchedAt: new Date().toISOString(),
        router: {
          model: deviceInfo.DeviceName ?? "Huawei HG8145X6",
          firmware: deviceInfo.SoftwareVersion ?? "unknown",
          serial: deviceInfo.SerialNumber ?? null,
          macAddress: deviceInfo.MacAddress ?? null,
          cpuPercent: Number(deviceInfo.CpuUsage ?? 0),
          memoryPercent: Number(deviceInfo.MemoryUsage ?? 0),
          temperatureC: deviceInfo.Temperature ? Number(deviceInfo.Temperature) : null,
          uptimeSeconds: Number(deviceInfo.UpTime ?? 0),
          lanIp: deviceInfo.LanIp ?? settings.routerHost
        },
        internet: {
          status: wan.LinkStatus === "up" ? "online" : "offline",
          wanIp: wan.ExternalIPAddress ?? null,
          wanIpv6: wan.ExternalIPv6Address ?? null,
          gateway: wan.DefaultGateway ?? null,
          dns: [wan.DNSServer1, wan.DNSServer2].filter(Boolean),
          latencyMs: wan.Latency ? Number(wan.Latency) : null,
          downloadBps: Number(wan.RxRate ?? 0),
          uploadBps: Number(wan.TxRate ?? 0)
        },
        wifi: Array.isArray(wlan) ? wlan.map(b => ({
          ssid: b.SSID ?? "unknown",
          band: b.Frequency === "5G" ? "5GHz" : "2.4GHz",
          enabled: Boolean(b.Enable),
          channel: b.Channel ? Number(b.Channel) : null,
          clients: Number(b.ClientCount ?? 0)
        })) : [],
        devices: hosts.map((h, i) => ({
          id: h.MACAddress ?? `device-${i}`,
          hostname: h.HostName ?? "Unknown Device",
          manufacturer: h.Manufacturer ?? "Unknown",
          vendor: h.Vendor ?? h.Manufacturer ?? "Unknown",
          mac: h.MACAddress ?? "00:00:00:00:00:00",
          ipv4: h.IPAddress ?? null,
          ipv6: h.IPv6Address ?? null,
          signal: h.RSSI ? Number(h.RSSI) : null,
          band: h.InterfaceType === "802.11" ? (h.Frequency === "5G" ? "5GHz" : "2.4GHz") : "Ethernet",
          downloadBps: Number(h.RxRate ?? 0),
          uploadBps: Number(h.TxRate ?? 0),
          trafficTodayBytes: Number(h.TrafficToday ?? 0),
          connectedSince: h.ConnectedSince ?? null,
          online: Boolean(h.Active)
        })),
        dhcp: [],
        trafficHistory: [],
        logs: []
      };
    } catch (err) {
      console.warn("[LHRouterClient] Live fetch failed (expected under CORS/mixed-content restrictions):", err);
      return null;
    }
  }

  return { tryFetchLiveSnapshot };
})();
