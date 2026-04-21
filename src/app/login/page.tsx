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

export default function LoginPage() {
  const supabase = useMemo(() => createClient(), []);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const email = toFakeEmail(username);

    if (!email) {
      setError("Nama belum valid.");
      setLoading(false);
      return;
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(`Login gagal: ${loginError.message}`);
      setLoading(false);
      return;
    }

    window.location.href = "/";
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
        <p className="hero-label">Taskflow access</p>
        <h1 className="mt-3 text-5xl font-black leading-none">Masuk ke board kamu</h1>
        <p className="section-copy mt-4">
          Login cukup pakai nama dan sandi. Dibuat simpel supaya cepat masuk.
        </p>

        <form onSubmit={handleLogin} className="inline-form mt-8">
          <div className="field">
            <label htmlFor="username">Nama akun</label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Misal: bosumar"
              className="field-input"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Sandi</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Masukkan sandi"
              className="field-input"
            />
          </div>

          {error ? (
            <div className="rounded-[22px] border border-[color:var(--card-border)] bg-[color:var(--accent-soft)] px-4 py-3 text-sm">
              {error}
            </div>
          ) : null}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Masuk..." : "Login"}
          </button>
        </form>

        <p className="section-copy mt-6">
          Belum punya akun?{" "}
          <Link href="/register" className="font-semibold text-[color:var(--accent-strong)]">
            Daftar di sini
          </Link>
        </p>
      </div>
    </main>
  );
}
