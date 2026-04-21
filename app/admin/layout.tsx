import Link from "next/link";
import type { ReactNode } from "react";

import { getSessionEmail } from "@/lib/admin-session";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const email = await getSessionEmail();
  if (!email) {
    return (
      <main className="min-h-screen bg-primary-pale/40 px-6">
        <LoginForm />
      </main>
    );
  }
  return (
    <main className="min-h-screen bg-primary-pale/30 px-6 py-10">
      <header className="mx-auto flex max-w-5xl items-center justify-between border-b border-primary-dark/10 pb-4">
        <nav className="flex gap-4 text-sm">
          <Link href="/admin">Übersicht</Link>
          <Link href="/admin/warteliste">Warteliste</Link>
          <Link href="/admin/admins">Admins</Link>
          <Link href="/admin/zugriffsprotokoll">Zugriffsprotokoll</Link>
        </nav>
        <form action="/admin/logout" method="post">
          <span className="mr-3 text-xs text-primary-dark/60">{email}</span>
          <button type="submit" className="text-sm underline">Logout</button>
        </form>
      </header>
      <div className="mx-auto mt-8 max-w-5xl">{children}</div>
    </main>
  );
}
