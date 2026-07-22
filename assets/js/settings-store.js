// Lavender Home OS — local settings persistence (localStorage only, nothing leaves your browser
// except direct calls you configure to your router or to the Anthropic API).
const LHSettings = (() => {
  const KEY = "lavender-home-os:settings";
  const DEFAULTS = {
    routerHost: "",
    routerUsername: "",
    routerPassword: "",
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
