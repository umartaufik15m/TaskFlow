"use client";

import { useMemo, useState } from "react";
import type {
  CompanyDistribution,
  DailyCategorySummary,
  MonthlyCompletion,
} from "@/lib/taskflow";

type DashboardReviewProps = {
  monthlyCompletion: MonthlyCompletion[];
  companyDistribution: CompanyDistribution[];
  dailySummaries: DailyCategorySummary[];
};

export default function DashboardReview({
  monthlyCompletion,
  companyDistribution,
  dailySummaries,
}: DashboardReviewProps) {
  const [selectedIndex, setSelectedIndex] = useState(
    Math.max(0, monthlyCompletion.length - 1)
  );

  const selectedMonth = monthlyCompletion[selectedIndex] ?? null;
  const selectedPercent = selectedMonth
    ? selectedMonth.total === 0
      ? 0
      : Math.round((selectedMonth.completed / selectedMonth.total) * 100)
    : 0;

  const companyRows = useMemo(
    () =>
      companyDistribution.map((item) => ({
        ...item,
        percent: item.total === 0 ? 0 : Math.round((item.completed / item.total) * 100),
      })),
    [companyDistribution]
  );

  return (
    <>
      <section className="section-card surface-strong dashboard-spotlight">
        <div className="dashboard-spotlight-head">
          <div>
            <p className="hero-label">Progress bulanan</p>
            <h2 className="dashboard-spotlight-title">
              {selectedMonth ? selectedMonth.label : "Belum ada data bulanan"}
            </h2>
          </div>

          <div className="month-switcher">
            <button
              type="button"
              onClick={() => setSelectedIndex((value) => Math.max(0, value - 1))}
              className="btn-secondary"
              disabled={selectedIndex <= 0}
            >
              Sebelumnya
            </button>
            <button
              type="button"
              onClick={() =>
                setSelectedIndex((value) => Math.min(monthlyCompletion.length - 1, value + 1))
              }
              className="btn-secondary"
              disabled={selectedIndex >= monthlyCompletion.length - 1}
            >
              Berikutnya
            </button>
          </div>
        </div>

        <div className="dashboard-spotlight-body">
          <div
            className="dashboard-ring surface"
            style={{ ["--completion" as string]: String(Math.round((selectedPercent / 100) * 360)) }}
          >
            <div className="dashboard-ring-inner">
              <strong>{selectedPercent}%</strong>
              <span>Selesai</span>
            </div>
          </div>

          <div className="dashboard-month-summary">
            <p className="dashboard-month-line">
              {selectedMonth
                ? `${selectedMonth.completed} dari ${selectedMonth.total} task selesai`
                : "Belum ada task terjadwal di bulan ini."}
            </p>

            <div className="progress-track mt-4">
              <div className="progress-fill" style={{ width: `${selectedPercent}%` }} />
            </div>

            <div className="month-dot-list">
              {monthlyCompletion.map((item, index) => (
                <button
                  key={item.monthKey}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className={index === selectedIndex ? "month-dot is-active" : "month-dot"}
                  aria-label={`Pilih bulan ${item.label}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-card surface-strong">
        <p className="hero-label">Perusahaan / tempat kerja</p>
        <div className="chart-list mt-6">
          {companyRows.length === 0 ? (
            <div className="empty-card surface">
              <p className="text-xl font-bold">Belum ada distribusi kerja.</p>
            </div>
          ) : (
            companyRows.map((item) => (
              <div key={item.companyId} className="chart-row">
                <div className="flex items-center justify-between gap-3">
                  <strong>{item.name}</strong>
                  <span className="section-copy">
                    {item.completed}/{item.total}
                  </span>
                </div>
                <div className="progress-track mt-3">
                  <div className="progress-fill" style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="dashboard-panel-wide">
        <div className="section-card surface-strong">
          <p className="hero-label">Dashboard harian</p>
          <div className="daily-board mt-6">
            {dailySummaries.map((summary) => (
              <div key={summary.dateKey} className="daily-board-card surface">
                <strong>{summary.label}</strong>
                {summary.items.length === 0 ? (
                  <p className="section-copy mt-3">Belum ada aktivitas.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {summary.items.map((item) => {
                      const percent =
                        item.total === 0 ? 0 : Math.round((item.completed / item.total) * 100);

                      return (
                        <div key={item.categoryId}>
                          <div className="flex items-center justify-between gap-3">
                            <span>{item.categoryName}</span>
                            <span className="section-copy">
                              {item.completed}/{item.total}
                            </span>
                          </div>
                          <div className="progress-track mt-2">
                            <div className="progress-fill" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
