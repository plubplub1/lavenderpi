// Lavender Home OS — local settings persistence (localStorage only). Router
// username/password are NOT stored here — they're handled by the login
// dialog and saved separately in router-client.js's own storage key.
const LHSettings = (() => {
  const KEY = "lavender-home-os:settings";
  const DEFAULTS = {
    routerHost: "192.168.1.1",
    anthropicApiKey: "",
    refreshInterval: 3
  };

  function get() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
    } catch {
      return { ...DEFAULTS };
    }
  }

  function set(partial) {
    const next = { ...get(), ...partial };
    localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  }

  return { get, set, DEFAULTS };
})();
