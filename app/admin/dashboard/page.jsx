"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../admin.module.css";
import {
  clearAdminSession,
  getAdminAuthHeaders,
  getAdminToken,
} from "../../../lib/panelAuth";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://utsavas-backend-1.onrender.com";

const EMPTY_ANALYTICS = {
  month: "",
  chartData: [],
  hallBreakdown: [],
  availableHalls: [],
  selectedHallId: "",
  selectedHall: null,
  scope: "all",
  totals: {
    hallViews: 0,
    phoneViews: 0,
    trackedHalls: 0,
    totalHalls: 0,
  },
};

const formatMonthQuery = (value) =>
  `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;

const getHallOptionLabel = (hall) =>
  hall ? `${hall.hallName} - ${hall.vendorName}` : "All registered halls";

const formatHallStatus = (value) => {
  const normalizedValue = String(value || "").toLowerCase();

  if (normalizedValue === "approved") return "Approved";
  if (normalizedValue === "rejected") return "Rejected";
  return "Pending";
};

const buildChartPoints = (data, metricKey, chartWidth, chartHeight, padding) => {
  const maxValue = Math.max(
    1,
    ...data.map((entry) =>
      Math.max(Number(entry?.hallViews) || 0, Number(entry?.phoneViews) || 0)
    )
  );
  const usableWidth = chartWidth - padding * 2;
  const usableHeight = chartHeight - padding * 2;

  return data.map((entry, index) => {
    const value = Number(entry?.[metricKey]) || 0;
    const x =
      padding +
      (usableWidth * index) / Math.max((data.length || 1) - 1, 1);
    const y = chartHeight - padding - (value / maxValue) * usableHeight;

    return {
      x,
      y,
      value,
    };
  });
};

const buildSvgLinePath = (points) =>
  points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

const buildSvgAreaPath = (points, chartHeight, padding) => {
  if (!points.length) {
    return "";
  }

  const linePath = buildSvgLinePath(points);
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  return `${linePath} L ${lastPoint.x} ${chartHeight - padding} L ${firstPoint.x} ${
    chartHeight - padding
  } Z`;
};

export default function AdminDashboard() {
  const router = useRouter();
  const hallPickerRef = useRef(null);

  const [stats, setStats] = useState({
    totalVendors: 0,
    totalHalls: 0,
    pendingHalls: 0,
    pendingVendors: 0,
  });
  const [analytics, setAnalytics] = useState(EMPTY_ANALYTICS);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedAnalyticsHallId, setSelectedAnalyticsHallId] = useState("");
  const [hallSearchQuery, setHallSearchQuery] = useState("");
  const [showHallSearchResults, setShowHallSearchResults] = useState(false);

  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setAnalyticsLoading(true);
        const adminToken = getAdminToken();

        if (!adminToken) {
          clearAdminSession();
          router.replace("/admin/login");
          return;
        }

        const monthQuery = formatMonthQuery(currentMonth);
        const query = new URLSearchParams({
          month: monthQuery,
        });

        if (selectedAnalyticsHallId) {
          query.set("hallId", selectedAnalyticsHallId);
        }

        const res = await fetch(`${API}/api/admin/dashboard-stats?${query.toString()}`, {
          headers: getAdminAuthHeaders(),
          cache: "no-store",
        });

        if (res.status === 401 || res.status === 403) {
          clearAdminSession();
          router.replace("/admin/login");
          return;
        }

        const data = await res.json();

        setStats({
          totalVendors: data.totalVendors || 0,
          totalHalls: data.totalHalls || 0,
          pendingHalls: data.pendingHalls || 0,
          pendingVendors: data.pendingVendors || 0,
        });
        const nextAnalytics = data.analytics || EMPTY_ANALYTICS;
        setAnalytics(nextAnalytics);
        setSelectedAnalyticsHallId(nextAnalytics.selectedHallId || "");
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
        setAnalytics(EMPTY_ANALYTICS);
      } finally {
        setLoading(false);
        setAnalyticsLoading(false);
      }
    };

    fetchStats();

    const intervalId = window.setInterval(fetchStats, 10000);
    const handleVisibility = () => {
      if (!document.hidden) fetchStats();
    };

    window.addEventListener("focus", fetchStats);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", fetchStats);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [currentMonth, router, selectedAnalyticsHallId]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        hallPickerRef.current &&
        !hallPickerRef.current.contains(event.target)
      ) {
        setShowHallSearchResults(false);
        setHallSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleLogout = () => {
    clearAdminSession();
    router.push("/admin/login");
  };

  if (loading) {
    return <p className={styles.loading}>Loading dashboard...</p>;
  }

  const chartWidth = 820;
  const chartHeight = 280;
  const chartPadding = 28;
  const chartGridLines = 4;
  const chartData = Array.isArray(analytics?.chartData) ? analytics.chartData : [];
  const hallBreakdown = Array.isArray(analytics?.hallBreakdown)
    ? analytics.hallBreakdown
    : [];
  const availableHalls = Array.isArray(analytics?.availableHalls)
    ? analytics.availableHalls
    : [];
  const selectedHallOption =
    availableHalls.find(
      (hall) => String(hall.hallId) === String(selectedAnalyticsHallId)
    ) || null;
  const selectedAnalyticsHall =
    analytics?.selectedHall && analytics.selectedHall.hallId
      ? analytics.selectedHall
      : null;
  const isHallScoped = Boolean(selectedAnalyticsHall);
  const hallViewPoints = buildChartPoints(
    chartData,
    "hallViews",
    chartWidth,
    chartHeight,
    chartPadding
  );
  const phoneViewPoints = buildChartPoints(
    chartData,
    "phoneViews",
    chartWidth,
    chartHeight,
    chartPadding
  );
  const hallViewLinePath = buildSvgLinePath(hallViewPoints);
  const hallViewAreaPath = buildSvgAreaPath(
    hallViewPoints,
    chartHeight,
    chartPadding
  );
  const phoneViewLinePath = buildSvgLinePath(phoneViewPoints);
  const selectedMonthLabel = currentMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  const analyticsTotals = analytics?.totals || EMPTY_ANALYTICS.totals;
  const hasChartActivity =
    Number(analyticsTotals.hallViews) > 0 || Number(analyticsTotals.phoneViews) > 0;
  const rankedHallBreakdown = hallBreakdown.filter(
    (hall) => Number(hall?.hallViews) > 0 || Number(hall?.phoneViews) > 0
  );
  const filteredHallOptions = availableHalls.filter((hall) => {
    const query = hallSearchQuery.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return [hall.hallName, hall.vendorName, hall.hallStatus]
      .some((value) => String(value || "").toLowerCase().includes(query));
  });
  const maxHallViews = Math.max(
    1,
    ...hallBreakdown.map((hall) => Number(hall?.hallViews) || 0),
    Number(selectedAnalyticsHall?.hallViews) || 0
  );
  const maxPhoneViews = Math.max(
    1,
    ...hallBreakdown.map((hall) => Number(hall?.phoneViews) || 0),
    Number(selectedAnalyticsHall?.phoneViews) || 0
  );

  return (
    <div>
      <div className={styles.container}>
        {/* TOP HEADER */}
        <div className={styles.topHeader}>
          <h1 className={styles.header}>Utsavas Admin Dashboard</h1>

          <button
            className={styles.logoutButton}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        {/* STATS CARDS */}
        <div className={styles.cardGrid}>
          <button
            type="button"
            className={`${styles.card} ${styles.statCard}`}
            onClick={() => router.push("/admin/vendors?status=all")}
          >
            <h3>Total Vendors</h3>
            <p className={styles.count}>{stats.totalVendors}</p>
          </button>

          <button
            type="button"
            className={`${styles.card} ${styles.statCard}`}
            onClick={() => router.push("/admin/vendors?status=pending")}
          >
            <h3>Pending Vendors</h3>
            <p className={styles.count}>{stats.pendingVendors}</p>
          </button>

          <button
            type="button"
            className={`${styles.card} ${styles.statCard}`}
            onClick={() => router.push("/admin/halls?status=all")}
          >
            <h3>Total Halls</h3>
            <p className={styles.count}>{stats.totalHalls}</p>
          </button>

          <button
            type="button"
            className={`${styles.card} ${styles.statCard}`}
            onClick={() => router.push("/admin/halls?status=pending")}
          >
            <h3>Pending Halls</h3>
            <p className={styles.count}>{stats.pendingHalls}</p>
          </button>
        </div>

        <section className={styles.adminAnalyticsSection}>
          <div className={styles.adminAnalyticsHeader}>
            <div>
              <p className={styles.adminAnalyticsEyebrow}>Platform Analytics</p>
              <h2 className={styles.adminAnalyticsTitle}>
                Hall interaction insights
              </h2>
              <p className={styles.adminAnalyticsCopy}>
                {isHallScoped
                  ? `Public hall detail clicks and phone-number views for ${selectedAnalyticsHall.hallName} by ${selectedAnalyticsHall.vendorName} in ${selectedMonthLabel}.`
                  : `Public hall detail clicks and phone-number views across all registered halls in ${selectedMonthLabel}.`}
              </p>
            </div>

            <div className={styles.adminAnalyticsHeaderActions}>
              <div
                className={styles.adminAnalyticsFilterField}
                ref={hallPickerRef}
              >
                <span>Hall</span>
                <div className={styles.adminAnalyticsSearchShell}>
                  <input
                    type="text"
                    className={styles.adminAnalyticsSearchInput}
                    value={hallSearchQuery}
                    placeholder={getHallOptionLabel(selectedHallOption)}
                    onFocus={() => setShowHallSearchResults(true)}
                    onChange={(event) => {
                      setHallSearchQuery(event.target.value);
                      setShowHallSearchResults(true);
                    }}
                  />

                  <button
                    type="button"
                    className={styles.adminAnalyticsSearchChevron}
                    onClick={() => {
                      setShowHallSearchResults((currentValue) => !currentValue);
                      setHallSearchQuery("");
                    }}
                    aria-label="Toggle hall search"
                  >
                    {showHallSearchResults ? "˄" : "˅"}
                  </button>

                  {showHallSearchResults ? (
                    <div className={styles.adminAnalyticsSearchResults}>
                      <button
                        type="button"
                        className={`${styles.adminAnalyticsSearchOption} ${
                          !selectedAnalyticsHallId
                            ? styles.adminAnalyticsSearchOptionActive
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedAnalyticsHallId("");
                          setHallSearchQuery("");
                          setShowHallSearchResults(false);
                        }}
                      >
                        <strong>All registered halls</strong>
                        <span>Show combined analytics for every hall</span>
                      </button>

                      {filteredHallOptions.length === 0 ? (
                        <p className={styles.adminAnalyticsSearchEmpty}>
                          No halls match your search.
                        </p>
                      ) : (
                        filteredHallOptions.map((hall) => (
                          <button
                            key={hall.hallId}
                            type="button"
                            className={`${styles.adminAnalyticsSearchOption} ${
                              String(hall.hallId) ===
                              String(selectedAnalyticsHallId)
                                ? styles.adminAnalyticsSearchOptionActive
                                : ""
                            }`}
                            onClick={() => {
                              setSelectedAnalyticsHallId(hall.hallId);
                              setHallSearchQuery("");
                              setShowHallSearchResults(false);
                            }}
                          >
                            <strong>{hall.hallName}</strong>
                            <span>
                              {hall.vendorName} · {formatHallStatus(hall.hallStatus)}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className={styles.adminAnalyticsControls}>
                <button
                  type="button"
                  className={styles.adminMonthButton}
                  onClick={() =>
                    setCurrentMonth(
                      new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth() - 1,
                        1
                      )
                    )
                  }
                >
                  {"<"}
                </button>

                <div className={styles.adminAnalyticsMonthBadge}>
                  {selectedMonthLabel}
                </div>

                <button
                  type="button"
                  className={styles.adminMonthButton}
                  onClick={() =>
                    setCurrentMonth(
                      new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth() + 1,
                        1
                      )
                    )
                  }
                >
                  {">"}
                </button>
              </div>
            </div>
          </div>

          <div className={styles.adminAnalyticsStats}>
            <div className={styles.adminAnalyticsStatCard}>
              <span>Hall clicks</span>
              <strong>{analyticsTotals.hallViews}</strong>
            </div>

            <div className={styles.adminAnalyticsStatCard}>
              <span>Phone views</span>
              <strong>{analyticsTotals.phoneViews}</strong>
            </div>

            <div className={styles.adminAnalyticsStatCard}>
              <span>{isHallScoped ? "Selected hall" : "Tracked halls"}</span>
              <strong>
                {isHallScoped
                  ? selectedAnalyticsHall.hallName
                  : analyticsTotals.trackedHalls}
              </strong>
            </div>

            <div className={styles.adminAnalyticsStatCard}>
              <span>{isHallScoped ? "Vendor" : "Registered halls"}</span>
              <strong>
                {isHallScoped
                  ? selectedAnalyticsHall.vendorName
                  : analyticsTotals.totalHalls}
              </strong>
            </div>
          </div>

          <div className={styles.adminAnalyticsLayout}>
            <article className={styles.adminAnalyticsChartCard}>
              <div className={styles.adminAnalyticsCardHeader}>
                <div>
                  <h3>Daily interaction trend</h3>
                  <p>
                    {isHallScoped
                      ? "User clicks and phone-number views for the selected hall."
                      : "Combined traffic across all registered halls."}
                  </p>
                </div>

                <div className={styles.adminAnalyticsLegend}>
                  <span className={styles.adminLegendViews}>Hall clicks</span>
                  <span className={styles.adminLegendPhone}>Phone views</span>
                </div>
              </div>

              {analyticsLoading ? (
                <p className={styles.adminAnalyticsEmpty}>Loading chart...</p>
              ) : !hasChartActivity ? (
                <p className={styles.adminAnalyticsEmpty}>
                  No hall analytics tracked for this month yet.
                </p>
              ) : (
                <>
                  <svg
                    className={styles.adminAnalyticsChart}
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    role="img"
                    aria-label="Admin hall analytics chart"
                  >
                    <defs>
                      <linearGradient
                        id="adminHallViewsGradient"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#4a79be" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#4a79be" stopOpacity="0.03" />
                      </linearGradient>
                    </defs>

                    {Array.from({ length: chartGridLines }).map((_, index) => {
                      const y =
                        chartPadding +
                        ((chartHeight - chartPadding * 2) * index) /
                          Math.max(chartGridLines - 1, 1);

                      return (
                        <line
                          key={index}
                          x1={chartPadding}
                          x2={chartWidth - chartPadding}
                          y1={y}
                          y2={y}
                          className={styles.adminAnalyticsGridLine}
                        />
                      );
                    })}

                    {hallViewAreaPath ? (
                      <path
                        d={hallViewAreaPath}
                        fill="url(#adminHallViewsGradient)"
                        stroke="none"
                      />
                    ) : null}

                    {hallViewLinePath ? (
                      <path
                        d={hallViewLinePath}
                        fill="none"
                        className={styles.adminAnalyticsHallViewsLine}
                      />
                    ) : null}

                    {phoneViewLinePath ? (
                      <path
                        d={phoneViewLinePath}
                        fill="none"
                        className={styles.adminAnalyticsPhoneViewsLine}
                      />
                    ) : null}
                  </svg>

                  <div className={styles.adminAnalyticsChartLabels}>
                    {chartData.map((entry) => (
                      <span key={entry.dateKey}>{entry.label}</span>
                    ))}
                  </div>
                </>
              )}
            </article>

            <div className={styles.adminAnalyticsSidebar}>
              {isHallScoped ? (
                <section className={styles.adminAnalyticsFocusCard}>
                  <div className={styles.adminAnalyticsCardHeader}>
                    <div>
                      <h3>Selected hall performance</h3>
                      <p>
                        Admin hall-wise analytics for the selected registered hall.
                      </p>
                    </div>
                  </div>

                  <div className={styles.adminAnalyticsFocusMeta}>
                    <div>
                      <span>Hall</span>
                      <strong>{selectedAnalyticsHall.hallName}</strong>
                    </div>

                    <div>
                      <span>Vendor</span>
                      <strong>{selectedAnalyticsHall.vendorName}</strong>
                    </div>
                  </div>

                  <div className={styles.adminAnalyticsBarGroup}>
                    <div>
                      <label>Hall clicks</label>
                      <div className={styles.adminAnalyticsBarTrack}>
                        <span
                          className={styles.adminAnalyticsBarViews}
                          style={{
                            width: `${
                              (Math.max(
                                Number(selectedAnalyticsHall.hallViews) || 0,
                                0
                              ) /
                                maxHallViews) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <small>{selectedAnalyticsHall.hallViews}</small>
                    </div>

                    <div>
                      <label>Phone views</label>
                      <div className={styles.adminAnalyticsBarTrack}>
                        <span
                          className={styles.adminAnalyticsBarPhone}
                          style={{
                            width: `${
                              (Math.max(
                                Number(selectedAnalyticsHall.phoneViews) || 0,
                                0
                              ) /
                                maxPhoneViews) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <small>{selectedAnalyticsHall.phoneViews}</small>
                    </div>
                  </div>
                </section>
              ) : null}

              <aside className={styles.adminAnalyticsTopHalls}>
                <div className={styles.adminAnalyticsCardHeader}>
                  <div>
                    <h3>Top halls this month</h3>
                    <p>Highest public engagement in the selected month.</p>
                  </div>
                </div>

                {rankedHallBreakdown.length === 0 ? (
                  <p className={styles.adminAnalyticsEmpty}>
                    No hall activity to rank yet.
                  </p>
                ) : (
                  <div className={styles.adminAnalyticsHallList}>
                    {rankedHallBreakdown.slice(0, 5).map((hall) => (
                      <div key={hall.hallId} className={styles.adminAnalyticsHallRow}>
                        <div>
                          <strong>{hall.hallName}</strong>
                          <span>{hall.vendorName}</span>
                        </div>

                        <div className={styles.adminAnalyticsHallMeta}>
                          <small>{hall.hallViews} clicks</small>
                          <small>{hall.phoneViews} phone views</small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </aside>
            </div>
          </div>
        </section>
      </div>

    
    </div>
  );
}
