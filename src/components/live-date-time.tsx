"use client";

import { useEffect, useState } from "react";

const DAYS = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export default function LiveDateTime() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => window.clearInterval(timer);
  }, []);

  const dateLabel = `${DAYS[now.getDay()]}, ${now.getDate()} ${
    MONTHS[now.getMonth()]
  } ${now.getFullYear()}`;
  const timeLabel = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="mt-4 grid gap-1">
      <span className="text-sm text-[color:var(--muted)]">{dateLabel}</span>
      <strong className="text-4xl font-black tracking-[0.05em] md:text-5xl">
        {timeLabel.toUpperCase()}
      </strong>
    </div>
  );
}
