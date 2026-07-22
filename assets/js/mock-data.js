// Lavender Home OS — realistic demo data generator (used when no live router
// connection is configured, or as an automatic fallback if the live fetch fails).
const LHMockData = (() => {
  const BASE_DEVICES = [
    { id: "dev-1", hostname: "MacBook-Pro-Sam", manufacturer: "Apple", vendor: "Apple, Inc.", mac: "A4:83:E7:1C:2F:9B", ipv4: "192.168.1.42", ipv6: "fe80::a483:e7ff:fe1c:2f9b", signal: -42, band: "5GHz", connectedSince: 3 },
    { id: "dev-2", hostname: "iPhone-16-Pro", manufacturer: "Apple", vendor: "Apple, Inc.", mac: "BC:D0:74:5A:11:6E", ipv4: "192.168.1.17", ipv6: "fe80::bcd0:74ff:fe5a:116e", signal: -55, band: "5GHz", connectedSince: 8 },
    { id: "dev-3", hostname: "Living-Room-TV", manufacturer: "Samsung", vendor: "Samsung Electronics", mac: "3C:5A:B4:88:0D:22", ipv4: "192.168.1.23", ipv6: null, signal: -61, band: "2.4GHz", connectedSince: 26 },
    { id: "dev-4", hostname: "PS5-Console", manufacturer: "Sony", vendor: "Sony Interactive Entertainment", mac: "F0:D1:A9:33:7C:04", ipv4: "192.168.1.31", ipv6: null, signal: null, band: "Ethernet", connectedSince: 50 },
    { id: "dev-5", hostname: "NEST-Thermostat", manufacturer: "Google", vendor: "Google LLC", mac: "18:B4:30:AA:2B:5D", ipv4: "192.168.1.55", ipv6: null, signal: -68, band: "2.4GHz", connectedSince: 200 },
    { id: "dev-6", hostname: "Work-Laptop-Dell", manufacturer: "Dell", vendor: "Dell Technologies", mac: "C8:5A:CF:19:88:E0", ipv4: "192.168.1.64", ipv6: "fe80::c85a:cfff:fe19:88e0", signal: -49, band: "5GHz", connectedSince: 1.2 },
    { id: "dev-7", hostname: "HomePod-Mini", manufacturer: "Apple", vendor: "Apple, Inc.", mac: "9C:35:EB:70:1A:44", ipv4: "192.168.1.71", ipv6: "fe80::9c35:ebff:fe70:1a44", signal: -58, band: "2.4GHz", connectedSince: 400 }
  ];

  function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  function generateSnapshot(tick = Date.now()) {
    const t = tick / 3000;

    const devices = BASE_DEVICES.map((base, i) => {
      const activity = seededRandom(t * 0.3 + i * 13.7);
      const online = base.band === "Ethernet" || activity > 0.05;
      const download = online ? Math.max(0, seededRandom(t + i) * 8_000_000 * (i === 0 ? 3 : 1)) : 0;
      const upload = online ? Math.max(0, seededRandom(t + i + 50) * 1_500_000) : 0;
      return {
        ...base,
        online,
        downloadBps: download,
        uploadBps: upload,
        trafficTodayBytes: (i + 1) * 1_800_000_000 + seededRandom(i) * 500_000_000,
        connectedSince: new Date(Date.now() - base.connectedSince * 3600_000).toISOString()
      };
    });

    const totalDown = devices.reduce((sum, d) => sum + d.downloadBps, 0);
    const totalUp = devices.reduce((sum, d) => sum + d.uploadBps, 0);

    const wifi = [
      { ssid: "Lavender-Home", band: "2.4GHz", enabled: true, channel: 6, clients: devices.filter(d => d.band === "2.4GHz" && d.online).length },
      { ssid: "Lavender-Home-5G", band: "5GHz", enabled: true, channel: 44, clients: devices.filter(d => d.band === "5GHz" && d.online).length }
    ];

    const dhcp = devices.filter(d => d.ipv4).map(d => ({
      mac: d.mac, ip: d.ipv4, hostname: d.hostname, leaseExpires: new Date(Date.now() + 20 * 3600_000).toISOString()
    }));

    const logs = [
      { id: "log-1", timestamp: new Date(Date.now() - 4 * 60_000).toISOString(), level: "success", title: "Device connected", detail: "iPhone-16-Pro joined Lavender-Home-5G" },
      { id: "log-2", timestamp: new Date(Date.now() - 42 * 60_000).toISOString(), level: "info", title: "DHCP lease renewed", detail: "192.168.1.31 renewed for PS5-Console" },
      { id: "log-3", timestamp: new Date(Date.now() - 3 * 3600_000).toISOString(), level: "warning", title: "High latency detected", detail: "WAN latency spiked to 148ms for 30s" },
      { id: "log-4", timestamp: new Date(Date.now() - 9 * 3600_000).toISOString(), level: "error", title: "Internet disconnected", detail: "WAN link dropped, restored after 12s" },
      { id: "log-5", timestamp: new Date(Date.now() - 26 * 3600_000).toISOString(), level: "info", title: "Router restarted", detail: "Scheduled maintenance reboot completed" }
    ];

    const trafficHistory = Array.from({ length: 30 }).map((_, i) => {
      const pointT = t - (30 - i);
      return {
        timestamp: new Date(tick - (30 - i) * 3000).toISOString(),
        downloadBps: Math.max(0, seededRandom(pointT) * 45_000_000),
        uploadBps: Math.max(0, seededRandom(pointT + 99) * 9_000_000)
      };
    });

    return {
      connectionSource: "mock",
      fetchedAt: new Date().toISOString(),
      internet: {
        status: "online",
        wanIp: "203.0.113.44",
        wanIpv6: "2001:db8:aaaa:bbbb::1",
        gateway: "192.168.1.1",
        dns: ["1.1.1.1", "8.8.8.8"],
        latencyMs: Math.round(12 + seededRandom(t) * 20),
        downloadBps: totalDown,
        uploadBps: totalUp,
        opticalStatus: { rxPowerDbm: -14.2, txPowerDbm: 2.1, online: true }
      },
      router: {
        model: "Huawei HG8145X6",
        firmware: "V5R21C00S150",
        serial: "HW2K3948X6QW",
        macAddress: "58:C6:8A:1F:22:0B",
        cpuPercent: Math.round(18 + seededRandom(t + 3) * 25),
        memoryPercent: Math.round(38 + seededRandom(t + 7) * 15),
        temperatureC: Math.round(46 + seededRandom(t + 11) * 8),
        uptimeSeconds: 9 * 86400 + 4 * 3600,
        lanIp: "192.168.1.1"
      },
      wifi,
      devices,
      dhcp,
      trafficHistory,
      logs
    };
  }

  return { generateSnapshot };
})();
