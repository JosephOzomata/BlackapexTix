import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Ticket, Mail, Lock, LogIn } from "lucide-react";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { FormError } from "../../components/forms/FormError";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { useSeo } from "../../hooks/useSeo";
import { ROUTES } from "../../constants/routes";
import { ROLE_HOME } from "../../constants/roles";
import { zEmail } from "../../utils/validators";

const schema = z.object({
  email: zEmail,
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  useSeo({ title: "Sign in" });
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { signIn } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    const res = await signIn(values);
    if (res.success) {
      toast.success("Welcome back!");
      const from = location.state?.from;
      const role = res.data?.user?.role;
      navigate(from ?? ROLE_HOME[role] ?? ROUTES.home, { replace: true });
    } else {
      setError("root", { message: res.message ?? "Incorrect email or password." });
    }
  };

  return (
    <div className="min-h-[80dvh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center gap-2 justify-center mb-8">
          <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Ticket size={20} className="text-white" />
          </span>
          <span className="font-extrabold text-xl">TicketHub</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to access your tickets and dashboard.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              leftIcon={<Mail size={14} />}
              error={errors.email?.message}
              required
              {...register("email")}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              leftIcon={<Lock size={14} />}
              error={errors.password?.message}
              required
              {...register("password")}
            />

            <div className="flex items-center justify-between">
              <Link
                to={ROUTES.forgotPassword}
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {errors.root && <FormError>{errors.root.message}</FormError>}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={isSubmitting}
              leftIcon={<LogIn size={16} />}
            >
              Sign in
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to={ROUTES.register} className="text-primary font-medium hover:underline">
              Create one
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-[11px] text-subtle text-center mb-2">
              Demo accounts (mock backend)
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <DemoCred label="Super Admin" email="admin@tickethub.ng" pw="Admin@1234" />
              <DemoCred label="Organizer" email="tunde@eclipse.ng" pw="Organizer@123" />
              <DemoCred label="Scanner" email="scanner1@tickethub.ng" pw="Scanner@123" />
              <DemoCred label="Customer" email="ifeoma@example.com" pw="Customer@123" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function DemoCred({ label, email, pw }) {
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(`${email} / ${pw}`).catch(() => {});
      }}
      className="rounded-lg border border-border bg-card-elevated p-2 text-left hover:border-border-strong transition-colors"
      title="Click to copy"
    >
      <div className="font-semibold text-foreground">{label}</div>
      <div className="text-muted-foreground truncate">{email}</div>
    </button>
  );
}