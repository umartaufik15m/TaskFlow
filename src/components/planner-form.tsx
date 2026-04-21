"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTaskAction } from "@/app/actions";
import type { CategoryRecord, CompanyRecord, TaskPriority } from "@/lib/taskflow";

type PlannerFormProps = {
  companies: CompanyRecord[];
  categories: CategoryRecord[];
};

export default function PlannerForm({ companies, categories }: PlannerFormProps) {
  const router = useRouter();
  const [scope, setScope] = useState<"work" | "personal">("work");
  const [hasDeadline, setHasDeadline] = useState(true);
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function getActionError(result: unknown) {
    if (!result || typeof result !== "object" || !("error" in result)) {
      return "";
    }

    return typeof result.error === "string" ? result.error : "";
  }

  const workCategories = useMemo(
    () => categories.filter((item) => item.domain === "work"),
    [categories]
  );
  const personalCategories = useMemo(
    () => categories.filter((item) => item.domain === "personal"),
    [categories]
  );

  function handleSubmit(formData: FormData) {
    setError("");

    startTransition(async () => {
      const result = await createTaskAction(formData);
      const actionError = getActionError(result);

      if (actionError) {
        setError(actionError);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="section-card surface-strong planner-form-card">
      <div className="space-y-1.5">
        <p className="hero-label">Planner</p>
        <h2 className="section-title">Buat rencana kerja baru</h2>
      </div>

      <form action={handleSubmit} className="inline-form mt-8">
        <div className="field">
          <label>Jenis aktivitas</label>
          <div className="scope-switch">
            <button
              type="button"
              onClick={() => {
                setScope("work");
                setHasDeadline(true);
              }}
              className={scope === "work" ? "theme-pill is-active" : "theme-pill"}
            >
              <span>Kerja</span>
              <small>Untuk perusahaan atau workspace</small>
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
              <small>Untuk tugas, hobi, atau agenda pribadi</small>
            </button>
          </div>
          <input type="hidden" name="scope" value={scope} />
          <input type="hidden" name="status" value="todo" />
        </div>

        <div className="field-group two-col">
          {scope === "work" ? (
            <div className="field">
              <label htmlFor="planner-company">Perusahaan</label>
              <select key={scope} id="planner-company" name="company_id" className="field-select">
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="field">
            <label htmlFor="planner-category">Kategori</label>
            <select key={scope} id="planner-category" name="category_id" className="field-select">
              {(scope === "work" ? workCategories : personalCategories).length === 0 ? (
                <option value="">Belum ada kategori</option>
              ) : null}
              {(scope === "work" ? workCategories : personalCategories).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="planner-title">Judul</label>
          <input
            id="planner-title"
            type="text"
            name="title"
            required
            placeholder="Contoh: Review campaign Q2 atau latihan gitar"
            className="field-input"
          />
        </div>

        <div className="field">
          <label htmlFor="planner-description">Deskripsi singkat</label>
          <textarea
            id="planner-description"
            name="description"
            className="field-textarea"
            placeholder="Tambahkan konteks singkat biar nanti lebih enak dibaca."
          />
        </div>

        <div className="field-group two-col">
          <div className="field">
            <label htmlFor="planner-priority">Prioritas</label>
            <select
              id="planner-priority"
              name="priority"
              value={priority}
              onChange={(event) => setPriority(event.target.value as TaskPriority)}
              className="field-select"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="planner-scheduled-for">Kapan dilaksanakan</label>
            <input
              id="planner-scheduled-for"
              type="datetime-local"
              name="scheduled_for"
              required
              className="field-input"
            />
          </div>
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
              <span>Task ini punya deadline</span>
            </label>

            {hasDeadline ? (
              <div className="field">
                <label htmlFor="planner-deadline">Deadline</label>
                <input
                  id="planner-deadline"
                  type="datetime-local"
                  name="deadline_at"
                  className="field-input"
                />
              </div>
            ) : null}
          </>
        ) : null}

        {error ? <div className="notice-card is-error">{error}</div> : null}

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={pending} className="btn-primary">
            {pending ? "Menyimpan..." : "Simpan rencana"}
          </button>
        </div>
      </form>
    </div>
  );
}
