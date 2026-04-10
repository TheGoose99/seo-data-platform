"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Hash, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const nav = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/clients", label: "Clients", icon: Users },
  { href: "/app/keywords", label: "Keywords", icon: Hash },
];

export function AdminShell(props: { children: React.ReactNode; userEmail: string | null }) {
  const pathname = usePathname();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="flex min-h-[calc(100vh-0px)] flex-col bg-slate-950 text-slate-100 md:flex-row-reverse">
      <aside className="flex shrink-0 flex-col border-b border-slate-800 md:w-56 md:border-b-0 md:border-l">
        <div className="border-b border-slate-800 px-4 py-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">CloseBy</div>
          <div className="mt-1 text-sm font-medium text-slate-200">Admin</div>
        </div>
        <nav className="flex flex-1 flex-row gap-1 overflow-x-auto px-2 py-3 md:flex-col md:overflow-visible">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/app" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-800 p-3">
          {props.userEmail ? (
            <p className="mb-3 truncate px-1 text-xs text-slate-500" title={props.userEmail}>
              {props.userEmail}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => void signOut()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-900"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Sign out
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">{props.children}</div>
    </div>
  );
}
