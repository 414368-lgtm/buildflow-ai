import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import AIChat from "./components/AIChat";
const navItems = [
  { label: "Overview", icon: "🏠", id: "overview" },
  { label: "Projects", icon: "📁", id: "projects" },
  { label: "Tasks", icon: "✅", id: "tasks" },
  { label: "Team", icon: "👥", id: "team" },
  { label: "Budget", icon: "💼", id: "budget" },
  { label: "AI Assist", icon: "🤖", id: "ai" },
];

const metrics = [
  {
    label: "Active Projects",
    value: "8",
    detail: "2 launching today",
    trend: "+18%",
    icon: "project",
    progress: 70,
    progressClass: "progress-70",
  },
  {
    label: "Monthly Budget",
    value: "$842K",
    detail: "Forecast on track",
    trend: "-3%",
    icon: "budget",
    progress: 88,
    progressClass: "progress-88",
  },
  {
    label: "Team Capacity",
    value: "36/40",
    detail: "4 seats open",
    trend: "+12%",
    icon: "team",
    progress: 90,
    progressClass: "progress-90",
  },
  {
    label: "Risk Score",
    value: "12%",
    detail: "Low exposure",
    trend: "-9%",
    icon: "shield",
    progress: 52,
    progressClass: "progress-52",
  },
];

const activityItems = [
  { time: "2m ago", description: "Sarah approved the procurement request.", status: "approved" },
  { time: "14m ago", description: "New issue logged for HVAC integration.", status: "alert" },
  { time: "1h ago", description: "Budget forecast updated for Q3.", status: "update" },
  { time: "3h ago", description: "Worker check-in completed at Maple Creek Hub.", status: "success" },
  { time: "5h ago", description: "New milestone added to North Ridge Towers.", status: "update" },
];

const notifications = [
  { title: "Weekly summary ready", time: "Just now" },
  { title: "3 tasks overdue", time: "20m ago" },
  { title: "New comment on Maple Creek Hub", time: "1h ago" },
];

const projects = [
  { name: "North Ridge Towers", owner: "Frank", due: "Nov 12", status: "On track", badge: "success" },
  { name: "Maple Creek Hub", owner: "Ari", due: "Nov 18", status: "At risk", badge: "alert" },
  { name: "Riverfront Workspace", owner: "Lena", due: "Dec 4", status: "Review", badge: "update" },
  { name: "Skyline Retail Park", owner: "Noah", due: "Dec 15", status: "On track", badge: "success" },
];

const chartLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const chartTabs = [
  { id: "velocity", label: "Velocity" },
  { id: "budget", label: "Budget" },
  { id: "capacity", label: "Capacity" },
];

const NavButton = ({ item, active, onSelect }) => (
  <button
    type="button"
    className={active ? "nav-item active" : "nav-item"}
    onClick={() => onSelect(item)}
    aria-current={active ? "page" : undefined}
  >
    <span className="nav-icon" data-icon={item.icon} aria-hidden="true" />
    <span>{item.label}</span>
  </button>
);

const MetricCard = ({ metric, value, loaded }) => (
  <article className={loaded ? "stat-card" : "stat-card stat-card-loading"}>
    <div className="stat-card-head">
      <span className={`stat-icon stat-icon-${metric.icon}`} aria-hidden="true" />
      <div>
        <p className="stat-label">{metric.label}</p>
        <span className="trend-badge">{metric.trend}</span>
      </div>
    </div>
    <h2>{loaded ? value : ""}</h2>
    <p className="stat-detail">{metric.detail}</p>
    <div className="stat-progress">
      <div className="stat-progress-track">
        <div className={`stat-progress-fill ${metric.progressClass} ${loaded ? "progress-ready" : ""}`} />
      </div>
      <span>{metric.progress}% to goal</span>
    </div>
  </article>
);

const NotificationItem = ({ note }) => (
  <div className="notification-item">
    <p>{note.title}</p>
    <span>{note.time}</span>
  </div>
);

