"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();

    window.location.href = "/login";
  }

  return (
    <Button onClick={handleLogout} variant="secondary">
      Keluar
    </Button>
  );
}
