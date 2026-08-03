import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { requestOtp, verifyOtp } from "@/lib/otp.functions";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Login with mobile OTP · AP MSME DPR Portal" },
      { name: "description", content: "Andhra Pradesh MSME entrepreneurs sign in with a 10-digit mobile number and a one-time code to build and download their project report." },
      { property: "og:title", content: "Login with mobile OTP · AP MSME DPR Portal" },
      { property: "og:description", content: "Passwordless mobile login for AP MSME entrepreneurs." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const sendOtp = useServerFn(requestOtp);
  const checkOtp = useServerFn(verifyOtp);

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"phone" | "code">("phone");
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/dashboard" });
  }, [loading, session, navigate]);

  async function onSend() {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    setBusy(true);
    try {
      const res = await sendOtp({ data: { phone } });
      setDemoCode(res.demoCode);
      setStage("code");
      toast.success("OTP generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send the code");
    } finally {
      setBusy(false);
    }
  }

  async function onVerify() {
    if (!/^\d{6}$/.test(code)) {
      toast.error("Enter the 6-digit code");
      return;
    }
    setBusy(true);
    try {
      const { tokenHash } = await checkOtp({ data: { phone, code } });
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "email" });
      if (error) throw new Error(error.message);
      toast.success("Signed in");
      navigate({ to: "/dashboard" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not verify the code");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-10">
      <div className="paper p-7">
        <span className="chip"><Smartphone className="h-3 w-3" /> Mobile login</span>
        <h1 className="mt-4 text-3xl">
          {stage === "phone" ? "Enter your mobile number" : "Enter the 6-digit code"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {stage === "phone"
            ? "We use your mobile number as your identity on the portal. No password needed."
            : `Code sent for +91 ${phone}. Valid for 5 minutes.`}
        </p>

        {stage === "phone" ? (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="mono rounded-md border border-input bg-secondary px-3 py-2.5 text-sm">+91</span>
              <input
                inputMode="numeric"
                autoFocus
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && onSend()}
                placeholder="9876543210"
                className="mono w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm tracking-[0.14em] outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              onClick={onSend}
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm text-primary-foreground disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Send OTP
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <input
              inputMode="numeric"
              autoFocus
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && onVerify()}
              placeholder="000000"
              className="mono w-full rounded-md border border-input bg-card px-3 py-3 text-center text-2xl tracking-[0.4em] outline-none focus:ring-2 focus:ring-ring"
            />
            {demoCode && (
              <div className="rounded-md border border-dashed border-[color:var(--clay)] bg-secondary p-3 text-xs">
                <span className="text-muted-foreground">Demo mode (no SMS gateway connected): your code is </span>
                <span className="mono text-base text-[color:var(--clay)]">{demoCode}</span>
              </div>
            )}
            <button
              onClick={onVerify}
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm text-primary-foreground disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Verify & continue
            </button>
            <button
              onClick={() => { setStage("phone"); setCode(""); setDemoCode(null); }}
              className="w-full text-xs text-muted-foreground underline"
            >
              Change number
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
