// Lavender Home OS — polling store. Tries a live router fetch (best-effort,
// see router-client.js) and falls back to realistic mock data automatically.
const LHStore = (() => {
  let snapshot = null;
  let timer = null;
  const subscribers = new Set();

  async function tick() {
    const settings = LHSettings.get();
    let live = null;
    try {
      live = await LHRouterClient.tryFetchLiveSnapshot(settings);
    } catch {
      live = null;
    }
    snapshot = live ?? LHMockData.generateSnapshot(Date.now());
    subscribers.forEach(fn => fn(snapshot));
  }

  function start() {
    if (timer) return;
    tick();
    const settings = LHSettings.get();
    const interval = Math.max(1, Number(settings.refreshInterval) || 3) * 1000;
    timer = setInterval(tick, interval);
  }

  function restart() {
    if (timer) { clearInterval(timer); timer = null; }
    start();
  }

  function subscribe(fn) {
    subscribers.add(fn);
    if (snapshot) fn(snapshot);
    return () => subscribers.delete(fn);
  }

  function getSnapshot() {
    return snapshot;
  }

  return { start, restart, subscribe, getSnapshot };
})();
