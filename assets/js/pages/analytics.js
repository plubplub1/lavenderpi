(() => {
  const U = LHUtils;
  let bandwidthChart, topDevicesChart, bandSplitChart;
  let currentPeriod = "Hourly";

  function initCharts() {
    const bwCtx = document.getElementById("bandwidth-chart");
    bandwidthChart = new Chart(bwCtx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Download",
            data: [],
            borderColor: "#B38CFF",
            backgroundColor: "rgba(179,140,255,0.18)",
            fill: true,
            tension: 0.35,
            pointRadius: 0,
            borderWidth: 2
          },
          {
            label: "Upload",
            data: [],
            borderColor: "#4CFF78",
            backgroundColor: "rgba(76,255,120,0.12)",
            fill: true,
            tension: 0.35,
            pointRadius: 0,
            borderWidth: 2
          }
        ]
      },
      options: chartOptions({ y: v => U.formatBytesPerSecond(v) })
    });

    const topCtx = document.getElementById("top-devices-chart");
    topDevicesChart = new Chart(topCtx, {
      type: "bar",
      data: { labels: [], datasets: [{ data: [], backgroundColor: "rgba(179,140,255,0.35)", borderRadius: 6, borderSkipped: false }] },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#1D1D1D",
            borderColor: "rgba(255,255,255,0.08)",
            borderWidth: 1,
            titleColor: "#F4F3F6",
            bodyColor: "#A7A5AE",
            callbacks: { label: (ctx) => U.formatBytes(ctx.parsed.x) }
          }
        },
        scales: {
          x: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#6E6C76", font: { size: 11 }, callback: v => U.formatBytes(v) } },
          y: { grid: { display: false }, ticks: { color: "#A7A5AE", font: { size: 12 } } }
        }
      }
    });

    const pieCtx = document.getElementById("band-split-chart");
    bandSplitChart = new Chart(pieCtx, {
      type: "doughnut",
      data: {
        labels: [],
        datasets: [{ data: [], backgroundColor: ["#8F6EDB", "#B38CFF", "#4CFF78", "#6E6C76"], borderColor: "#151515", borderWidth: 2 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        plugins: {
          legend: { position: "bottom", labels: { color: "#A7A5AE", font: { size: 12 }, padding: 16 } },
          tooltip: { backgroundColor: "#1D1D1D", borderColor: "rgba(255,255,255,0.08)", borderWidth: 1, titleColor: "#F4F3F6", bodyColor: "#A7A5AE" }
        }
      }
    });
  }

  function chartOptions(fmt) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { position: "top", align: "end", labels: { color: "#A7A5AE", boxWidth: 10, boxHeight: 10, usePointStyle: true, font: { size: 12 } } },
        tooltip: {
          backgroundColor: "#1D1D1D", borderColor: "rgba(255,255,255,0.08)", borderWidth: 1,
          titleColor: "#F4F3F6", bodyColor: "#A7A5AE",
          callbacks: { label: (ctx) => `${ctx.dataset.label}: ${fmt.y(ctx.parsed.y)}` }
        }
      },
      scales: {
        x: { grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "#6E6C76", font: { size: 11 }, maxTicksLimit: 8 } },
        y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#6E6C76", font: { size: 11 }, callback: fmt.y } }
      }
    };
  }

  function updateCharts(snapshot) {
    if (!bandwidthChart || !snapshot) return;

    const history = snapshot.trafficHistory || [];
    bandwidthChart.data.labels = history.map(p => new Date(p.timestamp).toLocaleTimeString(undefined, { hour12: false }));
    bandwidthChart.data.datasets[0].data = history.map(p => p.downloadBps);
    bandwidthChart.data.datasets[1].data = history.map(p => p.uploadBps);
    bandwidthChart.update("none");

    const topDevices = [...(snapshot.devices || [])].sort((a, b) => b.trafficTodayBytes - a.trafficTodayBytes).slice(0, 6);
    topDevicesChart.data.labels = topDevices.map(d => d.hostname);
    topDevicesChart.data.datasets[0].data = topDevices.map(d => d.trafficTodayBytes);
    topDevicesChart.update("none");

    const online = (snapshot.devices || []).filter(d => d.online);
    const counts = online.reduce((acc, d) => {
      const key = d.band ?? "Unknown";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    bandSplitChart.data.labels = Object.keys(counts);
    bandSplitChart.data.datasets[0].data = Object.values(counts);
    bandSplitChart.update("none");
  }

  document.addEventListener("DOMContentLoaded", () => {
    initCharts();
    document.querySelectorAll(".pill-tabs button").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".pill-tabs button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentPeriod = btn.dataset.period;
        document.getElementById("period-label").textContent = `${currentPeriod} view`;
      });
    });
  });

  LHStore.subscribe(updateCharts);
})();
