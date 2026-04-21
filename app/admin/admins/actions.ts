"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { addAdmin, listAdmins, removeAdmin } from "@/lib/admin-store";
import { logAdminAccess } from "@/lib/admin-access-log";
import { sendAdminInviteEmail } from "@/lib/admin-email";
import { getSessionEmail } from "@/lib/admin-session";
import { signToken } from "@/lib/crypto";

const inviteSchema = z.object({ email: z.email().max(254) });

export async function inviteAdmin(formData: FormData): Promise<void> {
  const session = await getSessionEmail();
  if (!session) return;
  const parsed = inviteSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return;
  const target = parsed.data.email.trim().toLowerCase();

  addAdmin(target, session);
  logAdminAccess(session, `invite:${target}`, null);

  const token = signToken({ purpose: "invite", email: target }, 24 * 60 * 60 * 1000);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
  const url = `${baseUrl}/api/admin/verify?token=${encodeURIComponent(token)}`;
  await sendAdminInviteEmail(target, session, url);

  revalidatePath("/admin/admins");
}

export async function removeAdminAction(formData: FormData): Promise<void> {
  const session = await getSessionEmail();
  if (!session) return;
  const target = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!target) return;
  if (target === session) return; // cannot remove self

  const admins = listAdmins();
  const actives = admins.filter((a) => a.status === "active");
  if (actives.length === 1 && actives[0].email === target) return; // never leave zero admins

  removeAdmin(target);
  logAdminAccess(session, `remove:${target}`, null);
  revalidatePath("/admin/admins");
}
