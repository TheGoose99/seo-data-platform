"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

function isProtectedPath(pathname: string) {
  return (
    pathname.startsWith("/org") ||
    pathname.startsWith("/clients") ||
    pathname.startsWith("/dashboard")
  );
}

/**
 * Supabase auth uses HTTP-only cookies via @supabase/ssr; the proxy refreshes sessions on navigation.
 * This client listens for sign-out and missing sessions on protected routes so the UI returns to login
 * when refresh tokens expire or are revoked.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        if (pathname !== "/login") {
          window.location.href = "/login";
        }
        return;
      }
      if (event === "INITIAL_SESSION" && !session && isProtectedPath(pathname)) {
        window.location.href = "/login";
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname]);

  useEffect(() => {
    const supabase = createClient();
    const onVis = () => {
      if (document.visibilityState === "visible" && isProtectedPath(window.location.pathname)) {
        void supabase.auth.getSession();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return <>{children}</>;
}
