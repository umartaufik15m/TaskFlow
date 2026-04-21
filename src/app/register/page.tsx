"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function toFakeEmail(username: string) {
  const normalized = username
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9._-]/g, "");

  return normalized ? `${normalized}@example.com` : "";
}

export default function RegisterPage() {
  const supabase = useMemo(() => createClient(), []);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session) {
        window.location.href = "/";
        return;
      }

      setChecking(false);
    }

    void checkSession();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  async function handleRegister(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Konfirmasi sandi belum sama.");
      setLoading(false);
      return;
    }

    const email = toFakeEmail(username);

    if (!email) {
      setError("Nama belum valid.");
      setLoading(false);
      return;
    }

    const { error: registerError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (registerError) {
      setError(`Daftar gagal: ${registerError.message}`);
      setLoading(false);
      return;
    }

    window.location.href = "/login";
  }

  if (checking) {
    return (
      <main className="app-shell grid min-h-screen place-items-center">
        <div className="surface-strong w-full max-w-xl rounded-[32px] p-8 text-center">
          Memuat session...
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell grid min-h-screen place-items-center">
      <div className="surface-strong w-full max-w-xl rounded-[34px] p-8 md:p-10">
        <p className="hero-label">Create account</p>
        <h1 className="mt-3 text-5xl font-black leading-none">Bikin akses baru</h1>
        <p className="section-copy mt-4">
          Karena ini dipakai pribadi, proses daftar sengaja dibuat sesingkat mungkin.
        </p>

        <form onSubmit={handleRegister} className="inline-form mt-8">
          <div className="field">
            <label htmlFor="register-name">Nama akun</label>
            <input
              id="register-name"
              type="text"
              required
              minLength={3}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Misal: bosumar"
              className="field-input"
            />
          </div>

          <div className="field-group two-col">
            <div className="field">
              <label htmlFor="register-password">Sandi</label>
              <input
                id="register-password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimal 6 karakter"
                className="field-input"
              />
            </div>

            <div className="field">
              <label htmlFor="register-confirm">Konfirmasi</label>
              <input
                id="register-confirm"
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Ulang sandi"
                className="field-input"
              />
            </div>
          </div>

          {error ? (
            <div className="rounded-[22px] border border-[color:var(--card-border)] bg-[color:var(--accent-soft)] px-4 py-3 text-sm">
              {error}
            </div>
          ) : null}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Mendaftarkan..." : "Daftar"}
          </button>
        </form>

        <p className="section-copy mt-6">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-[color:var(--accent-strong)]">
            Login di sini
          </Link>
        </p>
      </div>
    </main>
  );
}
