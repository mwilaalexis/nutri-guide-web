import { useEffect, useState } from "react";
import api from "../services/api";

export default function Performance() {
  const [avgResponseTime, setAvgResponseTime] = useState(0);
  const [cpuLoad, setCpuLoad] = useState(0);
  const [ramUsage, setRamUsage] = useState(0);
  const [uptime, setUptime] = useState("0s");
  const [requestsPerMinute, setRequestsPerMinute] = useState(0);
  const [errorsLast24h, setErrorsLast24h] = useState(0);

  useEffect(() => {
    // 1. Measure response time to your API
    const measureResponseTime = async () => {
      const start = performance.now();
      try {
        await api.get("/api/health");
      } catch {}
      const end = performance.now();
      setAvgResponseTime(Math.round(end - start));
    };

    // 2. Approximate CPU load (client-side)
    const measureCpu = () => {
      const start = performance.now();
      let x = 0;
      for (let i = 0; i < 500000; i++) x += i;
      const end = performance.now();
      const load = Math.min(100, Math.round((end - start) * 2));
      setCpuLoad(load);
    };

    // 3. RAM usage (Chrome only)
    const measureRam = () => {
      if ((performance as any).memory) {
        const mem = (performance as any).memory.usedJSHeapSize / 1024 / 1024 / 1024;
        setRamUsage(Number(mem.toFixed(2)));
      } else {
        setRamUsage(0);
      }
    };

    // 4. Uptime since page load
    const updateUptime = () => {
      const seconds = Math.floor(performance.now() / 1000);
      setUptime(seconds + "s");
    };

    // 5. Requests per minute (frontend only)
    let reqCount = 0;
    const originalFetch = window.fetch;
    window.fetch = (...args) => {
      reqCount++;
      return originalFetch(...args);
    };
    setInterval(() => setRequestsPerMinute(reqCount), 60000);

    // 6. JS errors
    window.addEventListener("error", () => {
      setErrorsLast24h((prev) => prev + 1);
    });

    // Run initial measurements
    measureResponseTime();
    measureCpu();
    measureRam();
    updateUptime();

    // Update uptime every second
    const uptimeInterval = setInterval(updateUptime, 1000);

    return () => clearInterval(uptimeInterval);
  }, []);

  return (
    <main>
      <h1>Performance</h1>
      <p>Client-side performance statistics.</p>

      <div className="cards">
        <div className="card">
          <h3>Average Response Time</h3>
          <p>{avgResponseTime} ms</p>
        </div>

        <div className="card">
          <h3>CPU Load (client)</h3>
          <p>{cpuLoad}%</p>
        </div>

        <div className="card">
          <h3>RAM Usage (client)</h3>
          <p>{ramUsage} GB</p>
        </div>

        <div className="card">
          <h3>Uptime (session)</h3>
          <p>{uptime}</p>
        </div>

        <div className="card">
          <h3>Requests per Minute</h3>
          <p>{requestsPerMinute}</p>
        </div>

        <div className="card">
          <h3>Errors Detected</h3>
          <p>{errorsLast24h} (last 24h)</p>
        </div>
      </div>

      {/* Your charts stay the same */}
      <div className="chart-section">
        <div className="chart-card">
          <h3>CPU Load (Last 7 Days)</h3>
          <img
            src="https://quickchart.io/chart?c={type:'line',data:{labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],datasets:[{label:'CPU %',data:[30,35,28,40,32,31,33],borderColor:'%232b8a3e',fill:false}]}}"
            alt="CPU chart"
            style={{ width: '100%' }}
          />
        </div>

        <div className="chart-card">
          <h3>RAM Usage (Last 7 Days)</h3>
          <img
            src="https://quickchart.io/chart?c={type:'bar',data:{labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],datasets:[{label:'RAM (GB)',data:[4.1,4.3,4.0,4.5,4.2,4.1,4.4],backgroundColor:'%2374c69d'}]}}"
            alt="RAM chart"
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </main>
  );
}
