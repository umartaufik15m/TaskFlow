"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createNoteAction, deleteNoteAction, toggleNotePinAction } from "@/app/personal-actions";
import type { PersonalNote } from "@/lib/personal";

export default function NotesManager({ notes }: { notes: PersonalNote[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const visibleNotes = notes.filter((note) => `${note.title} ${note.content}`.toLowerCase().includes(query.toLowerCase()));

  function runAction(action: () => Promise<unknown>, success: string) {
    setMessage("");
    startTransition(async () => {
      const result = await action();
      if (result && typeof result === "object" && "error" in result && typeof result.error === "string") {
        setMessage(result.error);
        return;
      }
      setMessage(success);
      router.refresh();
    });
  }

  return (
    <div className="notes-layout">
      <section id="new-note" className="section-card surface-strong anchor-section">
        <p className="hero-label">Quick note</p><h2 className="section-title">Tangkap sebelum lupa</h2>
        <form action={(formData) => runAction(() => createNoteAction(formData), "Catatan disimpan.")} className="inline-form mt-6">
          <div className="field"><label htmlFor="note-title">Judul</label><input id="note-title" name="title" className="field-input" placeholder="Judul singkat" required /></div>
          <div className="field"><label htmlFor="note-content">Isi</label><textarea id="note-content" name="content" className="field-textarea note-compose" placeholder="Ide, briefing, link, nomor, apa aja..." /></div>
          <button className="btn-primary" disabled={pending}>Simpan catatan</button>
        </form>
      </section>
      <section className="section-card surface-strong">
        <div className="section-heading-row"><div><p className="hero-label">Second brain mini</p><h2 className="section-title">Semua catatan</h2></div><input value={query} onChange={(event) => setQuery(event.target.value)} className="field-input notes-search" placeholder="Cari catatan..." aria-label="Cari catatan" /></div>
        {message ? <div className="notice-card surface mt-4">{message}</div> : null}
        <div className="notes-grid mt-6">
          {visibleNotes.length === 0 ? <div className="empty-card surface"><strong>Belum ada catatan.</strong><p>Tulis apa pun tanpa harus menentukan kategori.</p></div> : visibleNotes.map((note) => (
            <article key={note.id} className={`note-card ${note.is_pinned ? "is-pinned" : ""}`}>
              <div className="note-card-head"><span>{note.is_pinned ? "PINNED" : new Date(note.updated_at).toLocaleDateString("id-ID")}</span><button type="button" onClick={() => runAction(() => toggleNotePinAction(note.id, note.is_pinned), note.is_pinned ? "Pin dilepas." : "Catatan dipin.")} disabled={pending}>{note.is_pinned ? "Lepas pin" : "Pin"}</button></div>
              <h3>{note.title}</h3><p>{note.content || "Catatan kosong."}</p>
              <button type="button" className="text-button" onClick={() => runAction(() => deleteNoteAction(note.id), "Catatan dihapus.")} disabled={pending}>Hapus</button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
