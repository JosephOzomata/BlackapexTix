import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MailCheck, MailX, Loader2 } from "lucide-react";
import { authService } from "../../services/auth.service";
import { useSeo } from "../../hooks/useSeo";
import { ROUTES } from "../../constants/routes";
import { Button } from "../../components/common/Button";

export default function VerifyEmailPage() {
  useSeo({ title: "Verify your email" });
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState("loading");

  useEffect(() => {
    if (!token) {
      setState("invalid");
      return;
    }
    (async () => {
      const res = await authService.verifyEmail({ token });
      setState(res.success ? "success" : "invalid");
    })();
  }, [token]);

  return (
    <div className="min-h-[80dvh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
        {state === "loading" && (
          <>
            <Loader2 size={32} className="mx-auto animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Verifying your email…</p>
          </>
        )}
        {state === "success" && (
          <>
            <div className="mx-auto h-14 w-14 rounded-full bg-success/15 flex items-center justify-center mb-4">
              <MailCheck size={24} className="text-success" />
            </div>
            <h1 className="text-xl font-bold">Email verified</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your account is now fully activated.
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <Button to={ROUTES.login}>Sign in</Button>
            </div>
          </>
        )}
        {state === "invalid" && (
          <>
            <div className="mx-auto h-14 w-14 rounded-full bg-danger/15 flex items-center justify-center mb-4">
              <MailX size={24} className="text-danger" />
            </div>
            <h1 className="text-xl font-bold">Verification failed</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This verification link is invalid or has expired. You can request a
              new one from your account settings.
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <Button to={ROUTES.login} variant="outline">
                Back to sign in
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}