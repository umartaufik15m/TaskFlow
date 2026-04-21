"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteTaskAction,
  toggleTaskAction,
  updateTaskAction,
} from "@/app/actions";
import {
  formatDateTimeLabel,
  getDueState,
  getStatusLabel,
  getTaskKindLabel,
  toDateTimeInputValue,
  type TaskRecord,
} from "@/lib/taskflow";

function getPriorityClass(priority: TaskRecord["priority"]) {
  if (priority === "high") return "badge is-high";
  if (priority === "medium") return "badge is-medium";
  return "badge is-low";
}

function getStatusClass(status: TaskRecord["status"]) {
  if (status === "done") return "badge is-done";
  if (status === "progress") return "badge is-progress";
  return "badge is-todo";
}

export default function TaskCard({ task }: { task: TaskRecord }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const dueState = getDueState(task);

  function refreshView() {
    router.refresh();
  }

  function handleDelete() {
    setError("");

    startTransition(async () => {
      const result = await deleteTaskAction(task.id);

      if (result?.error) {
        setError(result.error);
        return;
      }

      refreshView();
    });
  }

  function handleToggle() {
    setError("");

    startTransition(async () => {
      const result = await toggleTaskAction(task.id, task.is_completed);

      if (result?.error) {
        setError(result.error);
        return;
      }

      refreshView();
    });
  }

  function handleUpdate(formData: FormData) {
    setError("");

    startTransition(async () => {
      const result = await updateTaskAction(formData);

      if (result?.error) {
        setError(result.error);
        return;
      }

      setIsEditing(false);
      refreshView();
    });
  }

  if (isEditing) {
    return (
      <article className="task-card surface-strong">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="hero-label">Edit task</p>
            <h3 className="mt-3 text-2xl font-black">Rapikan detailnya</h3>
          </div>
          <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">
            Tutup
          </button>
        </div>

        <form action={handleUpdate} className="inline-form mt-8">
          <input type="hidden" name="id" value={task.id} />

          <div className="field">
            <label htmlFor={`title-${task.id}`}>Judul</label>
            <input
              id={`title-${task.id}`}
              name="title"
              defaultValue={task.title}
              required
              className="field-input"
            />
          </div>

          <div className="field">
            <label htmlFor={`description-${task.id}`}>Deskripsi</label>
            <textarea
              id={`description-${task.id}`}
              name="description"
              defaultValue={task.description ?? ""}
              className="field-textarea"
            />
          </div>

          <div className="field-group two-col">
            <div className="field">
              <label htmlFor={`task-type-${task.id}`}>Jenis task</label>
              <select
                id={`task-type-${task.id}`}
                name="task_type"
                defaultValue={task.task_type}
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
              <label htmlFor={`priority-${task.id}`}>Prioritas</label>
              <select
                id={`priority-${task.id}`}
                name="priority"
                defaultValue={task.priority}
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
              <label htmlFor={`status-${task.id}`}>Status</label>
              <select
                id={`status-${task.id}`}
                name="status"
                defaultValue={task.status}
                className="field-select"
              >
                <option value="todo">To do</option>
                <option value="progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor={`reminder-${task.id}`}>Reminder</label>
              <input
                id={`reminder-${task.id}`}
                name="reminder_days"
                type="number"
                min="0"
                defaultValue={task.reminder_days ?? ""}
                placeholder="Hari sebelum deadline"
                className="field-input"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor={`due-date-${task.id}`}>Tanggal dan jam</label>
            <input
              id={`due-date-${task.id}`}
              name="due_date"
              type="datetime-local"
              defaultValue={toDateTimeInputValue(task.due_date)}
              className="field-input"
            />
          </div>

          {error ? (
            <div className="rounded-[22px] border border-[color:var(--card-border)] bg-[color:var(--accent-soft)] px-4 py-3 text-sm">
              {error}
            </div>
          ) : null}

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">
              Batal
            </button>
            <button type="submit" disabled={pending} className="btn-primary">
              {pending ? "Menyimpan..." : "Simpan perubahan"}
            </button>
          </div>
        </form>
      </article>
    );
  }

  return (
    <article className={task.is_completed ? "task-card surface is-done" : "task-card surface"}>
      <div className="task-card-head">
        <div className="min-w-0">
          <span className="task-type">{getTaskKindLabel(task.task_type)}</span>
          <h3 className={task.is_completed ? "task-title is-done" : "task-title"}>
            {task.title}
          </h3>
        </div>

        <div className="badge-row">
          <span className={getPriorityClass(task.priority)}>{task.priority}</span>
          <span className={getStatusClass(task.status)}>{getStatusLabel(task.status)}</span>
        </div>
      </div>

      <p className="task-description">
        {task.description?.trim() || "Belum ada catatan tambahan untuk task ini."}
      </p>

      <div className="task-meta-row">
        <div className="task-meta">
          <span>Tanggal</span>
          <strong>{formatDateTimeLabel(task.due_date)}</strong>
        </div>

        {dueState ? (
          <span className={`due-state is-${dueState.tone}`}>{dueState.label}</span>
        ) : null}
      </div>

      <div className="task-meta-row">
        <div className="task-meta">
          <span>Reminder</span>
          <strong>
            {task.reminder_days === null ? "Tanpa reminder" : `${task.reminder_days} hari`}
          </strong>
        </div>

        <div className="task-meta">
          <span>Selesai</span>
          <strong>{task.is_completed ? "Sudah" : "Belum"}</strong>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-[18px] border border-[color:var(--card-border)] bg-[color:var(--accent-soft)] px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}

      <div className="task-actions">
        <button type="button" onClick={handleToggle} disabled={pending} className="btn-secondary">
          {pending ? "Memproses..." : task.is_completed ? "Buka lagi" : "Tandai selesai"}
        </button>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          disabled={pending}
          className="btn-secondary"
        >
          Edit
        </button>
        <button type="button" onClick={handleDelete} disabled={pending} className="btn-primary">
          Hapus
        </button>
      </div>
    </article>
  );
}
