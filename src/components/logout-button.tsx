"use client";

import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();

    window.location.href = "/login";
  }

  return (
    <button
      onClick={handleLogout}
      className="btn-secondary"
    >
      Keluar
    </button>
  );
}
