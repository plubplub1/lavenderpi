// Lavender Home OS — polling store. Calls the real router client only.
// There is NO fallback to mock/demo data — if the router can't be reached,
// subscribers receive `null` and the UI (ConnectionBanner) explains why.
const LHStore = (() => {
  let snapshot = null;
  let timer = null;
  const subscribers = new Set();

  async function tick() {
    try {
      snapshot = await LHRouterClient.fetchSnapshot();
    } catch (err) {
      console.error("[LHStore] fetchSnapshot threw unexpectedly:", err);
      snapshot = null;
    }
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

  async function retryNow() {
    await tick();
    return snapshot;
  }

  function subscribe(fn) {
    subscribers.add(fn);
    fn(snapshot);
    return () => subscribers.delete(fn);
  }

  function getSnapshot() {
    return snapshot;
  }

  return { start, restart, retryNow, subscribe, getSnapshot };
})();
