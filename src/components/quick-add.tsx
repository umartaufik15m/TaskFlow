"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CREATE_OPTIONS = [
  { href: "/tasks#new-task", label: "Task", caption: "Yang mau gue kerjain" },
  { href: "/goals#new-goal", label: "Goal", caption: "Target yang mau gue capai" },
  { href: "/notes#new-note", label: "Note", caption: "Ide atau catatan bebas" },
  { href: "/money#new-transaction", label: "Transaction", caption: "Uang masuk atau keluar" },
  { href: "/money#new-debt", label: "Debt", caption: "Hutang dan pembayarannya" },
];

export default function QuickAdd() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      <button type="button" className="quick-add-trigger" onClick={() => setOpen(true)}>
        <span>+</span> Tambah
      </button>

      {open ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
          <section
            className="quick-add-modal surface-strong"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-add-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="section-heading-row">
              <div>
                <p className="hero-label">Quick capture</p>
                <h2 id="quick-add-title" className="section-title">Mau nyatet apa?</h2>
              </div>
              <button type="button" className="icon-button" onClick={() => setOpen(false)} aria-label="Tutup">
                ×
              </button>
            </div>
            <div className="quick-add-grid">
              {CREATE_OPTIONS.map((option, index) => (
                <Link
                  key={option.href}
                  href={option.href}
                  className="quick-add-option"
                  onClick={() => setOpen(false)}
                >
                  <span>0{index + 1}</span>
                  <strong>{option.label}</strong>
                  <small>{option.caption}</small>
                </Link>
              ))}
            </div>
            <p className="quick-add-shortcut">Ctrl/⌘ + K untuk buka cepat</p>
          </section>
        </div>
      ) : null}
    </>
  );
}
