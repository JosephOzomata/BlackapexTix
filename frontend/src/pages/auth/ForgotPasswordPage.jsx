import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Send, MailCheck } from "lucide-react";
import { useState } from "react";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { authService } from "../../services/auth.service";
import { useSeo } from "../../hooks/useSeo";
import { ROUTES } from "../../constants/routes";
import { zEmail } from "../../utils/validators";

const schema = z.object({ email: zEmail });

export default function ForgotPasswordPage() {
  useSeo({ title: "Reset your password" });
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    await authService.forgotPassword(values);
    setSent(true);
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

          {sent ? (
            <div className="text-center py-4">
              <div className="mx-auto h-14 w-14 rounded-full bg-success/15 flex items-center justify-center mb-4">
                <MailCheck size={24} className="text-success" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Check your inbox</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                If an account exists for{" "}
                <span className="text-foreground font-medium">{getValues("email")}</span>,
                we've sent password reset instructions.
              </p>
              <Button
                to={ROUTES.login}
                variant="outline"
                className="mt-6"
              >
                Return to sign in
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-foreground">Forgot your password?</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Enter your email and we'll send you a link to reset it.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  leftIcon={<Mail size={14} />}
                  error={errors.email?.message}
                  required
                  {...register("email")}
                />
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  loading={isSubmitting}
                  leftIcon={<Send size={16} />}
                >
                  Send reset link
                </Button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}