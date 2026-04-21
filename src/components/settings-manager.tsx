"use client";

import { useState, useTransition } from "react";
import {
  createCategoryAction,
  createCompanyAction,
  deleteCategoryAction,
  deleteCompanyAction,
  updateCategoryAction,
  updateCompanyAction,
  updatePasswordAction,
  updateProfileAction,
} from "@/app/actions";
import ThemeToggle from "@/components/ThemeToggle";
import type { CategoryRecord, CompanyRecord } from "@/lib/taskflow";

type SettingsManagerProps = {
  currentUsername: string;
  companies: CompanyRecord[];
  categories: CategoryRecord[];
};

function ActionMessage({ message }: { message: string }) {
  if (!message) {
    return null;
  }

  return <div className="notice-card is-error">{message}</div>;
}

export default function SettingsManager({
  currentUsername,
  companies,
  categories,
}: SettingsManagerProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function runAction(callback: () => Promise<{ error?: string } | void>) {
    setError("");

    startTransition(async () => {
      const result = await callback();
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  const workCategories = categories.filter((item) => item.domain === "work");
  const personalCategories = categories.filter((item) => item.domain === "personal");

  return (
    <div className="settings-grid">
      <div className="section-card surface-strong">
        <h2 className="section-title">Tema</h2>
        <p className="section-copy">Atur tampilan workspace dari sini.</p>
        <div className="mt-6">
          <ThemeToggle />
        </div>
      </div>

      <div className="section-card surface-strong">
        <h2 className="section-title">Perusahaan</h2>
        <p className="section-copy">Kelola daftar tempat kerja atau workspace yang kamu pakai.</p>

        <form
          action={(formData) =>
            runAction(async () => {
              return createCompanyAction(formData);
            })
          }
          className="inline-form mt-6"
        >
          <div className="field">
            <label htmlFor="new-company-name">Tambah perusahaan</label>
            <input id="new-company-name" name="name" className="field-input" />
          </div>
          <button type="submit" disabled={pending} className="btn-primary">
            Tambah perusahaan
          </button>
        </form>

        <div className="settings-list mt-6">
          {companies.map((company) => (
            <form
              key={company.id}
              action={(formData) =>
                runAction(async () => {
                  return updateCompanyAction(formData);
                })
              }
              className="settings-list-item surface"
            >
              <input type="hidden" name="id" value={company.id} />
              <div className="field">
                <label>Nama</label>
                <input name="name" defaultValue={company.name} className="field-input" />
              </div>
              <div className="settings-item-actions">
                <button type="submit" disabled={pending} className="btn-secondary">
                  Simpan
                </button>
                {company.user_id ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      runAction(async () => {
                        return deleteCompanyAction(company.id);
                      })
                    }
                    className="btn-secondary"
                  >
                    Hapus
                  </button>
                ) : (
                  <span className="settings-pill">Bawaan</span>
                )}
              </div>
            </form>
          ))}
        </div>
      </div>

      <div className="section-card surface-strong">
        <h2 className="section-title">Kategori kerja</h2>
        <p className="section-copy">Kategori ini dipakai untuk aktivitas dari perusahaan atau workspace.</p>

        <form
          action={(formData) =>
            runAction(async () => {
              formData.set("domain", "work");
              return createCategoryAction(formData);
            })
          }
          className="inline-form mt-6"
        >
          <div className="field">
            <label htmlFor="new-work-category">Tambah kategori kerja</label>
            <input id="new-work-category" name="name" className="field-input" />
          </div>
          <button type="submit" disabled={pending} className="btn-primary">
            Tambah kategori
          </button>
        </form>

        <div className="settings-list mt-6">
          {workCategories.map((category) => (
            <form
              key={category.id}
              action={(formData) =>
                runAction(async () => {
                  return updateCategoryAction(formData);
                })
              }
              className="settings-list-item surface"
            >
              <input type="hidden" name="id" value={category.id} />
              <input type="hidden" name="domain" value="work" />
              <div className="field">
                <label>Nama</label>
                <input name="name" defaultValue={category.name} className="field-input" />
              </div>
              <div className="settings-item-actions">
                <button type="submit" disabled={pending} className="btn-secondary">
                  Simpan
                </button>
                {category.user_id ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      runAction(async () => {
                        return deleteCategoryAction(category.id);
                      })
                    }
                    className="btn-secondary"
                  >
                    Hapus
                  </button>
                ) : (
                  <span className="settings-pill">Bawaan</span>
                )}
              </div>
            </form>
          ))}
        </div>
      </div>

      <div className="section-card surface-strong">
        <h2 className="section-title">Kategori pribadi</h2>
        <p className="section-copy">Kategori ini dipakai untuk aktivitas non-kerja seperti tugas atau hobi.</p>

        <form
          action={(formData) =>
            runAction(async () => {
              formData.set("domain", "personal");
              return createCategoryAction(formData);
            })
          }
          className="inline-form mt-6"
        >
          <div className="field">
            <label htmlFor="new-personal-category">Tambah kategori pribadi</label>
            <input id="new-personal-category" name="name" className="field-input" />
          </div>
          <button type="submit" disabled={pending} className="btn-primary">
            Tambah kategori
          </button>
        </form>

        <div className="settings-list mt-6">
          {personalCategories.map((category) => (
            <form
              key={category.id}
              action={(formData) =>
                runAction(async () => {
                  return updateCategoryAction(formData);
                })
              }
              className="settings-list-item surface"
            >
              <input type="hidden" name="id" value={category.id} />
              <input type="hidden" name="domain" value="personal" />
              <div className="field">
                <label>Nama</label>
                <input name="name" defaultValue={category.name} className="field-input" />
              </div>
              <div className="settings-item-actions">
                <button type="submit" disabled={pending} className="btn-secondary">
                  Simpan
                </button>
                {category.user_id ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      runAction(async () => {
                        return deleteCategoryAction(category.id);
                      })
                    }
                    className="btn-secondary"
                  >
                    Hapus
                  </button>
                ) : (
                  <span className="settings-pill">Bawaan</span>
                )}
              </div>
            </form>
          ))}
        </div>
      </div>

      <div className="section-card surface-strong">
        <h2 className="section-title">Akun</h2>
        <p className="section-copy">Ubah nama akun dan password dari sini.</p>

        <form
          action={(formData) =>
            runAction(async () => {
              return updateProfileAction(formData);
            })
          }
          className="inline-form mt-6"
        >
          <div className="field">
            <label htmlFor="settings-username">Nama akun</label>
            <input
              id="settings-username"
              name="username"
              defaultValue={currentUsername}
              className="field-input"
            />
          </div>
          <button type="submit" disabled={pending} className="btn-primary">
            Simpan nama akun
          </button>
        </form>

        <form
          action={(formData) =>
            runAction(async () => {
              return updatePasswordAction(formData);
            })
          }
          className="inline-form mt-8"
        >
          <div className="field-group two-col">
            <div className="field">
              <label htmlFor="settings-password">Password baru</label>
              <input id="settings-password" name="password" type="password" className="field-input" />
            </div>
            <div className="field">
              <label htmlFor="settings-password-confirm">Konfirmasi password</label>
              <input
                id="settings-password-confirm"
                name="confirm_password"
                type="password"
                className="field-input"
              />
            </div>
          </div>
          <button type="submit" disabled={pending} className="btn-primary">
            Ganti password
          </button>
        </form>

        <ActionMessage message={error} />
      </div>
    </div>
  );
}
