"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTaskAction } from "@/app/actions";

export default function AddTaskModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function closeModal() {
    setOpen(false);
    setError("");
  }

  function handleSubmit(formData: FormData) {
    setError("");

    startTransition(async () => {
      const result = await createTaskAction(formData);

      if (result?.error) {
        setError(result.error);
        return;
      }

      closeModal();
      router.refresh();
    });
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-primary">
        Tambah task
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/58 px-4 py-8 backdrop-blur-sm">
          <div className="mx-auto my-auto form-card surface-strong w-full max-w-3xl max-h-[92vh] overflow-y-auto p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="hero-label">Task creator</p>
                <h2 className="mt-3 text-3xl font-black">Tambah agenda baru</h2>
                <p className="section-copy">
                  Simpan task, project, event, atau reminder dalam satu tempat.
                </p>
              </div>

              <button type="button" onClick={closeModal} className="btn-secondary">
                Tutup
              </button>
            </div>

            <form action={handleSubmit} className="inline-form mt-8">
              <div className="field">
                <label htmlFor="task-title">Judul</label>
                <input
                  id="task-title"
                  name="title"
                  type="text"
                  required
                  placeholder="Contoh: Review desain atau booking makan malam"
                  className="field-input"
                />
              </div>

              <div className="field">
                <label htmlFor="task-description">Deskripsi</label>
                <textarea
                  id="task-description"
                  name="description"
                  placeholder="Tambahkan catatan singkat biar jelas saat dibuka lagi."
                  className="field-textarea"
                />
              </div>

              <div className="field-group two-col">
                <div className="field">
                  <label htmlFor="task-type">Jenis task</label>
                  <select
                    id="task-type"
                    name="task_type"
                    defaultValue="task"
                    className="field-select"
                  >
                    <option value="task">Task</option>
                    <option value="daily">Daily</option>
                    <option value="project">Project</option>
                    <option value="event">Event</option>
                    <option value="reminder">Reminder</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="task-priority">Prioritas</label>
                  <select
                    id="task-priority"
                    name="priority"
                    defaultValue="medium"
                    className="field-select"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="field-group two-col">
                <div className="field">
                  <label htmlFor="task-due-date">Tanggal dan jam</label>
                  <input
                    id="task-due-date"
                    name="due_date"
                    type="datetime-local"
                    className="field-input"
                  />
                </div>

                <div className="field">
                  <label htmlFor="task-reminder">Reminder sebelum deadline</label>
                  <input
                    id="task-reminder"
                    name="reminder_days"
                    type="number"
                    min="0"
                    placeholder="Misal 1 atau 2"
                    className="field-input"
                  />
                </div>
              </div>

              <input type="hidden" name="status" value="todo" />

              {error ? (
                <div className="rounded-[22px] border border-[color:var(--card-border)] bg-[color:var(--accent-soft)] px-4 py-3 text-sm">
                  {error}
                </div>
              ) : null}

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Batal
                </button>
                <button type="submit" disabled={pending} className="btn-primary">
                  {pending ? "Menyimpan..." : "Simpan task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
