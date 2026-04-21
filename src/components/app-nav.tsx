"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/today", label: "Today" },
  { href: "/planner", label: "Planner" },
  { href: "/focus", label: "Focus" },
  { href: "/settings", label: "Settings" },
];

export default function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="app-nav">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={isActive ? "app-nav-link is-active" : "app-nav-link"}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
