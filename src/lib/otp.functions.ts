import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const PhoneInput = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
});

const VerifyInput = PhoneInput.extend({
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

function syntheticEmail(phone: string) {
  return `msme${phone}@ap-msme.local`;
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Demo OTP: the code is returned to the caller instead of being sent over SMS. */
export const requestOtp = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PhoneInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { error } = await supabaseAdmin.from("otp_codes").insert({
      phone: data.phone,
      code_hash: await sha256(`${data.phone}:${code}`),
      expires_at: expiresAt,
    });
    if (error) throw new Error(error.message);

    return { sent: true, demoCode: code, expiresAt };
  });

export const verifyOtp = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => VerifyInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const hash = await sha256(`${data.phone}:${data.code}`);

    const { data: rows, error } = await supabaseAdmin
      .from("otp_codes")
      .select("id, expires_at, consumed")
      .eq("phone", data.phone)
      .eq("code_hash", hash)
      .eq("consumed", false)
      .order("created_at", { ascending: false })
      .limit(1);
    if (error) throw new Error(error.message);

    const row = rows?.[0];
    if (!row) throw new Error("That code is not valid. Please request a new one.");
    if (new Date(row.expires_at).getTime() < Date.now()) {
      throw new Error("That code has expired. Please request a new one.");
    }
    await supabaseAdmin.from("otp_codes").update({ consumed: true }).eq("id", row.id);

    const email = syntheticEmail(data.phone);

    // Find or create the auth user for this mobile number.
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("phone", data.phone)
      .maybeSingle();

    let userId = existing?.id ?? null;
    if (!userId) {
      const created = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        password: crypto.randomUUID() + crypto.randomUUID(),
        user_metadata: { phone: data.phone },
      });
      if (created.error && !/already/i.test(created.error.message)) {
        throw new Error(created.error.message);
      }
      userId = created.data?.user?.id ?? null;
    }

    // Mint a one-time link and hand the client its hashed token to open a session.
    const link = await supabaseAdmin.auth.admin.generateLink({ type: "magiclink", email });
    if (link.error) throw new Error(link.error.message);
    const tokenHash = link.data?.properties?.hashed_token;
    if (!tokenHash) throw new Error("Could not start a session. Please try again.");

    if (!userId) userId = link.data?.user?.id ?? null;
    if (userId) {
      await supabaseAdmin
        .from("profiles")
        .upsert({ id: userId, phone: data.phone }, { onConflict: "id" });
    }

    return { tokenHash, phone: data.phone };
  });
