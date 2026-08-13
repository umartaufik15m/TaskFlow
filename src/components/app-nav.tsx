"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/tasks", label: "Tasks" },
  { href: "/goals", label: "Goals" },
  { href: "/notes", label: "Notes" },
  { href: "/money", label: "Money" },
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
