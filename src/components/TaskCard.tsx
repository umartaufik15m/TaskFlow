"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteTaskAction,
  startTaskAction,
  toggleTaskAction,
  updateTaskAction,
} from "@/app/actions";
import {
  formatDateTimeLabel,
  getCategoryName,
  getCompanyName,
  getDueState,
  getScopeLabel,
  getStatusLabel,
  toDateTimeInputValue,
  type CategoryRecord,
  type CompanyRecord,
  type TaskRecord,
} from "@/lib/taskflow";

type TaskCardProps = {
  task: TaskRecord;
  companies: CompanyRecord[];
  categories: CategoryRecord[];
  compact?: boolean;
  showStartButton?: boolean;
};

export default function TaskCard({
  task,
  companies,
  categories,
  compact = false,
  showStartButton = false,
}: TaskCardProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [scope, setScope] = useState<"work" | "personal">(task.scope);
  const [hasDeadline, setHasDeadline] = useState(task.has_deadline);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const workCategories = useMemo(
    () => categories.filter((item) => item.domain === "work"),
    [categories]
  );
  const personalCategories = useMemo(
    () => categories.filter((item) => item.domain === "personal"),
    [categories]
  );

  const dueState = getDueState(task);
  const companyLabel = getCompanyName(task, companies);
  const categoryLabel = getCategoryName(task, categories);

  function getActionError(result: unknown) {
    if (!result || typeof result !== "object" || !("error" in result)) {
      return "";
    }

    return typeof result.error === "string" ? result.error : "";
  }

  function runAction(callback: () => Promise<unknown>) {
    setError("");

    startTransition(async () => {
      const result = await callback();
      const actionError = getActionError(result);

      if (actionError) {
        setError(actionError);
        return;
      }

      router.refresh();
    });
  }

  function handleUpdate(formData: FormData) {
    formData.set("scope", scope);
    if (scope !== "work") {
      formData.delete("has_deadline");
      formData.delete("deadline_at");
    }

    runAction(async () => {
      const result = await updateTaskAction(formData);
      const actionError = getActionError(result);

      if (!actionError) {
        setEditing(false);
      }

      return result;
    });
  }

  if (editing) {
    const currentCategories = scope === "work" ? workCategories : personalCategories;

    return (
      <article className={compact ? "task-card surface compact" : "task-card surface"}>
        <form action={handleUpdate} className="inline-form">
          <input type="hidden" name="id" value={task.id} />

          <div className="field">
            <label>Jenis aktivitas</label>
            <div className="scope-switch">
              <button
                type="button"
                onClick={() => {
                  setScope("work");
                  setHasDeadline(task.scope === "work" ? task.has_deadline : true);
                }}
                className={scope === "work" ? "theme-pill is-active" : "theme-pill"}
              >
                <span>Kerja</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setScope("personal");
                  setHasDeadline(false);
                }}
                className={scope === "personal" ? "theme-pill is-active" : "theme-pill"}
              >
                <span>Pribadi</span>
              </button>
            </div>
          </div>

          <div className="field">
            <label htmlFor={`task-title-${task.id}`}>Judul</label>
            <input
              id={`task-title-${task.id}`}
              name="title"
              defaultValue={task.title}
              className="field-input"
              required
            />
          </div>

          <div className="field">
            <label htmlFor={`task-description-${task.id}`}>Deskripsi</label>
            <textarea
              id={`task-description-${task.id}`}
              name="description"
              defaultValue={task.description ?? ""}
              className="field-textarea"
            />
          </div>

          <div className="field-group two-col">
            {scope === "work" ? (
              <div className="field">
                <label htmlFor={`task-company-${task.id}`}>Perusahaan</label>
                <select
                  id={`task-company-${task.id}`}
                  name="company_id"
                  defaultValue={task.company_id ?? companies[0]?.id ?? ""}
                  className="field-select"
                >
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className="field">
              <label htmlFor={`task-category-${task.id}`}>Kategori</label>
              <select
                key={`${task.id}-${scope}`}
                id={`task-category-${task.id}`}
                name="category_id"
                defaultValue={task.category_id ?? currentCategories[0]?.id ?? ""}
                className="field-select"
              >
                {currentCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field-group two-col">
            <div className="field">
              <label htmlFor={`task-priority-${task.id}`}>Prioritas</label>
              <select
                id={`task-priority-${task.id}`}
                name="priority"
                defaultValue={task.priority}
                className="field-select"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor={`task-status-${task.id}`}>Status</label>
              <select
                id={`task-status-${task.id}`}
                name="status"
                defaultValue={task.status}
                className="field-select"
              >
                <option value="todo">To Do</option>
                <option value="progress">In Progress</option>
                <option value="done">Selesai</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor={`task-scheduled-${task.id}`}>Jadwal pelaksanaan</label>
            <input
              id={`task-scheduled-${task.id}`}
              type="datetime-local"
              name="scheduled_for"
              defaultValue={toDateTimeInputValue(task.scheduled_for)}
              className="field-input"
              required
            />
          </div>

          {scope === "work" ? (
            <>
              <label className="checkbox-line">
                <input
                  type="checkbox"
                  name="has_deadline"
                  checked={hasDeadline}
                  onChange={(event) => setHasDeadline(event.target.checked)}
                />
                <span>Punya deadline</span>
              </label>

              {hasDeadline ? (
                <div className="field">
                  <label htmlFor={`task-deadline-${task.id}`}>Deadline</label>
                  <input
                    id={`task-deadline-${task.id}`}
                    type="datetime-local"
                    name="deadline_at"
                    defaultValue={toDateTimeInputValue(task.deadline_at)}
                    className="field-input"
                  />
                </div>
              ) : null}
            </>
          ) : null}

          {error ? <div className="notice-card is-error">{error}</div> : null}

          <div className={compact ? "task-actions task-actions-compact" : "task-actions"}>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setError("");
                setScope(task.scope);
                setHasDeadline(task.has_deadline);
              }}
              className="btn-secondary"
              disabled={pending}
            >
              Batal
            </button>
            <button type="submit" className="btn-primary" disabled={pending}>
              {pending ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </article>
    );
  }

  return (
    <article className={compact ? "task-card surface compact" : "task-card surface"}>
      <div className="task-card-header">
        <div className="space-y-2">
          <p className="task-type">{`${getScopeLabel(task.scope)} - ${categoryLabel}`}</p>
          <h3 className="task-title">{task.title}</h3>
        </div>
        <span className={`task-status status-${task.status}`}>{getStatusLabel(task.status)}</span>
      </div>

      {task.description ? (
        <p className={compact ? "task-description task-description-compact" : "task-description"}>
          {task.description}
        </p>
      ) : null}

      <div className="task-meta">
        <span>{companyLabel}</span>
        <span>{formatDateTimeLabel(task.scheduled_for)}</span>
        {task.scope === "work" && task.has_deadline ? (
          <span>{`Deadline ${formatDateTimeLabel(task.deadline_at)}`}</span>
        ) : null}
      </div>

      {dueState ? (
        <div className={`task-badge tone-${dueState.tone}`}>{dueState.label}</div>
      ) : null}

      {error ? <div className="notice-card is-error">{error}</div> : null}

      <div className={compact ? "task-actions task-actions-compact" : "task-actions"}>
        {showStartButton && task.status !== "progress" ? (
          <button
            type="button"
            onClick={() =>
              runAction(async () => {
                return startTaskAction(task.id);
              })
            }
            className="btn-primary"
            disabled={pending}
          >
            Mulai pekerjaan
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => {
            const fallbackStatus = task.status === "progress" ? "progress" : "todo";

            runAction(async () => {
              return toggleTaskAction(task.id, task.is_completed, fallbackStatus);
            });
          }}
          className="btn-secondary"
          disabled={pending}
        >
          {task.is_completed || task.status === "done" ? "Buka lagi" : "Selesai"}
        </button>

        <button
          type="button"
          onClick={() => {
            setEditing(true);
            setError("");
          }}
          className="btn-secondary"
          disabled={pending}
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() =>
            runAction(async () => {
              return deleteTaskAction(task.id);
            })
          }
          className="btn-secondary"
          disabled={pending}
        >
          Hapus
        </button>
      </div>
    </article>
  );
}