const ProjectRow = ({ project }) => (
  <div className="project-row">
    <div>
      <p className="project-name">{project.name}</p>
      <p className="project-meta">
        {project.owner} · due {project.due}
      </p>
    </div>
    <span className={`status-pill ${project.badge}`}>{project.status}</span>
  </div>
);

const ActivityItem = ({ item }) => (
  <div className="activity-item">
    <div>
      <p className="activity-time">{item.time}</p>
      <p>{item.description}</p>
    </div>
    <span className={`status-pill ${item.status}`}>{item.status}</span>
  </div>
);

const AnimatedLineChart = ({ data, labels }) => {
  const [isVisible, setIsVisible] = useState(false);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(chartRef.current);
    return () => observer.disconnect();
  }, []);

  const width = 110;
  const height = 120;
  const leftPadding = 6;
  const rightPadding = 6;
  const topPadding = 10;
  const bottomPadding = 16;
  const maxValue = Math.max(...data);
  const points = data.map((value, index) => {
    const x = leftPadding + ((width - leftPadding - rightPadding) * index) / (data.length - 1);
    const y = topPadding + (height - topPadding - bottomPadding) * (1 - value / maxValue);
    return {
      x,
      y,
      value,
      label: `${labels[index]} · ${value}`,
      index,
    };
  });

  const pathD = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - bottomPadding} L ${points[0].x} ${height - bottomPadding} Z`;

  return (
    <div className={isVisible ? "chart-wrapper chart-animate" : "chart-wrapper"} ref={chartRef}>
      <svg viewBox="0 0 110 120" className="chart-svg" aria-label="Delivery chart">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff8c42" />
            <stop offset="100%" stopColor="#ffcf92" />
          </linearGradient>
          <linearGradient id="fillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 140, 66, 0.24)" />
            <stop offset="100%" stopColor="rgba(255, 140, 66, 0)" />
          </linearGradient>
          <filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0 0 0.37 0 0 0 0 0 0.14 0 0 0 0 0 0.28 0"
            />
          </filter>
          <clipPath id="revealClip">
            <rect className={isVisible ? "reveal-mask reveal-mask-active" : "reveal-mask"} x="0" y="0" width="110" height="120" />
          </clipPath>
        </defs>

        <g clipPath="url(#revealClip)">
          <g className="svg-grid-lines">
            {[1, 2, 3, 4].map((row) => (
              <line
                key={row}
                x1="0"
                x2="110"
                y1={topPadding + ((height - topPadding - bottomPadding) / 4) * row}
                y2={topPadding + ((height - topPadding - bottomPadding) / 4) * row}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="1"
              />
            ))}
          </g>

          <path
            d={areaD}
            className="chart-area"
            fill="url(#fillGradient)"
            opacity="0.65"
          />

          <path
            d={pathD}
            className={isVisible ? "chart-line chart-line-active" : "chart-line"}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="1"
          />

          <path
            d={pathD}
            className="chart-line-shadow"
            fill="none"
            stroke="rgba(255, 140, 66, 0.18)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#lineGlow)"
          />

          {points.map((point) => (
            <circle
              key={point.index}
              className={`chart-point ${point.index === points.length - 1 ? "final-point" : ""}`}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#ff8c42"
            >
              <title>{point.label}</title>
            </circle>
          ))}
        </g>
      </svg>
      <div className="chart-labels">
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
};

function App() {
  const [activeNav, setActiveNav] = useState("overview");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [chartMetric, setChartMetric] = useState("velocity");
  const [statusMessage, setStatusMessage] = useState("Ready to drive your next release.");
  const [loaded, setLoaded] = useState(false);
  const [counterValues, setCounterValues] = useState(metrics.map((metric) => metric.value));

  useEffect(() => {
    const values = metrics.map((metric) => {
      const raw = Number(metric.value.replace(/[^0-9.-]/g, ""));
      return Number.isNaN(raw) ? null : raw;
    });

    const duration = 1000;
    const start = performance.now();

    const animate = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      setCounterValues(
        metrics.map((metric, index) => {
          const target = values[index];
          if (target === null) {
            return metric.value;
          }
          const current = Math.round(target * progress);
          if (metric.value.includes("$")) {
            return `$${current}K`;
          }
          if (metric.value.includes("%")) {
            return `${current}%`;
          }
          return `${current}`;
        })
      );
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 220);
    return () => clearTimeout(timer);
  }, []);

  const chartData = useMemo(() => {
    const dataset = {
      velocity: [32, 42, 36, 52, 47, 68, 82, 76, 88, 102, 97, 115],
      budget: [24, 29, 34, 40, 54, 61, 58, 65, 72, 80, 78, 91],
      capacity: [74, 78, 82, 80, 84, 88, 90, 86, 88, 92, 95, 98],
    };
    return dataset[chartMetric] || dataset.velocity;
  }, [chartMetric]);

  const maxPoint = Math.max(...chartData);
  const chartPoints = chartData.map((point, index) => {
    const x = index * 9.1;
    const y = 110 - (point / maxPoint) * 90;
    return {
      point,
      index,
      x,
      y,
      label: `${chartLabels[index]} · ${point}`,
      left: `${(x / 110) * 100}%`,
      top: `${(y / 120) * 100}%`,
    };
  });

  const chartPath = chartPoints.map((point) => `${point.x} ${point.y}`).join(" ");

  const filteredActivity = activityItems.filter((item) =>
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeSection = navItems.find((item) => item.id === activeNav)?.label || "Overview";

  return (
    <div className={`app ${isDarkMode ? "app-dark" : "app-light"} ${loaded ? "loaded" : "loading"}`}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff8c42" />
                  <stop offset="100%" stopColor="#ffbe7c" />
                </linearGradient>
              </defs>
              <rect x="12" y="16" width="12" height="32" rx="4" fill="#ffffff" opacity="0.92" />
              <path d="M30 18h18v12L36 42H30V18Z" fill="url(#logoGradient)" />
              <path d="M18 42h28v6c0 2.2-1.8 4-4 4H22c-2.2 0-4-1.8-4-4v-6Z" fill="#ff8c42" opacity="0.18" />
              <path d="M34 24l8-8v20" stroke="#ff8c42" strokeWidth="4" strokeLinecap="round" />
              <path d="M30 20h10" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.88" />
            </svg>
          </div>
          <div>
            <p className="brand-name">BuildFlow</p>
            <p className="brand-subtitle">Operational suite</p>
          </div>
        </div>

        <button
          className="sidebar-action"
          type="button"
          onClick={() => setStatusMessage("Create project workflow launched.")}
        >
          Create project
        </button>

        <nav className="nav-menu" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              active={item.id === activeNav}
              onSelect={(selectedItem) => {
                setActiveNav(selectedItem.id);
                setStatusMessage(`${selectedItem.label} selected.`);
              }}
            />
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="status-badge">Pro</span>
          <p>BuildFlow helps teams move from plan to delivery with confidence.</p>
        </div>
      </aside>

      <main className="dashboard">
        <div className="dashboard-topbar">
          <div className="topbar-search">
            <span>🔎</span>
            <label htmlFor="dashboard-search" className="sr-only">
              Search notifications or activity
            </label>
            <input
              id="dashboard-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search notifications or activity"
            />
          </div>

          <div className="topbar-actions">
            <button
              type="button"
              className="icon-button"
              onClick={() => setIsDarkMode((prev) => !prev)}
              aria-label="Toggle theme"
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>
            <button
              type="button"
              className="icon-button"
              aria-label="Notifications"
              aria-controls="notifications-panel"
              aria-expanded={showNotifications}
              onClick={() => setShowNotifications((prev) => !prev)}
            >
              🔔
              <span className="notification-badge">3</span>
            </button>
            <button
              type="button"
              className="icon-button"
              aria-label="Settings"
              onClick={() => setStatusMessage("Settings panel opening soon.")}
            >
              ⚙️
            </button>
            <div className="profile-pill">SO</div>
          </div>
        </div>

        {showNotifications && (
          <section
            id="notifications-panel"
            aria-labelledby="notifications-heading"
            className="notifications-panel panel-card"
          >
            <div className="notifications-header">
              <div>
                <p className="panel-eyebrow">Notifications</p>
                <h2 id="notifications-heading">Inbox</h2>
              </div>
              <button
                type="button"
                className="ghost-button"
                onClick={() => setShowNotifications(false)}
                aria-label="Close notifications panel"
              >
                Close
              </button>
            </div>
            <div className="notification-list">
              {notifications.map((note) => (
                <NotificationItem key={note.title} note={note} />
              ))}
            </div>
          </section>
        )}

        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Good morning, Sofia</p>
            <h1>{activeSection} insights</h1>
            <p className="subtitle">
              Monitor team velocity, financial health, and delivery risks from one elegant workspace.
            </p>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="chip-button"
              onClick={() => setStatusMessage("Workflow optimization in progress.")}
            >
              Optimize workflow
            </button>
            <button
              type="button"
              className="header-button"
              onClick={() => setStatusMessage("Report generation queued.")}
            >
              Generate report
            </button>
          </div>
        </header>

        <div className="status-banner" aria-live="polite">{statusMessage}</div>

        <section className="stats-grid">
          {metrics.map((metric, index) => (
            <MetricCard
              key={metric.label}
              metric={metric}
              loaded={loaded}
              value={counterValues[index]}
            />
          ))}
        </section>

        <section className="analytics-section">
          <div className="analytics-panel panel-card">
            <div className="panel-header">
              <div>
                <p className="panel-eyebrow">Analytics</p>
                <h2>Delivery velocity</h2>
              </div>
              <div className="metric-tabs">
                {chartTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={chartMetric === tab.id ? "tab-button active" : "tab-button"}
                    onClick={() => {
                      setChartMetric(tab.id);
                      setStatusMessage(`${tab.label} metric selected.`);
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="analytics-summary">
              <div>
                <p className="mini-label">Revenue impact</p>
                <h3>+14.3%</h3>
              </div>
              <div>
                <p className="mini-label">Projected growth</p>
                <h3>22.6%</h3>
              </div>
              <div>
                <p className="mini-label">At-risk projects</p>
                <h3>2</h3>
              </div>
            </div>

            <div className="analytics-chart">
              <AnimatedLineChart data={chartData} labels={chartLabels} />
            </div>
          </div>

          <div className="workspace-side">
            <div className="info-card panel-card">
              <div className="info-header">
                <p>Budget allocation</p>
                <span>+12%</span>
              </div>
              <h2>$842,000</h2>
              <p className="info-text">Budget buffers remain healthy for all in-flight projects.</p>
            </div>

            <div className="info-card panel-card">
              <div className="info-header">
                <p>Workers online</p>
                <span>Stable</span>
              </div>
              <h2>36</h2>
              <div className="worker-status">
                <span>Site 12</span>
                <span>Remote 24</span>
              </div>
            </div>

              <div className="projects-card panel-card">
              <div className="info-header">
                <p>Recent projects</p>
                <span>{projects.length} active</span>
              </div>
              <div className="projects-table">
                {projects.map((project) => (
                  <ProjectRow key={project.name} project={project} />
                ))}
              </div>
            </div>

            <div className="assistant-card panel-card">
              <div className="assistant-top">
                <div>
                  <p className="panel-eyebrow">AI Assistant</p>
                  <h2>BuildFlow Copilot</h2>
                </div>
                <span className="assistant-badge">Live</span>
              </div>
              <p className="assistant-copy">
                Get instant recommendations for budgets, schedules, and resource risk.
              </p>
              <button
                type="button"
                className="assistant-button"
                onClick={() => setStatusMessage("BuildFlow Copilot launched.")}
              >
                Launch assistant
              </button>
            </div>
          </div>
        </section>

        <section className="activity-panel panel-card" aria-labelledby="activity-heading">
          <div className="panel-header">
            <div>
              <p className="panel-eyebrow">Recent activity</p>
              <h2 id="activity-heading">Team updates and approvals</h2>
            </div>
            <button
              type="button"
              className="ghost-button"
              onClick={() => setStatusMessage("Activity history timeline opened.")}
            >
              See history
            </button>
          </div>

          <div className="activity-list">
            {filteredActivity.map((item) => (
              <ActivityItem key={item.time + item.status} item={item} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;