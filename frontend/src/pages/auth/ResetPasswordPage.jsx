import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Lock, ArrowLeft, KeyRound } from "lucide-react";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { FormError } from "../../components/forms/FormError";
import { authService } from "../../services/auth.service";
import { useToast } from "../../hooks/useToast";
import { useSeo } from "../../hooks/useSeo";
import { ROUTES } from "../../constants/routes";
import { zPassword } from "../../utils/validators";

const schema = z
  .object({
    password: zPassword,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function ResetPasswordPage() {
  useSeo({ title: "Reset password" });
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const navigate = useNavigate();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ confirmPassword, ...values }) => {
    const res = await authService.resetPassword({ token, ...values });
    if (res.success) {
      toast.success("Password updated. You can sign in now.");
      navigate(ROUTES.login, { replace: true });
    } else {
      setError("root", { message: res.message ?? "This link is invalid or expired." });
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
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <Link
            to={ROUTES.login}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft size={12} /> Back to sign in
          </Link>

          <h1 className="text-2xl font-bold text-foreground">Set a new password</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a strong password you haven't used before.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <Input
              label="New password"
              type="password"
              placeholder="At least 8 characters"
              leftIcon={<Lock size={14} />}
              error={errors.password?.message}
              required
              {...register("password")}
            />
            <Input
              label="Confirm new password"
              type="password"
              placeholder="Repeat your password"
              leftIcon={<Lock size={14} />}
              error={errors.confirmPassword?.message}
              required
              {...register("confirmPassword")}
            />
            {errors.root && <FormError>{errors.root.message}</FormError>}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={isSubmitting}
              leftIcon={<KeyRound size={16} />}
            >
              Update password
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}