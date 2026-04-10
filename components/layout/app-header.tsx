"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export function AppHeader() {
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (pathname === "/login" || pathname === "/" || pathname === "/access-denied" || pathname.startsWith("/app")) {
    return null;
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/90 backdrop-blur dark:border-white/15 dark:bg-black/90">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/app" className="text-sm font-semibold">
          SEO Data Platform
        </Link>
        <div className="flex items-center gap-3">
          {email ? (
            <span className="hidden max-w-[200px] truncate text-xs text-black/60 sm:inline dark:text-white/60">
              {email}
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => void signOut()}
            className="rounded-md border border-black/15 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-black/[.04] dark:border-white/20 dark:hover:bg-white/10"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
